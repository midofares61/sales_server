import { Product, ProductHistory, sequelize } from '../models/index.js';
import { successResponse, paginatedResponse } from '../utils/responseFormatter.js';
import { NotFoundError } from '../utils/errors.js';
import { createPaginationMeta } from '../middlewares/pagination.js';
import { SocketEvents, emitEvent } from '../utils/socketEvents.js';
import logger from '../config/logger.js';

export const listProducts = async (req, res, next) => {
  try {
    const items = await Product.findAll({
      order: [['order_by', 'ASC'], ['id', 'ASC']]
    });
    
    return successResponse(res, { products: items, total: items.length }, 'Products retrieved successfully');
  } catch (err) { 
    next(err); 
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    
    // Auto-assign order_by if not provided
    if (productData.order_by === undefined || productData.order_by === null) {
      const lastProduct = await Product.findOne({
        order: [['order_by', 'DESC']],
        attributes: ['order_by']
      });
      productData.order_by = lastProduct && lastProduct.order_by ? lastProduct.order_by + 1 : 1;
    }
    
    const item = await Product.create(productData);
    
    logger.info(`Product created: ${item.id} (${item.name}) by user: ${req.user.name}`);
    
    // Emit socket event with full product data
    emitEvent(req.io, SocketEvents.PRODUCT_NEW, { 
      product: item.toJSON(),
      createdBy: req.user?.name
    });
    
    return successResponse(res, item, 'Product created successfully', 201);
  } catch (err) { 
    next(err); 
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Get old data
    const oldProduct = await Product.findByPk(id);
    if (!oldProduct) {
      throw new NotFoundError('Product not found');
    }
    
    const oldData = oldProduct.toJSON();
    
    const [count] = await Product.update(req.body, { where: { id } });
    
    const item = await Product.findByPk(id);
    const newData = item.toJSON();
    
    // Calculate changes
    const changes = {};
    Object.keys(req.body).forEach(key => {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key]
        };
      }
    });
    
    // Emit socket event with full data and changes
    emitEvent(req.io, SocketEvents.PRODUCT_UPDATED, { 
      product: newData,
      changes,
      updatedBy: req.user?.name
    });
    
    logger.info(`Product updated: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, item, 'Product updated successfully');
  } catch (err) { 
    next(err); 
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Get product data before deletion
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    const productData = product.toJSON();
    
    const count = await Product.destroy({ where: { id } });
    
    // Emit socket event with deleted product data
    emitEvent(req.io, SocketEvents.PRODUCT_DELETED, { 
      product: productData,
      deletedBy: req.user?.name
    });
    
    logger.info(`Product deleted: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, null, 'Product deleted successfully', 204);
  } catch (err) { 
    next(err); 
  }
};

export const updateStock = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { delta, note } = req.body;
    
    if (typeof delta !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Delta must be a number',
        timestamp: new Date().toISOString()
      });
    }
    
    const product = await Product.findByPk(id, { transaction: t });
    
    if (!product) {
      await t.rollback();
      throw new NotFoundError('Product not found');
    }
    
    const countBefore = product.count;
    const countAfter = countBefore + delta;
    
    if (countAfter < 0) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock',
        timestamp: new Date().toISOString()
      });
    }
    
    // Update product count
    await product.update({ count: countAfter }, { transaction: t });
    
    // Record history
    await ProductHistory.create({
      product_id: id,
      count_delta: delta,
      count_before: countBefore,
      count_after: countAfter,
      note: note || null,
      date_time: new Date(),
      created_by: req.user?.id || null
    }, { transaction: t });
    
    await t.commit();
    
    // Get updated product data
    const updatedProduct = await Product.findByPk(id);
    
    // Emit socket event with full data and stock changes
    emitEvent(req.io, SocketEvents.PRODUCT_STOCK_UPDATED, { 
      product: updatedProduct.toJSON(),
      changes: {
        count: {
          old: countBefore,
          new: countAfter
        },
        delta: delta
      },
      note: note || null,
      updatedBy: req.user?.name
    });
    
    logger.info(`Product ${id} stock updated: ${countBefore} -> ${countAfter} (delta: ${delta}) by user: ${req.user.name}`);
    
    return successResponse(res, {
      id,
      count: countAfter,
      delta
    }, 'Stock updated successfully');
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

