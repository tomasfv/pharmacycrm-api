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

export default router;
