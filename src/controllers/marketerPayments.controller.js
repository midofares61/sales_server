import { sequelize, MarketerPayment, Order, Marketer, OrderDetail, Product, Mandobe } from '../models/index.js';
import { successResponse } from '../utils/responseFormatter.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Process bulk marketer payments
 * Accepts array of {order_id, marketer_id, commission}
 * Updates Order.sells to true and creates payment records
 */
export const processBulkPayments = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { payments } = req.body;
    
    if (!Array.isArray(payments) || payments.length === 0) {
      throw new ValidationError('Payments must be a non-empty array');
    }
    
    const results = [];
    const errors = [];
    
    for (const payment of payments) {
      const { order_id, marketer_id, commission, notes } = payment;
      
      // Validate required fields
      if (!order_id || !marketer_id || commission === undefined) {
        errors.push({
          order_id,
          error: 'Missing required fields: order_id, marketer_id, commission'
        });
        continue;
      }
      
      // Check if order exists
      const order = await Order.findByPk(order_id, { transaction: t });
      if (!order) {
        errors.push({ order_id, error: 'Order not found' });
        continue;
      }
      
      // Check if marketer exists
      const marketer = await Marketer.findByPk(marketer_id, { transaction: t });
      if (!marketer) {
        errors.push({ order_id, error: 'Marketer not found' });
        continue;
      }
      
      // Check if already paid
      const existingPayment = await MarketerPayment.findOne({
        where: { order_id },
        transaction: t
      });
      
      if (existingPayment) {
        errors.push({ order_id, error: 'Payment already recorded for this order' });
        continue;
      }
      
      // Create payment record
      const paymentRecord = await MarketerPayment.create({
        order_id,
        marketer_id,
        commission: parseFloat(commission),
        notes: notes || null,
        payment_date: new Date(),
        created_by: req.user?.id
      }, { transaction: t });
      
      // Update order sells status
      await order.update({ sells: true }, { transaction: t });
      
      results.push({
        order_id,
        marketer_id,
        commission: parseFloat(commission),
        payment_id: paymentRecord.id,
        status: 'success'
      });
      
      logger.info(`Marketer payment recorded: Order ${order_id}, Marketer ${marketer_id}, Commission ${commission} by user: ${req.user.name}`);
    }
    
    await t.commit();
    
    return successResponse(res, {
      processed: results.length,
      failed: errors.length,
      results,
      errors
    }, 'Payments processed successfully', 201);
  } catch (e) {
    await t.rollback();
    next(e);
  }
};

/**
 * Get all marketer payments with filters
 * Groups payments by payment_date
 */
