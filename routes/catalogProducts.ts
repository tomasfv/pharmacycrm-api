import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as catalogProductController from '../controllers/catalogProductController';

const router = Router();

router.use(auth);

router.get('/', catalogProductController.list);
router.get('/:id', catalogProductController.getById);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('categoryId').notEmpty().withMessage('Category ID is required'),
  ],
  validate,
  catalogProductController.create,
);

router.put('/:id', catalogProductController.update);
router.delete('/:id', catalogProductController.remove);

export default router;
