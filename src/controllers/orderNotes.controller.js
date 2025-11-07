import { OrderNote, Order } from '../models/index.js';
import { successResponse } from '../utils/responseFormatter.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Get all notes for a specific order
 */
export const getOrderNotes = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    
    const notes = await OrderNote.findAll({
      where: { order_id: orderId },
      order: [['created_at', 'DESC']]
    });
    
    return successResponse(res, { notes }, 'Order notes retrieved successfully');
  } catch (e) {
    next(e);
  }
};

/**
 * Get a single note by ID
 */
export const getNoteById = async (req, res, next) => {
  try {
    const { orderId, noteId } = req.params;
    
    const note = await OrderNote.findOne({
      where: { 
        id: noteId,
        order_id: orderId 
      }
    });
    
    if (!note) {
      throw new NotFoundError('Note not found');
    }
    
    return successResponse(res, note, 'Note retrieved successfully');
  } catch (e) {
    next(e);
  }
};

/**
 * Create a new note for an order
 */
export const createOrderNote = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { note } = req.body;
    
    // Check if order exists
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }
    
    if (!note || note.trim() === '') {
      throw new BadRequestError('Note content is required');
    }
    
    const newNote = await OrderNote.create({
      order_id: orderId,
      note: note.trim(),
      created_by: req.user?.name || null
    });
    
    logger.info(`Note created for order ${orderId} by user: ${req.user?.name}`);
    
    return successResponse(res, newNote, 'Note created successfully', 201);
  } catch (e) {
    next(e);
  }
};

/**
 * Update an existing note
 */
export const updateOrderNote = async (req, res, next) => {
  try {
    const { orderId, noteId } = req.params;
    const { note } = req.body;
    
    if (!note || note.trim() === '') {
      throw new BadRequestError('Note content is required');
    }
    
    const existingNote = await OrderNote.findOne({
      where: { 
        id: noteId,
        order_id: orderId 
      }
    });
    
    if (!existingNote) {
      throw new NotFoundError('Note not found');
    }
    
    await existingNote.update({
      note: note.trim(),
      updated_by: req.user?.name || null
    });
    
    logger.info(`Note ${noteId} updated for order ${orderId} by user: ${req.user?.name}`);
    
    return successResponse(res, existingNote, 'Note updated successfully');
  } catch (e) {
    next(e);
  }
};

/**
 * Delete a note
 */
export const deleteOrderNote = async (req, res, next) => {
  try {
    const { orderId, noteId } = req.params;
    
    const note = await OrderNote.findOne({
      where: { 
        id: noteId,
        order_id: orderId 
      }
    });
    
    if (!note) {
      throw new NotFoundError('Note not found');
    }
    
    await note.destroy();
    
    logger.info(`Note ${noteId} deleted from order ${orderId} by user: ${req.user?.name}`);
    
    return successResponse(res, null, 'Note deleted successfully', 204);
  } catch (e) {
    next(e);
  }
};