export const getProductHistory = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    const product = await Product.findByPk(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    
    const history = await ProductHistory.findAll({
      where: { product_id: id },
      order: [['date_time', 'DESC']]
    });
    
    const formattedHistory = history.map(h => ({
      id: h.id,
      countDelta: h.count_delta,
      countBefore: h.count_before,
      countAfter: h.count_after,
      note: h.note,
      dateTime: h.date_time,
      createdBy: h.created_by
    }));
    
    return successResponse(res, formattedHistory, 'Product history retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const reorderProduct = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { direction, newPosition, newOrderBy } = req.body;
    
    const currentProduct = await Product.findByPk(id, { transaction: t });
    if (!currentProduct) {
      await t.rollback();
      throw new NotFoundError('Product not found');
    }
    
    const oldOrderBy = currentProduct.order_by || 0;
    
    // NEW: Drag & Drop mode - reorder to specific position
    if (newPosition !== undefined || newOrderBy !== undefined) {
      const targetOrderBy = newOrderBy !== undefined ? newOrderBy : newPosition;
      
      if (typeof targetOrderBy !== 'number' || targetOrderBy < 0) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'newPosition/newOrderBy must be a non-negative number',
          timestamp: new Date().toISOString()
        });
      }
      
      // Get all products ordered by order_by
      const allProducts = await Product.findAll({
        order: [['order_by', 'ASC'], ['id', 'ASC']],
        transaction: t
      });
      
      // Remove current product from list
      const productsWithoutCurrent = allProducts.filter(p => p.id !== parseInt(id));
      
      // Insert current product at new position
      productsWithoutCurrent.splice(targetOrderBy, 0, currentProduct);
      
      // Update order_by for all products
      const updatePromises = productsWithoutCurrent.map((product, index) => {
        return product.update({ order_by: index }, { transaction: t });
      });
      
      await Promise.all(updatePromises);
      await t.commit();
      
      const updatedProduct = await Product.findByPk(id);
      
      // Emit socket event for all products reordered
      emitEvent(req.io, SocketEvents.PRODUCT_UPDATED, { 
        product: updatedProduct.toJSON(),
        changes: {
          order_by: {
            old: oldOrderBy,
            new: updatedProduct.order_by
          }
        },
        reorderType: 'drag-drop',
        updatedBy: req.user?.name
      });
      
      logger.info(`Product ${id} reordered from position ${oldOrderBy} to ${targetOrderBy} by user: ${req.user.name}`);
      
      return successResponse(res, { 
        id, 
        old_position: oldOrderBy,
        new_position: updatedProduct.order_by
      }, 'Product reordered successfully');
    }
    
    // OLD: Up/Down mode - move one step (backward compatible)
    if (!['up', 'down'].includes(direction)) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: 'Please provide either "direction" (up/down) or "newPosition"',
        timestamp: new Date().toISOString()
      });
    }
    
    const currentOrderBy = currentProduct.order_by || 0;
    
    // Find the product to swap with
    let targetProduct;
    if (direction === 'up') {
      targetProduct = await Product.findOne({
        where: {
          order_by: { [sequelize.Sequelize.Op.lt]: currentOrderBy }
        },
        order: [['order_by', 'DESC']],
        transaction: t
      });
    } else {
      targetProduct = await Product.findOne({
        where: {
          order_by: { [sequelize.Sequelize.Op.gt]: currentOrderBy }
        },
        order: [['order_by', 'ASC']],
        transaction: t
      });
    }
    
    if (!targetProduct) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot move ${direction}, already at the ${direction === 'up' ? 'top' : 'bottom'}`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Swap order_by values
    const tempOrderBy = currentProduct.order_by;
    await currentProduct.update({ order_by: targetProduct.order_by }, { transaction: t });
    await targetProduct.update({ order_by: tempOrderBy }, { transaction: t });
    
    await t.commit();
    
    const updatedProduct = await Product.findByPk(id);
    
    // Emit socket event
    emitEvent(req.io, SocketEvents.PRODUCT_UPDATED, { 
      product: updatedProduct.toJSON(),
      changes: {
        order_by: {
          old: tempOrderBy,
          new: updatedProduct.order_by
        }
      },
      reorderType: 'up-down',
      updatedBy: req.user?.name
    });
    
    logger.info(`Product ${id} reordered ${direction} by user: ${req.user.name}`);
    
    return successResponse(res, { 
      id, 
      order_by: updatedProduct.order_by,
      direction 
    }, `Product moved ${direction} successfully`);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};


