import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as medicationController from '../controllers/medicationController';

const router = Router();

router.use(auth);

router.get('/', medicationController.list);

router.post(
  '/',
  [body('name').notEmpty().withMessage('Name is required')],
  validate,
  medicationController.create,
);

router.put('/:id', medicationController.update);
router.delete('/:id', medicationController.remove);

export default router;
