import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as contactController from '../controllers/contactController';

const router = Router();

router.use(auth);

router.get('/', contactController.list);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
  ],
  validate,
  contactController.create,
);

router.put('/:id', contactController.update);
router.delete('/:id', contactController.remove);

export default router;
