import { body } from 'express-validator';

const productRules = () => [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category')
    .isIn(['Biscuits', 'Chocolate', 'Chips', 'Other'])
    .withMessage('Category must be Biscuits, Chocolate, Chips, or Other'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a non-negative number'),
  body('purchaseDate').isISO8601().withMessage('Purchase date must be a valid date'),
  body('expiryDate').isISO8601().withMessage('Expiry date must be a valid date')
];

export const createProductValidator = productRules();
export const updateProductValidator = productRules().map((rule) => rule.optional());
