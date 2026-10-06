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

const isNumericPrice = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== '' && !Number.isNaN(Number(value));

const batchRules = [
  body('items').isArray({ min: 1, max: 500 }).withMessage('Items must be an array of 1 to 500 items'),
  body('items.*').custom((item: any) => {
    if (item && item.variations !== undefined) {
      if (!Array.isArray(item.variations) || item.variations.length === 0) {
        throw new Error('Variations must be a non-empty array');
      }
      if (!String(item.name ?? '').trim()) throw new Error('Name is required');
      if (!String(item.categoryName ?? '').trim()) throw new Error('Category is required');
      if (!isNumericPrice(item.price)) throw new Error('Price must be a number');
      for (const v of item.variations) {
        if (!String(v?.sku ?? '').trim()) throw new Error('Variation SKU is required');
        if (!String(v?.label ?? '').trim()) throw new Error('Variation label is required');
        if (!isNumericPrice(v?.price)) throw new Error('Variation price must be a number');
      }
      return true;
    }
    if (!String(item?.sku ?? '').trim()) throw new Error('SKU is required');
    if (!String(item?.name ?? '').trim()) throw new Error('Name is required');
    if (!isNumericPrice(item?.price)) throw new Error('Price must be a number');
    if (!String(item?.categoryName ?? '').trim()) throw new Error('Category is required');
    return true;
  }),
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

router.post('/batch', batchRules, validate, catalogProductController.batchUpsert);

export default router;
