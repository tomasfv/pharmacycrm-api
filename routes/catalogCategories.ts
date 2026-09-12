import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as catalogCategoryController from '../controllers/catalogCategoryController';

const router = Router();

router.use(auth);

router.get('/', catalogCategoryController.list);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
  ],
  validate,
  catalogCategoryController.create,
);

router.put('/:id', catalogCategoryController.update);
router.delete('/:id', catalogCategoryController.remove);

export default router;