export const getMarketerPayments = async (req, res, next) => {
  try {
    const { marketer_id, start_date, end_date } = req.query;
    
    const where = {};
    
    if (marketer_id) {
      where.marketer_id = parseInt(marketer_id);
    }
    
    if (start_date && end_date) {
      where.payment_date = {
        [sequelize.Sequelize.Op.between]: [new Date(start_date), new Date(end_date)]
      };
    } else if (start_date) {
      where.payment_date = {
        [sequelize.Sequelize.Op.gte]: new Date(start_date)
      };
    } else if (end_date) {
      where.payment_date = {
        [sequelize.Sequelize.Op.lte]: new Date(end_date)
      };
    }
    
    const payments = await MarketerPayment.findAll({
      where,
      include: [
        { 
          model: Marketer, 
          as: 'marketer', 
          attributes: ['id', 'name', 'phone'] 
        },
        { 
          model: Order, 
          as: 'order',
          include: [
            { 
              model: OrderDetail, 
              as: 'details',
              include: [
                { 
                  model: Product, 
                  as: 'product',
                  attributes: ['id', 'code', 'name', 'price']
                }
              ]
            },
            { 
              model: Mandobe, 
              as: 'mandobeUser',
              attributes: ['id', 'name', 'phone']
            },
            { 
              model: Marketer, 
              as: 'marketer',
              attributes: ['id', 'name', 'phone']
            }
          ]
        }
      ],
      order: [['payment_date', 'DESC'], ['id', 'ASC']]
    });
    
    // Group by payment_date
    const groupedByDate = {};
    
    payments.forEach(payment => {
      const dateKey = payment.payment_date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          payment_date: payment.payment_date,
          payments: [],
          total_commission: 0,
          count: 0
        };
      }
      
      groupedByDate[dateKey].payments.push(payment);
      groupedByDate[dateKey].total_commission += parseFloat(payment.commission);
      groupedByDate[dateKey].count += 1;
    });
    
    // Convert to array and sort by date descending
    const groupedPayments = Object.values(groupedByDate).sort((a, b) => 
      new Date(b.payment_date) - new Date(a.payment_date)
    );
    
    const totalCommission = payments.reduce((sum, p) => sum + parseFloat(p.commission), 0);
    
    return successResponse(res, {
      grouped_payments: groupedPayments,
      total_payments: payments.length,
      total_groups: groupedPayments.length,
      total_commission: totalCommission
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Get marketer payment statistics
 */
export const getMarketerPaymentStats = async (req, res, next) => {
  try {
    const { marketer_id, month, year } = req.query;
    
    const where = {};
    
    if (marketer_id) {
      where.marketer_id = parseInt(marketer_id);
    }
    
    // Filter by month/year
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.payment_date = { [sequelize.Sequelize.Op.between]: [startDate, endDate] };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      where.payment_date = { [sequelize.Sequelize.Op.between]: [startDate, endDate] };
    }
    
    const payments = await MarketerPayment.findAll({
      where,
      include: [{ model: Marketer, as: 'marketer', attributes: ['id', 'name'] }]
    });
    
    // Group by marketer
    const byMarketer = {};
    payments.forEach(p => {
      const mid = p.marketer_id;
      if (!byMarketer[mid]) {
        byMarketer[mid] = {
          marketer_id: mid,
          marketer_name: p.marketer?.name || '',
          total_commission: 0,
          order_count: 0
        };
      }
      byMarketer[mid].total_commission += parseFloat(p.commission);
      byMarketer[mid].order_count += 1;
    });
    
    const stats = {
      total_payments: payments.length,
      total_commission: payments.reduce((sum, p) => sum + parseFloat(p.commission), 0),
      by_marketer: Object.values(byMarketer)
    };
    
    return successResponse(res, stats);
  } catch (e) {
    next(e);
  }
};

/**
 * Get marketer payments grouped by month
 */
export const getPaymentsByMonth = async (req, res, next) => {
  try {
    const { marketer_id, year } = req.query;
    
    const where = {};
    
    if (marketer_id) {
      where.marketer_id = parseInt(marketer_id);
    }
    
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      where.payment_date = { [sequelize.Sequelize.Op.between]: [startDate, endDate] };
    }
    
    const payments = await MarketerPayment.findAll({
      where,
      include: [
        { 
          model: Marketer, 
          as: 'marketer', 
          attributes: ['id', 'name', 'phone'] 
        },
        { 
          model: Order, 
          as: 'order',
          include: [
            { 
              model: OrderDetail, 
              as: 'details',
              include: [
                { 
                  model: Product, 
                  as: 'product',
                  attributes: ['id', 'code', 'name', 'price']
                }
              ]
            },
            { 
              model: Mandobe, 
              as: 'mandobeUser',
              attributes: ['id', 'name', 'phone']
            },
            { 
              model: Marketer, 
              as: 'marketer',
              attributes: ['id', 'name', 'phone']
            }
          ]
        }
      ],
      order: [['payment_date', 'DESC']]
    });
    
    // Group by month
    const byMonth = {};
    
    payments.forEach(payment => {
      const date = new Date(payment.payment_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format: 2025-09
      
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = {
          month: monthKey,
          monthName: date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' }),
          payments: [],
          totalCommission: 0,
          count: 0
        };
      }
      
      byMonth[monthKey].payments.push(payment);
      byMonth[monthKey].totalCommission += parseFloat(payment.commission);
      byMonth[monthKey].count += 1;
    });
    
    // Convert to array and sort by month descending
    const monthsArray = Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month));
    
    const totalCommission = payments.reduce((sum, p) => sum + parseFloat(p.commission), 0);
    
    return successResponse(res, {
      months: monthsArray,
      totalPayments: payments.length,
      totalCommission
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Delete a payment record (undo payment)
 */
export const deletePayment = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    
    const payment = await MarketerPayment.findByPk(id, { transaction: t });
    if (!payment) {
      await t.rollback();
      throw new NotFoundError('Payment not found');
    }
    
    // Update order sells back to false
    await Order.update(
      { sells: false },
      { where: { id: payment.order_id }, transaction: t }
    );
    
    await payment.destroy({ transaction: t });
    
    await t.commit();
    
    logger.info(`Marketer payment deleted: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, null, 'Payment deleted successfully', 204);
  } catch (e) {
    await t.rollback();
    next(e);
  }
};
