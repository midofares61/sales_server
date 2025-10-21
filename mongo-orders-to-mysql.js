import 'dotenv/config';
import axios from 'axios';
import { sequelize, Order, OrderDetail, Product, Marketer, Mandobe } from './src/models/index.js';

const SOURCE_BASE_URL = process.env.SOURCE_BASE_URL || 'https://brazele.sintac.shop/api';
const SOURCE_TOKEN = process.env.SOURCE_TOKEN || '';
const BATCH_SIZE = parseInt(process.env.IMPORT_BATCH_SIZE || '200', 10);

async function ensureMarketerByName(name) {
  if (!name) return null;
  const [row] = await Marketer.findOrCreate({ where: { name }, defaults: { phone: '' } });
  return row.id;
}

async function ensureMandobeByName(name) {
  if (!name) return null;
  const [row] = await Mandobe.findOrCreate({ where: { name }, defaults: { phone: '' } });
  return row.id;
}

async function ensureMarketerByCode(code) {
  if (code === undefined || code === null || code === '') return null;
  const codeStr = String(code);
  const [row] = await Marketer.findOrCreate({ where: { name: codeStr }, defaults: { phone: '' } });
  return row.id;
}

async function ensureProductByCodeOrName({ code, name }) {
  const trimmedName = (typeof name === 'string' ? name.trim() : null) || null;
  const codeStr = (code !== undefined && code !== null) ? String(code) : null;

  // Prefer match by name first if provided
  if (trimmedName) {
    const byName = await Product.findOne({ where: { name: trimmedName } });
    if (byName) return byName.id;
  }
  // Then try by code if provided
  if (codeStr) {
    const byCode = await Product.findOne({ where: { code: codeStr } });
    if (byCode) return byCode.id;
  }
  // Create new product; ensure unique code (fallback to name)
  const payload = {
    name: trimmedName || codeStr || 'UNKNOWN',
    code: codeStr || trimmedName || 'UNKNOWN',
    count: 0
  };
  try {
    const created = await Product.create(payload);
    return created.id;
  } catch (e) {
    // On unique violation for code, fetch by code and return
    if (e && e.name === 'SequelizeUniqueConstraintError' && codeStr) {
      const existing = await Product.findOne({ where: { code: codeStr } });
      if (existing) return existing.id;
    }
    // As a last resort, try find by name
    if (trimmedName) {
      const existingByName = await Product.findOne({ where: { name: trimmedName } });
      if (existingByName) return existingByName.id;
    }
    throw e;
  }
}

async function importOrdersChunk(orders) {
  for (const src of orders) {
    // Map fields - adjust according to source schema
    // Marketer is provided via "code" field in source
    const marketerId = await ensureMarketerByCode(src.code);
    const mandobeId = await ensureMandobeByName(src.mandobeName || src.mandobe || null);

    // Idempotency: use order_code unique
    const order_code = src.orderCode || src.order_code || String(src._id || src.id);
    const [order] = await Order.findOrCreate({
      where: { order_code },
      defaults: {
        customer_name: src.customer_name || src.customerName || src.name || '',
        phone: src.phone || src.phone1 || '',
        phone_two: src.phoneTow || src.phone_two || src.phone2 || null,
        address: src.address || '',
        city: src.city || '',
        nameAdd: src.nameAdd || null,
        nameEdit: src.nameEdit || null,
        sells: !!src.sells,
        notes: src.notes || null,
        mandobe: !!src.mandobe,
        total: Number(src.total || 0),
        status: ['pending','accept','refuse','delay'].includes(src.status) ? src.status : 'pending',
        mandobe_id: mandobeId,
        marketer_id: marketerId,
        // set created_at to source dateTime if valid
        created_at: src.dateTime ? new Date(src.dateTime) : new Date()
      }
    });

    if (Array.isArray(src.details) && src.details.length) {
      // Replace details to reflect source of truth
      await OrderDetail.destroy({ where: { order_id: order.id } });
      const rows = [];
      for (const d of src.details) {
        const productId = await ensureProductByCodeOrName({ name: d.name ?? null, code: d.code ?? null });
        rows.push({
          order_id: order.id,
          product_id: productId,
          quantity: Number(d.count ?? d.quantity ?? d.qty ?? 1),
          price: Number(d.price || d.unitPrice || 0),
          details: d.details || d.note || null
        });
      }
      if (rows.length) await OrderDetail.bulkCreate(rows);
    }
  }
}

async function main() {
  await sequelize.authenticate();
  const url = `${SOURCE_BASE_URL}/orders`;
  const headers = SOURCE_TOKEN ? { Authorization: `Bearer ${SOURCE_TOKEN}` } : undefined;
  const { data } = await axios.get(url, { headers });
  const allOrders = Array.isArray(data) ? data : (data.items || []);
  console.log(`Fetched ${allOrders.length} source orders`);
  for (let i = 0; i < allOrders.length; i += BATCH_SIZE) {
    const chunk = allOrders.slice(i, i + BATCH_SIZE);
    await importOrdersChunk(chunk);
    console.log(`Imported ${Math.min(i + chunk.length, allOrders.length)} / ${allOrders.length}`);
  }
  console.log('Done.');
  await sequelize.close();
}

main().catch(async (e) => {
  console.error(e);
  try { await sequelize.close(); } catch {}
  process.exit(1);
});


