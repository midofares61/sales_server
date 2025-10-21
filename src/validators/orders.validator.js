import { body } from 'express-validator';

export const validateOrder = [
  body('customer_name')
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters')
    .trim(),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Phone number contains invalid characters'),
  
  body('phone_two')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Second phone number must be between 10 and 15 characters')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Second phone number contains invalid characters'),
  
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters')
    .trim(),
  
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City must not exceed 50 characters')
    .trim(),
  
  body('total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total must be a non-negative number'),
  
  body('status')
    .optional()
    .isIn(['pending', 'accept', 'refuse', 'delay'])
    .withMessage('Status must be one of: pending, accept, refuse, delay'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim(),
  
  body('marketer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Marketer ID must be a positive integer'),
  
  body('mandobe_id')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (Number.isInteger(Number(value)) && Number(value) >= 1) return true;
      throw new Error('Mandobe ID must be a positive integer or null');
    }),
  
  body('details')
    .optional()
    .isArray()
    .withMessage('Details must be an array'),
  
  body('details.*.product_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Product ID must be a positive integer'),
  
  body('details.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('details.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number')
];

export const validateOrderUpdate = [
  body('customer_name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters')
    .trim(),
  
  body('phone')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10 and 15 characters')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Phone number contains invalid characters'),
  
  body('phone_two')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Second phone number must be between 10 and 15 characters')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Second phone number contains invalid characters'),
  
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters')
    .trim(),
  
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City must not exceed 50 characters')
    .trim(),
  
  body('total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total must be a non-negative number'),
  
  body('status')
    .optional()
    .isIn(['pending', 'accept', 'refuse', 'delay'])
    .withMessage('Status must be one of: pending, accept, refuse, delay'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
    .trim(),
  
  body('marketer_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Marketer ID must be a positive integer'),
  
  body('mandobe_id')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === undefined) return true;
      if (Number.isInteger(Number(value)) && Number(value) >= 1) return true;
      throw new Error('Mandobe ID must be a positive integer or null');
    }),
  
  body('details')
    .optional()
    .isArray()
    .withMessage('Details must be an array')
];

