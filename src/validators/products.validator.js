import { body } from 'express-validator';

export const validateProduct = [
  body('code')
    .notEmpty()
    .withMessage('Product code is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Product code must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('Product code can only contain letters, numbers, hyphens, and underscores'),
  
  body('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .trim(),
  
  body('count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Count must be a non-negative integer'),
  
  body('order_by')
    .optional()
    .isInt()
    .withMessage('Order by must be an integer')
];

export const validateProductUpdate = [
  body('code')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Product code must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9\-_]+$/)
    .withMessage('Product code can only contain letters, numbers, hyphens, and underscores'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters')
    .trim(),
  
  body('count')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Count must be a non-negative integer'),
  
  body('order_by')
    .optional()
    .isInt()
    .withMessage('Order by must be an integer')
];

