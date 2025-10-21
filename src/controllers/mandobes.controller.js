import { Mandobe } from '../models/index.js';
import { successResponse, paginatedResponse } from '../utils/responseFormatter.js';
import { NotFoundError } from '../utils/errors.js';
import { createPaginationMeta } from '../middlewares/pagination.js';
import { SocketEvents, emitEvent } from '../utils/socketEvents.js';
import logger from '../config/logger.js';

export const listMandobes = async (req, res, next) => {
  try {
    const items = await Mandobe.findAll({
      order: [['id', 'ASC']]
    });
    
    return successResponse(res, { mandobes: items, total: items.length }, 'Mandobes retrieved successfully');
  } catch (err) { 
    next(err); 
  }
};

export const createMandobe = async (req, res, next) => {
  try {
    const item = await Mandobe.create(req.body);
    
    logger.info(`Mandobe created: ${item.id} (${item.name}) by user: ${req.user.name}`);
    
    // Emit socket event with full mandobe data
    emitEvent(req.io, SocketEvents.MANDOBE_NEW, { 
      mandobe: item.toJSON(),
      createdBy: req.user?.name
    });
    
    return successResponse(res, item, 'Mandobe created successfully', 201);
  } catch (err) { 
    next(err); 
  }
};

export const updateMandobe = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Get old data
    const oldMandobe = await Mandobe.findByPk(id);
    if (!oldMandobe) {
      throw new NotFoundError('Mandobe not found');
    }
    
    const oldData = oldMandobe.toJSON();
    
    const [count] = await Mandobe.update(req.body, { where: { id } });
    
    const item = await Mandobe.findByPk(id);
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
    emitEvent(req.io, SocketEvents.MANDOBE_UPDATED, { 
      mandobe: newData,
      changes,
      updatedBy: req.user?.name
    });
    
    logger.info(`Mandobe updated: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, item, 'Mandobe updated successfully');
  } catch (err) { 
    next(err); 
  }
};

export const deleteMandobe = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Get mandobe data before deletion
    const mandobe = await Mandobe.findByPk(id);
    if (!mandobe) {
      throw new NotFoundError('Mandobe not found');
    }
    
    const mandobeData = mandobe.toJSON();
    
    const count = await Mandobe.destroy({ where: { id } });
    
    // Emit socket event with deleted mandobe data
    emitEvent(req.io, SocketEvents.MANDOBE_DELETED, { 
      mandobe: mandobeData,
      deletedBy: req.user?.name
    });
    
    logger.info(`Mandobe deleted: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, null, 'Mandobe deleted successfully', 204);
  } catch (err) { 
    next(err); 
  }
};