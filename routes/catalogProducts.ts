import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as catalogProductController from '../controllers/catalogProductController';

const router = Router();

const variationRules = [
  body('variations').optional().isArray().withMessage('Variations must be an array'),
  body('variations.*.label').notEmpty().withMessage('Variation label is required'),
  body('variations.*.price').isNumeric().withMessage('Variation price must be a number'),
];

router.use(auth);

router.get('/', catalogProductController.list);
router.get('/:id', catalogProductController.getById);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    ...variationRules,
  ],
  validate,
  catalogProductController.create,
);

router.put('/:id', variationRules, validate, catalogProductController.update);
router.delete('/:id', catalogProductController.remove);

router.post(
  '/batch',
  [
    body('items').isArray({ min: 1, max: 500 }).withMessage('Items must be an array of 1 to 500 items'),
    body('items.*.sku').notEmpty().withMessage('SKU is required'),
    body('items.*.name').notEmpty().withMessage('Name is required'),
    body('items.*.price').isNumeric().withMessage('Price must be a number'),
    body('items.*.categoryName').notEmpty().withMessage('Category is required'),
  ],
  validate,
  catalogProductController.batchUpsert,
);

export default router;
