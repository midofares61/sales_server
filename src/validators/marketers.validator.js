import { body } from 'express-validator';

export const validateMarketer = [
  body('name')
    .notEmpty()
    .withMessage('Marketer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Marketer name must be between 2 and 100 characters')
    .trim(),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
];

export const validateMarketerUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Marketer name must be between 2 and 100 characters')
    .trim(),
  
  body('phone')
    .optional()
    .trim()
];

