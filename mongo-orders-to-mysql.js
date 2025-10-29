import 'dotenv/config';
import axios from 'axios';
import { sequelize, Order, OrderDetail, Product, Marketer, Mandobe } from './src/models/index.js';
import stringSimilarity from 'string-similarity';
import { Sequelize } from 'sequelize';

const SOURCE_BASE_URL = process.env.SOURCE_BASE_URL || 'https://brazele.sintac.shop/api';
const SOURCE_TOKEN = process.env.SOURCE_TOKEN || '';
const BATCH_SIZE = parseInt(process.env.IMPORT_BATCH_SIZE || '200', 10);
const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.85'); // 85% تشابه
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '3', 10); // عدد مرات إعادة المحاولة
const RETRY_DELAY = parseInt(process.env.RETRY_DELAY || '5000', 10); // التأخير بين المحاولات (ميلي ثانية)

// إحصائيات الاستيراد
const stats = {
  total: 0,
  imported: 0,
  skipped: 0,
  errors: 0
};

// دالة للانتظار (Sleep)
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// دالة لإعادة الاتصال بقاعدة البيانات
async function reconnectDatabase(retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 محاولة إعادة الاتصال بقاعدة البيانات (${i + 1}/${retries})...`);
      await sequelize.authenticate();
      console.log('✅ تم إعادة الاتصال بنجاح');
      return true;
    } catch (error) {
      console.error(`❌ فشل الاتصال: ${error.message}`);
      if (i < retries - 1) {
        console.log(`⏳ انتظار ${RETRY_DELAY / 1000} ثانية قبل المحاولة التالية...`);
        await sleep(RETRY_DELAY);
      }
    }
  }
  return false;
}

// دالة لتنفيذ عملية مع إعادة المحاولة
async function retryOperation(operation, operationName, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      const isConnectionError = 
        error.name === 'SequelizeDatabaseError' || 
        error.parent?.code === 'ECONNRESET' ||
        error.parent?.code === 'ETIMEDOUT' ||
        error.parent?.code === 'PROTOCOL_CONNECTION_LOST';

      if (isConnectionError && i < retries - 1) {
        console.warn(`⚠️ خطأ في الاتصال أثناء ${operationName}، محاولة ${i + 1}/${retries}`);
        await reconnectDatabase();
        await sleep(1000); // انتظار ثانية إضافية
      } else {
        throw error;
      }
    }
  }
}

// دالة لتطبيع الأسماء (إزالة المسافات الزائدة وتوحيد الحروف)
function normalizeName(name) {
  if (!name) return '';
  return String(name)
    .trim()
    .replace(/\s+/g, ' ') // استبدال المسافات المتعددة بمسافة واحدة
    .toLowerCase();
}

// دالة للبحث الذكي عن اسم متشابه في قائمة
function findSimilarName(searchName, existingNames) {
  if (!searchName || !existingNames || existingNames.length === 0) return null;
  
  const normalizedSearch = normalizeName(searchName);
  const normalizedExisting = existingNames.map(n => normalizeName(n.name));
  
  const matches = stringSimilarity.findBestMatch(normalizedSearch, normalizedExisting);
  
  if (matches.bestMatch.rating >= SIMILARITY_THRESHOLD) {
    return existingNames[matches.bestMatchIndex];
  }
  
  return null;
}

async function ensureMarketerByName(name) {
  if (!name) return null;
  
  return await retryOperation(async () => {
    // البحث عن مسوق بنفس الاسم تماماً
    const exactMatch = await Marketer.findOne({ where: { name } });
    if (exactMatch) return exactMatch.id;
    
    // البحث الذكي عن اسم مشابه
    const allMarketers = await Marketer.findAll({ attributes: ['id', 'name'] });
    const similarMatch = findSimilarName(name, allMarketers);
    
    if (similarMatch) {
      console.log(`✓ وجدت مسوق مشابه: "${name}" ← "${similarMatch.name}"`);
      return similarMatch.id;
    }
    
    // إنشاء مسوق جديد
    console.log(`+ إنشاء مسوق جديد: "${name}"`);
    const [row] = await Marketer.findOrCreate({ where: { name }, defaults: { phone: '' } });
    return row.id;
  }, `البحث عن مسوق: ${name}`);
}

async function ensureMandobeByName(name) {
  if (!name) return null;
  
  return await retryOperation(async () => {
    // البحث عن مندوب بنفس الاسم تماماً
    const exactMatch = await Mandobe.findOne({ where: { name } });
    if (exactMatch) return exactMatch.id;
    
    // البحث الذكي عن اسم مشابه
    const allMandobes = await Mandobe.findAll({ attributes: ['id', 'name'] });
    const similarMatch = findSimilarName(name, allMandobes);
    
    if (similarMatch) {
      console.log(`✓ وجدت مندوب مشابه: "${name}" ← "${similarMatch.name}"`);
      return similarMatch.id;
    }
    
    // إنشاء مندوب جديد
    console.log(`+ إنشاء مندوب جديد: "${name}"`);
    const [row] = await Mandobe.findOrCreate({ where: { name }, defaults: { phone: '' } });
    return row.id;
  }, `البحث عن مندوب: ${name}`);
}

async function ensureMarketerByCode(code) {
  if (code === undefined || code === null || code === '') return null;
  const codeStr = String(code);
  
  return await retryOperation(async () => {
    // البحث عن مسوق بنفس الاسم/الكود تماماً
    const exactMatch = await Marketer.findOne({ where: { name: codeStr } });
    if (exactMatch) return exactMatch.id;
    
    // البحث الذكي عن اسم مشابه
    const allMarketers = await Marketer.findAll({ attributes: ['id', 'name'] });
    const similarMatch = findSimilarName(codeStr, allMarketers);
    
    if (similarMatch) {
      console.log(`✓ وجدت مسوق مشابه: "${codeStr}" ← "${similarMatch.name}"`);
      return similarMatch.id;
    }
    
    // إنشاء مسوق جديد
    console.log(`+ إنشاء مسوق جديد: "${codeStr}"`);
    const [row] = await Marketer.findOrCreate({ where: { name: codeStr }, defaults: { phone: '' } });
    return row.id;
  }, `البحث عن مسوق بالكود: ${codeStr}`);
}

async function ensureProductByCodeOrName({ code, name }) {
  const trimmedName = (typeof name === 'string' ? name.trim() : null) || null;
  const codeStr = (code !== undefined && code !== null) ? String(code) : null;

  return await retryOperation(async () => {
    // البحث بالاسم تماماً أولاً
    if (trimmedName) {
      const byName = await Product.findOne({ where: { name: trimmedName } });
      if (byName) return byName.id;
    }
    
    // البحث بالكود تماماً
    if (codeStr) {
      const byCode = await Product.findOne({ where: { code: codeStr } });
      if (byCode) return byCode.id;
    }
    
    // البحث الذكي عن منتج مشابه بالاسم
    if (trimmedName) {
      const allProducts = await Product.findAll({ attributes: ['id', 'name', 'code'] });
      const similarMatch = findSimilarName(trimmedName, allProducts);
      
      if (similarMatch) {
        console.log(`✓ وجدت منتج مشابه: "${trimmedName}" ← "${similarMatch.name}"`);
        return similarMatch.id;
      }
    }
    
    // إنشاء منتج جديد
    const payload = {
      name: trimmedName || codeStr || 'UNKNOWN',
      code: codeStr || trimmedName || 'UNKNOWN',
      count: 0
    };
    
    try {
      console.log(`+ إنشاء منتج جديد: "${payload.name}"`);
      const created = await Product.create(payload);
      return created.id;
    } catch (e) {
      // في حالة خطأ التكرار في الكود، جلب المنتج الموجود
      if (e && e.name === 'SequelizeUniqueConstraintError' && codeStr) {
        const existing = await Product.findOne({ where: { code: codeStr } });
        if (existing) return existing.id;
      }
      // محاولة أخيرة بالبحث بالاسم
      if (trimmedName) {
        const existingByName = await Product.findOne({ where: { name: trimmedName } });
        if (existingByName) return existingByName.id;
      }
      throw e;
    }
  }, `البحث عن منتج: ${trimmedName || codeStr}`);
}

async function importOrdersChunk(orders) {
  for (const src of orders) {
    const order_code = src.orderCode || src.order_code || String(src._id || src.id);
    
    try {
      // فحص إذا كان الطلب موجود بالفعل
      const existingOrder = await retryOperation(
        async () => await Order.findOne({ where: { order_code } }),
        'فحص الطلب الموجود'
      );
      
      if (existingOrder) {
        stats.skipped++;
        continue; // تخطي الطلب الموجود بالفعل
      }

      // Map fields - adjust according to source schema
      // Marketer is provided via "code" field in source
      const marketerId = await ensureMarketerByCode(src.code);
      const mandobeId = await ensureMandobeByName(src.mandobeName || src.mandobe || null);

      // إنشاء الطلب
      const [order, created] = await retryOperation(async () => {
        return await Order.findOrCreate({
          where: { order_code },
          defaults: {
            customer_name: src.customer_name || src.customerName || src.name || '',
            phone: src.phone || src.phone1 || '',
            phone_two: src.phoneTow || src.phone_two || src.phone2 || null,
            address: src.address || '',
            city: src.city || '',
            date_time: src.dateTime || src.date_time ? new Date(src.dateTime || src.date_time) : null,
            nameAdd: src.nameAdd || null,
            nameEdit: src.nameEdit || null,
            sells: !!src.sells,
            mandobe: !!src.mandobe,
            total: Number(src.total || 0),
            shipping: src.shipping ? Number(src.shipping) : null,
            status: ['pending','accept','refuse','delay'].includes(src.status) ? src.status : 'pending',
            notes: src.notes || null,
            mandobe_id: mandobeId,
            marketer_id: marketerId,
            created_at: src.dateTime || src.date_time ? new Date(src.dateTime || src.date_time) : new Date()
          }
        });
      }, `إنشاء طلب: ${order_code}`);

      // معالجة تفاصيل الطلب
      if (Array.isArray(src.details) && src.details.length) {
        await retryOperation(async () => {
          // حذف التفاصيل القديمة إذا وُجدت
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
        }, `إضافة تفاصيل الطلب: ${order_code}`);
      }

      stats.imported++;
      
    } catch (error) {
      stats.errors++;
      console.error(`❌ خطأ في استيراد الطلب ${order_code}:`, error.message);
      // الاستمرار في استيراد باقي الطلبات
    }
  }
}

async function main() {
  const startTime = Date.now();
  console.log('🚀 بدء استيراد الطلبات...\n');
  
  try {
    // الاتصال بقاعدة البيانات
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');
    
    // جلب الطلبات من المصدر
    console.log('📥 جلب الطلبات من المصدر...');
    const url = `${SOURCE_BASE_URL}/orders`;
    const headers = SOURCE_TOKEN ? { Authorization: `Bearer ${SOURCE_TOKEN}` } : undefined;
    const { data } = await axios.get(url, { headers });
    const allOrders = Array.isArray(data) ? data : (data.items || []);
    
    stats.total = allOrders.length;
    console.log(`✅ تم جلب ${allOrders.length} طلب من المصدر\n`);
    
    // استيراد الطلبات على دفعات
    console.log('⏳ بدء الاستيراد...\n');
    for (let i = 0; i < allOrders.length; i += BATCH_SIZE) {
      const chunk = allOrders.slice(i, i + BATCH_SIZE);
      const currentIndex = i + chunk.length;
      
      console.log(`📦 معالجة دفعة ${Math.floor(i / BATCH_SIZE) + 1} (${i + 1} - ${currentIndex})...`);
      await importOrdersChunk(chunk);
      
      // عرض التقدم
      console.log(`
📊 التقدم: ${currentIndex} / ${allOrders.length} (${Math.round(currentIndex / allOrders.length * 100)}%)
   ✅ مستورد: ${stats.imported}
   ⏭️  متخطى: ${stats.skipped}
   ❌ أخطاء: ${stats.errors}
      `);
    }
    
    // عرض النتائج النهائية
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n═══════════════════════════════════════');
    console.log('🎉 تم الانتهاء من الاستيراد!');
    console.log('═══════════════════════════════════════');
    console.log(`📊 الإحصائيات النهائية:`);
    console.log(`   إجمالي الطلبات: ${stats.total}`);
    console.log(`   ✅ تم استيراده: ${stats.imported}`);
    console.log(`   ⏭️  تم تخطيه (موجود مسبقاً): ${stats.skipped}`);
    console.log(`   ❌ أخطاء: ${stats.errors}`);
    console.log(`   ⏱️  الوقت المستغرق: ${duration} ثانية`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ حدث خطأ أثناء الاستيراد:');
    console.error(error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('👋 تم إغلاق الاتصال بقاعدة البيانات');
  }
}

main().catch(async (e) => {
  console.error('\n💥 فشل الاستيراد:', e.message);
  try { await sequelize.close(); } catch {}
  process.exit(1);
});


