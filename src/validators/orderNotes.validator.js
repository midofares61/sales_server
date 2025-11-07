import { body, param } from 'express-validator';

export const validateCreateNote = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  
  body('note')
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Note must be between 1 and 5000 characters')
    .trim()
];

export const validateUpdateNote = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  
  param('noteId')
    .notEmpty()
    .withMessage('Note ID is required')
    .isInt({ min: 1 })
    .withMessage('Note ID must be a positive integer'),
  
  body('note')
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Note must be between 1 and 5000 characters')
    .trim()
];

export const validateNoteParams = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isInt({ min: 1 })
    .withMessage('Order ID must be a positive integer'),
  
  param('noteId')
    .notEmpty()
    .withMessage('Note ID is required')
    .isInt({ min: 1 })
    .withMessage('Note ID must be a positive integer')
];

