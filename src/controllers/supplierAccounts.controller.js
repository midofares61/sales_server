import { sequelize, Supplier, SupplierOrder, SupplierOrderDetail, SupplierPayment, Product, User } from '../models/index.js';
import { successResponse } from '../utils/responseFormatter.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Create supplier order (invoice)
 * Updates product stock and supplier balance
 */
export const createSupplierOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { supplier_id, details, type, notes, date_time } = req.body;
    
    if (!supplier_id || !Array.isArray(details) || details.length === 0) {
      throw new ValidationError('Supplier ID and order details are required');
    }
    
    // Check supplier exists
    const supplier = await Supplier.findByPk(supplier_id, { transaction: t });
    if (!supplier) {
      await t.rollback();
      throw new NotFoundError('Supplier not found');
    }
    
    let orderTotal = 0;
    const orderDetails = [];
    
    // Validate and calculate totals
    for (const detail of details) {
      const { product_id, quantity, price } = detail;
      
      if (!product_id || !quantity || !price) {
        await t.rollback();
        throw new ValidationError('Each detail must have product_id, quantity, and price');
      }
      
      // Check product exists
      const product = await Product.findByPk(product_id, { transaction: t });
      if (!product) {
        await t.rollback();
        throw new ValidationError(`Product ${product_id} not found`);
      }
      
      const itemTotal = parseFloat(quantity) * parseFloat(price);
      orderTotal += itemTotal;
      
      orderDetails.push({
        product_id,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        total: itemTotal
      });
      
      // Update product stock
      const newCount = product.count + parseInt(quantity);
      await product.update({ count: newCount }, { transaction: t });
      
      logger.info(`Product ${product_id} stock updated: ${product.count} -> ${newCount}`);
    }
    
    // Create supplier order
    const order = await SupplierOrder.create({
      supplier_id,
      total: orderTotal,
      status: 'completed',
      type: type || null,
      notes: notes || null,
      date_time: date_time || new Date(),
      created_by: req.user?.id
    }, { transaction: t });
    
    // Create order details
    for (const detail of orderDetails) {
      await SupplierOrderDetail.create({
        supplier_order_id: order.id,
        ...detail
      }, { transaction: t });
    }
    
    // Update supplier balance (add to what we owe)
    const newBalance = parseFloat(supplier.balance) + orderTotal;
    await supplier.update({ balance: newBalance }, { transaction: t });
    
    await t.commit();
    
    // Fetch created order with details
    const createdOrder = await SupplierOrder.findByPk(order.id, {
      include: [
        { 
          model: SupplierOrderDetail, 
          as: 'details',
          include: [{ model: Product, as: 'product', attributes: ['id', 'code', 'name'] }]
        },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'balance'] }
      ]
    });
    
    logger.info(`Supplier order created: ${order.id}, Total: ${orderTotal}, Supplier: ${supplier_id} by user: ${req.user.name}`);
    
    return successResponse(res, createdOrder, 'Supplier order created successfully', 201);
  } catch (e) {
    await t.rollback();
    next(e);
  }
};

/**
 * Get all supplier orders
 */
export const getSupplierOrders = async (req, res, next) => {
  try {
    const { supplier_id, start_date, end_date } = req.query;
    
    const where = {};
    
    if (supplier_id) {
      where.supplier_id = parseInt(supplier_id);
    }
    
    if (start_date && end_date) {
      where.date_time = {
        [sequelize.Sequelize.Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    const orders = await SupplierOrder.findAll({
      where,
      include: [
        { 
          model: SupplierOrderDetail, 
          as: 'details',
          include: [{ model: Product, as: 'product', attributes: ['id', 'code', 'name'] }]
        },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['date_time', 'DESC']]
    });
    
    return successResponse(res, { orders, total: orders.length });
  } catch (e) {
    next(e);
  }
};

/**
 * Add supplier payment
 * Reduces supplier balance
 */
export const addSupplierPayment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { supplier_id, amount, type, note, date_time } = req.body;
    
    if (!supplier_id || !amount) {
      throw new ValidationError('Supplier ID and amount are required');
    }
    
    const supplier = await Supplier.findByPk(supplier_id, { transaction: t });
    if (!supplier) {
      await t.rollback();
      throw new NotFoundError('Supplier not found');
    }
    
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount <= 0) {
      await t.rollback();
      throw new ValidationError('Payment amount must be positive');
    }
    
    // Create payment
    const payment = await SupplierPayment.create({
      supplier_id,
      amount: paymentAmount,
      type: type || null,
      note: note || null,
      date_time: date_time || new Date(),
      created_by: req.user?.id
    }, { transaction: t });
    
    // Update supplier balance (subtract payment)
    const newBalance = parseFloat(supplier.balance) - paymentAmount;
    await supplier.update({ balance: newBalance }, { transaction: t });
    
    await t.commit();
    
    // Fetch created payment with supplier info
    const createdPayment = await SupplierPayment.findByPk(payment.id, {
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'balance'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });
    
    logger.info(`Supplier payment added: ${payment.id}, Amount: ${paymentAmount}, Supplier: ${supplier_id} by user: ${req.user.name}`);
    
    return successResponse(res, createdPayment, 'Payment added successfully', 201);
  } catch (e) {
    await t.rollback();
    next(e);
  }
};

