import { sequelize, Order, OrderDetail, Product, Marketer, Mandobe } from '../models/index.js';
import { Op } from 'sequelize';
import { successResponse, paginatedResponse } from '../utils/responseFormatter.js';
import { NotFoundError } from '../utils/errors.js';
import { createPaginationMeta } from '../middlewares/pagination.js';
import { SocketEvents, emitEvent } from '../utils/socketEvents.js';
import logger from '../config/logger.js';

function mapOrderDetailsToClientShape(details) {
  if (!Array.isArray(details)) return [];
  return details.map(d => ({
    code: d.product?.code ? (isNaN(Number(d.product.code)) ? d.product.code : Number(d.product.code)) : undefined,
    price: Number(d.price ?? 0),
    name: d.product?.name,
    count: Number(d.quantity ?? 0),
    details: d.details ?? null,
    id: d.product?.code ?? String(d.id)
  }));
}

// Removed: generateOrderCode function (order_code system disabled)
// If you need auto-generated order codes in the future, uncomment this function

function mapOrderToClient(o) {
  const plain = o.get({ plain: true });
  return {
    ...plain,
    orderCode: plain.order_code,
    dateTime: plain.created_at,
    total: parseInt(plain.total) || 0,
    details: mapOrderDetailsToClientShape(o.details),
    mandobeName: o.mandobeUser?.name || '',
    code: o.marketer?.name || null,
    mandobeUser: undefined,
    marketer: undefined,
    order_code: undefined,
    date_time: undefined,
    created_at: undefined,
    updated_at: undefined
  };
}

export const listOrders = async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim();
    const { status, city, mandobe_id, mandobeName, marketer_id, code, sells, month, year, sort } = req.query;
    
    const where = {};
    if (q) {
      // Search by customer_name, phone, phone_two, or order_code
      where[Op.or] = [
        { customer_name: { [Op.like]: `%${q}%` } },
        { phone: { [Op.like]: `%${q}%` } },
        { phone_two: { [Op.like]: `%${q}%` } },
        { order_code: { [Op.like]: `%${q}%` } }
      ];
    }
    
    // Filter by status
    if (status && ['pending', 'accept', 'refuse', 'delay'].includes(status)) {
      where.status = status;
    }
    
    // Filter by city
    if (city) {
      where.city = { [Op.like]: `%${city}%` };
    }
    
    // Filter by mandobe
    if (mandobe_id) {
      where.mandobe_id = parseInt(mandobe_id);
    }
    
    // Filter by marketer
    if (marketer_id) {
      where.marketer_id = parseInt(marketer_id);
    }
    
    // Filter by sells (commission payment status)
    if (sells === 'paid') {
      where.sells = true;
    } else if (sells === 'unPaid') {
      where.sells = false;
    }
    
    // Filter by month and year using SQL functions
    if (month) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        sequelize.where(sequelize.fn('MONTH', sequelize.col('created_at')), parseInt(month))
      );
      logger.info(`Filtering by month: ${month}`);
    }
    
    if (year) {
      where[Op.and] = where[Op.and] || [];
      where[Op.and].push(
        sequelize.where(sequelize.fn('YEAR', sequelize.col('created_at')), parseInt(year))
      );
      logger.info(`Filtering by year: ${year}`);
    }
    
    // Determine sort order
    let orderBy = [['id', 'DESC']];
    if (sort === 'dateTime_asc') {
      orderBy = [['created_at', 'ASC']];
    } else if (sort === 'dateTime_desc') {
      orderBy = [['created_at', 'DESC']];
    }
    
    const items = await Order.findAll({
      where,
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ],
      order: orderBy
    });
    
    const payload = items.map(mapOrderToClient);
    
    return successResponse(res, { orders: payload, total: payload.length }, 'Orders retrieved successfully');
  } catch (e) { 
    next(e); 
  }
};

