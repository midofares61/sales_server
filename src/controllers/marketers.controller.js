import { Marketer } from '../models/index.js';
import { successResponse, paginatedResponse } from '../utils/responseFormatter.js';
import { NotFoundError } from '../utils/errors.js';
import { createPaginationMeta } from '../middlewares/pagination.js';
import { SocketEvents, emitEvent } from '../utils/socketEvents.js';
import logger from '../config/logger.js';

export const listMarketers = async (req, res, next) => {
  try {
    const items = await Marketer.findAll({
      order: [['id', 'ASC']]
    });
    
    return successResponse(res, { marketers: items, total: items.length }, 'Marketers retrieved successfully');
  } catch (err) { 
    next(err); 
  }
};

export const createMarketer = async (req, res, next) => {
  try {
    const item = await Marketer.create(req.body);
    
    logger.info(`Marketer created: ${item.id} (${item.name}) by user: ${req.user.name}`);
    
    // Emit socket event with full marketer data
    emitEvent(req.io, SocketEvents.MARKETER_NEW, { 
      marketer: item.toJSON(),
      createdBy: req.user?.name
    });
    
    return successResponse(res, item, 'Marketer created successfully', 201);
  } catch (err) { 
    next(err); 
  }
};

export const updateMarketer = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Get old data
    const oldMarketer = await Marketer.findByPk(id);
    if (!oldMarketer) {
      throw new NotFoundError('Marketer not found');
    }
    
    const oldData = oldMarketer.toJSON();
    
    const [count] = await Marketer.update(req.body, { where: { id } });
    
    const item = await Marketer.findByPk(id);
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
    emitEvent(req.io, SocketEvents.MARKETER_UPDATED, { 
      marketer: newData,
      changes,
      updatedBy: req.user?.name
    });
    
    logger.info(`Marketer updated: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, item, 'Marketer updated successfully');
  } catch (err) { 
    next(err); 
  }
};

export const deleteMarketer = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Get marketer data before deletion
    const marketer = await Marketer.findByPk(id);
    if (!marketer) {
      throw new NotFoundError('Marketer not found');
    }
    
    const marketerData = marketer.toJSON();
    
    const count = await Marketer.destroy({ where: { id } });
    
    // Emit socket event with deleted marketer data
    emitEvent(req.io, SocketEvents.MARKETER_DELETED, { 
      marketer: marketerData,
      deletedBy: req.user?.name
    });
    
    logger.info(`Marketer deleted: ${id} by user: ${req.user.name}`);
    
    return successResponse(res, null, 'Marketer deleted successfully', 204);
  } catch (err) { 
    next(err); 
  }
};