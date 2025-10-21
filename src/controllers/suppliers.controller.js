import { Supplier } from '../models/index.js';
import { successResponse, paginatedResponse } from '../utils/responseFormatter.js';
import { NotFoundError } from '../utils/errors.js';
import { createPaginationMeta } from '../middlewares/pagination.js';
import { SocketEvents, emitEvent } from '../utils/socketEvents.js';
import logger from '../config/logger.js';

export const listSuppliers = async (req, res, next) => {
  try {
    const items = await Supplier.findAll({
      order: [['id', 'ASC']]
    });
    
    return successResponse(res, { suppliers: items, total: items.length }, 'Suppliers retrieved successfully');
  } catch (err) { 
    next(err); 
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const item = await Supplier.create(req.body);
    
    logger.info(`Supplier created: ${item.id} (${item.name}) by user: ${req.user.name}`);
    
    // Emit socket event with full supplier data
    emitEvent(req.io, SocketEvents.SUPPLIER_NEW, { 
      supplier: item.toJSON(),
      createdBy: req.user?.name
    });
    
    return successResponse(res, item, 'Supplier created successfully', 201);
  } catch (err) { 
    next(err); 
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Get old data
    const oldSupplier = await Supplier.findByPk(id);
    if (!oldSupplier) {
      throw new NotFoundError('Supplier not found');
    }
    
    const oldData = oldSupplier.toJSON();
    
    const [count] = await Supplier.update(req.body, { where: { id } });
    
    const item = await Supplier.findByPk(id);
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
    emitEvent(req.io, SocketEvents.SUPPLIER_UPDATED, { 
      supplier: newData,
      changes,
      updatedBy: req.user?.name
    });
    
    logger.info(`Supplier updated: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, item, 'Supplier updated successfully');
  } catch (err) { 
    next(err); 
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Get supplier data before deletion
    const supplier = await Supplier.findByPk(id);
    if (!supplier) {
      throw new NotFoundError('Supplier not found');
    }
    
    const supplierData = supplier.toJSON();
    
    const count = await Supplier.destroy({ where: { id } });
    
    // Emit socket event with deleted supplier data
    emitEvent(req.io, SocketEvents.SUPPLIER_DELETED, { 
      supplier: supplierData,
      deletedBy: req.user?.name
    });
    
    logger.info(`Supplier deleted: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, null, 'Supplier deleted successfully', 204);
  } catch (err) { 
    next(err); 
  }
};


