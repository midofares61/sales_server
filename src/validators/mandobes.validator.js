import { body } from 'express-validator';

export const validateMandobe = [
  body('name')
    .notEmpty()
    .withMessage('Mandobe name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Mandobe name must be between 2 and 100 characters')
    .trim(),
  
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim()
];

export const validateMandobeUpdate = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Mandobe name must be between 2 and 100 characters')
    .trim(),
  
  body('phone')
    .optional()
    .trim()
];