export const createOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { details = [], ...orderData } = req.body;
    
    // Handle orderCode field if provided (optional)
    if (orderData.orderCode) {
      orderData.order_code = orderData.orderCode;
      delete orderData.orderCode;
    }
    
    // Handle dateTime field
    if (orderData.dateTime) {
      orderData.date_time = orderData.dateTime;
      delete orderData.dateTime;
    }
    if (!orderData.date_time) {
      orderData.date_time = new Date();
    }
    
    // Set nameAdd from authenticated user
    if (req.user && !orderData.nameAdd) {
      orderData.nameAdd = req.user.name;
    }
    
    const order = await Order.create(orderData, { transaction: t });
    
    if (details.length) {
      const rows = details.map(d => ({ ...d, order_id: order.id }));
      await OrderDetail.bulkCreate(rows, { transaction: t });
    }
    
    await t.commit();
    
    const created = await Order.findByPk(order.id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    const payload = mapOrderToClient(created);
    
    // Emit socket event with full order data
    emitEvent(req.io, SocketEvents.ORDER_NEW, { 
      order: payload,
      createdBy: req.user?.name
    });
    
    logger.info(`Order created: ${order.id} by user: ${req.user.name}`);
    
    return successResponse(res, payload, 'Order created successfully', 201);
  } catch (e) {
    await t.rollback();
    next(e);
  }
};

export const updateOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { details, ...orderData } = req.body;
    
    // Get old data before update
    const oldOrder = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    if (!oldOrder) { 
      throw new NotFoundError('Order not found'); 
    }
    
    const oldPayload = mapOrderToClient(oldOrder);
    
    // Handle explicit null for mandobe_id (to remove mandobe from order)
    if ('mandobe_id' in orderData && orderData.mandobe_id === null) {
      // Keep null as is, don't filter it out
    }
    
    const [c] = await Order.update(orderData, { where: { id }, transaction: t });
    
    if (Array.isArray(details)) {
      await OrderDetail.destroy({ where: { order_id: id }, transaction: t });
      const rows = details.map(d => ({ ...d, order_id: id }));
      if (rows.length) await OrderDetail.bulkCreate(rows, { transaction: t });
    }
    
    await t.commit();
    
    const updated = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    const payload = mapOrderToClient(updated);
    
    // Calculate changes
    const changes = {};
    Object.keys(orderData).forEach(key => {
      if (oldPayload[key] !== payload[key]) {
        changes[key] = {
          old: oldPayload[key],
          new: payload[key]
        };
      }
    });
    
    if (Array.isArray(details)) {
      changes.details = {
        old: oldPayload.details,
        new: payload.details
      };
    }
    
    // Emit socket event with full data and changes
    emitEvent(req.io, SocketEvents.ORDER_UPDATED, { 
      order: payload,
      changes,
      updatedBy: req.user?.name
    });
    
    logger.info(`Order updated: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, payload, 'Order updated successfully');
  } catch (e) { 
    await t.rollback(); 
    next(e); 
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const order = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    
    const payload = mapOrderToClient(order);
    return successResponse(res, payload, 'Order retrieved successfully');
  } catch (e) {
    next(e);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Get order data before deletion
    const order = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    
    const payload = mapOrderToClient(order);
    
    const c = await Order.destroy({ where: { id } });
    
    // Emit socket event with deleted order data
    emitEvent(req.io, SocketEvents.ORDER_DELETED, { 
      order: payload,
      deletedBy: req.user?.name
    });
    
    logger.info(`Order deleted: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, null, 'Order deleted successfully', 204);
  } catch (e) { 
    next(e); 
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    
    if (!['pending', 'accept', 'refuse', 'delay'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get old data
    const oldOrder = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    if (!oldOrder) {
      throw new NotFoundError('Order not found');
    }
    
    const oldStatus = oldOrder.status;
    
    const [count] = await Order.update(
      { status, nameEdit: req.user?.name },
      { where: { id } }
    );
    
    // Get updated data
    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    const payload = mapOrderToClient(updatedOrder);
    
    // Emit socket event with full data and changes
    emitEvent(req.io, SocketEvents.ORDER_UPDATED, { 
      order: payload,
      changes: {
        status: {
          old: oldStatus,
          new: status
        }
      },
      updatedBy: req.user?.name
    });
    
    logger.info(`Order ${id} status updated to ${status} by user: ${req.user.name}`);
    
    return successResponse(res, { id, status }, 'Order status updated successfully');
  } catch (e) {
    next(e);
  }
};

export const updateOrderMandobe = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { mandobe_id, mandobeName } = req.body;
    
    // Get old data
    const oldOrder = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    if (!oldOrder) {
      throw new NotFoundError('Order not found');
    }
    
    const oldMandobeId = oldOrder.mandobe_id;
    const oldMandobeName = oldOrder.mandobeUser?.name || '';
    
    const updateData = { nameEdit: req.user?.name };
    
    // Support explicit null to remove mandobe
    if (mandobe_id === null) {
      updateData.mandobe_id = null;
    } else if (mandobe_id) {
      updateData.mandobe_id = parseInt(mandobe_id);
    } else if (mandobeName) {
      // Find mandobe by name
      const mandobe = await Mandobe.findOne({ where: { name: mandobeName } });
      if (mandobe) {
        updateData.mandobe_id = mandobe.id;
      }
    }
    
    const [count] = await Order.update(updateData, { where: { id } });
    
    // Get updated data
    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    const payload = mapOrderToClient(updatedOrder);
    
    // Emit socket event with full data and changes
    emitEvent(req.io, SocketEvents.ORDER_UPDATED, { 
      order: payload,
      changes: {
        mandobe_id: {
          old: oldMandobeId,
          new: updateData.mandobe_id
        },
        mandobeName: {
          old: oldMandobeName,
          new: updatedOrder.mandobeUser?.name || ''
        }
      },
      updatedBy: req.user?.name
    });
    
    logger.info(`Order ${id} mandobe updated by user: ${req.user.name}`);
    
    return successResponse(res, { id, mandobe_id: updateData.mandobe_id }, 'Order mandobe updated successfully');
  } catch (e) {
    next(e);
  }
};