/**
 * Get all supplier payments
 */
export const getSupplierPayments = async (req, res, next) => {
  try {
    const { supplier_id, start_date, end_date } = req.query;
    
    const where = {};
    
    if (supplier_id) {
      where.supplier_id = parseInt(supplier_id);
    }
    
    if (start_date && end_date) {
      where.date_time = {
        [sequelize.Sequelize.Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    const payments = await SupplierPayment.findAll({
      where,
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['date_time', 'DESC']]
    });
    
    return successResponse(res, { payments, total: payments.length });
  } catch (e) {
    next(e);
  }
};

/**
 * Get supplier account statement (transactions)
 * Combines orders and payments in chronological order
 */
export const getSupplierStatement = async (req, res, next) => {
  try {
    const { supplier_id } = req.params;
    const { start_date, end_date } = req.query;
    
    if (!supplier_id) {
      throw new ValidationError('Supplier ID is required');
    }
    
    const supplier = await Supplier.findByPk(supplier_id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }
    
    const where = { supplier_id: parseInt(supplier_id) };
    
    if (start_date && end_date) {
      where.date_time = {
        [sequelize.Sequelize.Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }
    
    // Get orders
    const orders = await SupplierOrder.findAll({
      where,
      include: [
        { 
          model: SupplierOrderDetail, 
          as: 'details',
          include: [{ model: Product, as: 'product', attributes: ['id', 'code', 'name'] }]
        },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });
    
    // Get payments
    const payments = await SupplierPayment.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });
    
    // Combine and format transactions
    const transactions = [];
    
    orders.forEach(order => {
      transactions.push({
        id: order.id,
        type: 'order',
        transaction_type: order.type,
        date_time: order.date_time,
        amount: parseFloat(order.total),
        debit: parseFloat(order.total),
        credit: 0,
        notes: order.notes,
        details: order.details,
        created_by: order.creator?.name
      });
    });
    
    payments.forEach(payment => {
      transactions.push({
        id: payment.id,
        type: 'payment',
        transaction_type: payment.type,
        date_time: payment.date_time,
        amount: parseFloat(payment.amount),
        debit: 0,
        credit: parseFloat(payment.amount),
        note: payment.note,
        created_by: payment.creator?.name
      });
    });
    
    // Sort by date
    transactions.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
    
    // Calculate running balance
    let runningBalance = 0;
    transactions.forEach(t => {
      runningBalance += t.debit - t.credit;
      t.balance = runningBalance;
    });
    
    const totalDebit = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = transactions.reduce((sum, t) => sum + t.credit, 0);
    
    return successResponse(res, {
      supplier: {
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
        current_balance: parseFloat(supplier.balance)
      },
      transactions,
      summary: {
        total_orders: orders.length,
        total_payments: payments.length,
        total_debit: totalDebit,
        total_credit: totalCredit,
        net_balance: totalDebit - totalCredit
      }
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Update supplier order
 */
export const updateSupplierOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { details, type, notes, date_time } = req.body;
    
    const order = await SupplierOrder.findByPk(id, {
      include: [{ model: SupplierOrderDetail, as: 'details' }],
      transaction: t
    });
    
    if (!order) {
      await t.rollback();
      throw new NotFoundError('Order not found');
    }
    
    const supplier = await Supplier.findByPk(order.supplier_id, { transaction: t });
    
    // Revert old order effects
    const oldTotal = parseFloat(order.total);
    
    // Revert product stock for old details
    for (const detail of order.details) {
      const product = await Product.findByPk(detail.product_id, { transaction: t });
      if (product) {
        const newCount = product.count - detail.quantity;
        await product.update({ count: Math.max(0, newCount) }, { transaction: t });
      }
    }
    
    // Delete old details
    await SupplierOrderDetail.destroy({
      where: { supplier_order_id: id },
      transaction: t
    });
    
    // Process new details if provided
    let newTotal = oldTotal;
    if (details && Array.isArray(details) && details.length > 0) {
      newTotal = 0;
      
      for (const detail of details) {
        const { product_id, quantity, price } = detail;
        
        if (!product_id || !quantity || !price) {
          await t.rollback();
          throw new ValidationError('Each detail must have product_id, quantity, and price');
        }
        
        const product = await Product.findByPk(product_id, { transaction: t });
        if (!product) {
          await t.rollback();
          throw new ValidationError(`Product ${product_id} not found`);
        }
        
        const itemTotal = parseFloat(quantity) * parseFloat(price);
        newTotal += itemTotal;
        
        // Create new detail
        await SupplierOrderDetail.create({
          supplier_order_id: id,
          product_id,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          total: itemTotal
        }, { transaction: t });
        
        // Update product stock
        const newCount = product.count + parseInt(quantity);
        await product.update({ count: newCount }, { transaction: t });
      }
    }
    
    // Update order
    await order.update({
      total: newTotal,
      type: type !== undefined ? type : order.type,
      notes: notes !== undefined ? notes : order.notes,
      date_time: date_time !== undefined ? new Date(date_time) : order.date_time
    }, { transaction: t });
    
    // Update supplier balance
    const balanceDiff = newTotal - oldTotal;
    const newBalance = parseFloat(supplier.balance) + balanceDiff;
    await supplier.update({ balance: newBalance }, { transaction: t });
    
    await t.commit();
    
    // Fetch updated order
    const updatedOrder = await SupplierOrder.findByPk(id, {
      include: [
        { 
          model: SupplierOrderDetail, 
          as: 'details',
          include: [{ model: Product, as: 'product', attributes: ['id', 'code', 'name'] }]
        },
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'balance'] }
      ]
    });
    
    logger.info(`Supplier order updated: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, updatedOrder, 'Order updated successfully');
  } catch (e) {
    await t.rollback();
    next(e);
  }
};

/**
 * Delete supplier order (undo)
 */
export const deleteSupplierOrder = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const order = await SupplierOrder.findByPk(id, {
      include: [{ model: SupplierOrderDetail, as: 'details' }],
      transaction: t
    });
    
    if (!order) {
      await t.rollback();
      throw new NotFoundError('Order not found');
    }
    
    // Revert product stock
    for (const detail of order.details) {
      const product = await Product.findByPk(detail.product_id, { transaction: t });
      if (product) {
        const newCount = product.count - detail.quantity;
        await product.update({ count: Math.max(0, newCount) }, { transaction: t });
      }
    }
    
    // Revert supplier balance
    const supplier = await Supplier.findByPk(order.supplier_id, { transaction: t });
    const newBalance = parseFloat(supplier.balance) - parseFloat(order.total);
    await supplier.update({ balance: newBalance }, { transaction: t });
    
    await order.destroy({ transaction: t });
    
    await t.commit();
    
    logger.info(`Supplier order deleted: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, null, 'Order deleted successfully', 204);
  } catch (e) {
    await t.rollback();
    next(e);
  }
};

/**
 * Update supplier payment
 */
export const updateSupplierPayment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { amount, type, note, date_time } = req.body;
    
    const payment = await SupplierPayment.findByPk(id, { transaction: t });
    if (!payment) {
      await t.rollback();
      throw new NotFoundError('Payment not found');
    }
    
    const supplier = await Supplier.findByPk(payment.supplier_id, { transaction: t });
    
    // Revert old payment from balance
    const oldAmount = parseFloat(payment.amount);
    
    // Calculate new amount
    const newAmount = amount !== undefined ? parseFloat(amount) : oldAmount;
    
    if (newAmount <= 0) {
      await t.rollback();
      throw new ValidationError('Payment amount must be positive');
    }
    
    // Update payment
    await payment.update({
      amount: newAmount,
      type: type !== undefined ? type : payment.type,
      note: note !== undefined ? note : payment.note,
      date_time: date_time !== undefined ? new Date(date_time) : payment.date_time
    }, { transaction: t });
    
    // Update supplier balance
    const balanceDiff = oldAmount - newAmount; // If new amount is less, balance increases
    const newBalance = parseFloat(supplier.balance) + balanceDiff;
    await supplier.update({ balance: newBalance }, { transaction: t });
    
    await t.commit();
    
    // Fetch updated payment
    const updatedPayment = await SupplierPayment.findByPk(id, {
      include: [
        { model: Supplier, as: 'supplier', attributes: ['id', 'name', 'balance'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });
    
    logger.info(`Supplier payment updated: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, updatedPayment, 'Payment updated successfully');
  } catch (e) {
    await t.rollback();
    next(e);
  }
};

/**
 * Delete supplier payment (undo)
 */
export const deleteSupplierPayment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const payment = await SupplierPayment.findByPk(id, { transaction: t });
    if (!payment) {
      await t.rollback();
      throw new NotFoundError('Payment not found');
    }
    
    // Revert supplier balance
    const supplier = await Supplier.findByPk(payment.supplier_id, { transaction: t });
    const newBalance = parseFloat(supplier.balance) + parseFloat(payment.amount);
    await supplier.update({ balance: newBalance }, { transaction: t });
    
    await payment.destroy({ transaction: t });
    
    await t.commit();
    
    logger.info(`Supplier payment deleted: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, null, 'Payment deleted successfully', 204);
  } catch (e) {
    await t.rollback();
    next(e);
  }
};
