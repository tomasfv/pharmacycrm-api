import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as catalogOrderController from '../controllers/catalogOrderController';

const router = Router();

router.use(auth);

router.get('/', catalogOrderController.list);
router.get('/:id', catalogOrderController.getById);

router.post(
  '/',
  [
    body('customerName').notEmpty().withMessage('Customer name is required'),
    body('customerPhone').notEmpty().withMessage('Customer phone is required'),
    body('deliveryMethod').isIn(['pickup', 'delivery']).withMessage('Delivery method must be pickup or delivery'),
    body('paymentMethod').isIn(['cash', 'card']).withMessage('Payment method must be cash or card'),
    body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  ],
  validate,
  catalogOrderController.create,
);

export default router;
