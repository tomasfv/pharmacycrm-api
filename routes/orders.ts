import { Router } from 'express';
import { body } from 'express-validator';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import * as orderController from '../controllers/orderController';

const router = Router();

router.use(auth);

router.get('/', orderController.listByPatient);
router.post(
  '/',
  [body('patientId').notEmpty().withMessage('Patient ID is required'), body('patientName').notEmpty().withMessage('Patient name is required')],
  validate,
  orderController.create,
);
router.put('/:id', orderController.update);
router.delete('/:id', orderController.remove);

export default router;