export const updateOrderPayment = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { sells } = req.body;
    
    // Get old data
    const oldOrder = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    if (!oldOrder) {
      throw new NotFoundError('Order not found');
    }
    
    const oldSells = oldOrder.sells;
    
    const [count] = await Order.update(
      { sells: Boolean(sells), nameEdit: req.user?.name },
      { where: { id } }
    );
    
    // Get updated data
    const updatedOrder = await Order.findByPk(id, {
      include: [
        { model: Mandobe, as: 'mandobeUser' },
        { model: Marketer, as: 'marketer' },
        { model: OrderDetail, as: 'details', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    const payload = mapOrderToClient(updatedOrder);
    
    // Emit socket event with full data and changes
    emitEvent(req.io, SocketEvents.ORDER_UPDATED, { 
      order: payload,
      changes: {
        sells: {
          old: oldSells,
          new: Boolean(sells)
        }
      },
      updatedBy: req.user?.name
    });
    
    logger.info(`Order ${id} payment status updated by user: ${req.user.name}`);
    
    return successResponse(res, { id, sells }, 'Order payment status updated successfully');
  } catch (e) {
    next(e);
  }
};

export const getOrderStatistics = async (req, res, next) => {
  try {
    const { month, year, city, mandobe_id, marketer_id, status } = req.query;
    
    const where = {};
    
    if (status) where.status = status;
    if (city) where.city = { [Op.like]: `%${city}%` };
    if (mandobe_id) where.mandobe_id = parseInt(mandobe_id);
    if (marketer_id) where.marketer_id = parseInt(marketer_id);
    
    // Filter by month/year
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.date_time = { [Op.between]: [startDate, endDate] };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      where.date_time = { [Op.between]: [startDate, endDate] };
    }
    
    const orders = await Order.findAll({ where });
    
    const stats = {
      total: orders.length,
      totalAmount: orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0),
      byStatus: {
        pending: orders.filter(o => o.status === 'pending').length,
        accept: orders.filter(o => o.status === 'accept').length,
        refuse: orders.filter(o => o.status === 'refuse').length,
        delay: orders.filter(o => o.status === 'delay').length
      },
      byCity: {}
    };
    
    // Group by city
    orders.forEach(o => {
      if (o.city) {
        stats.byCity[o.city] = (stats.byCity[o.city] || 0) + 1;
      }
    });
    
    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (e) {
    next(e);
  }
};

// Removed: getNextOrderCode endpoint (order_code system disabled)


