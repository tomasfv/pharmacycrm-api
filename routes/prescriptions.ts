import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as prescriptionController from '../controllers/prescriptionController';

const router = Router();

router.use(auth);

router.get('/', prescriptionController.listByPatient);

router.post(
  '/',
  [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
  ],
  validate,
  prescriptionController.create,
);

router.put('/:id', prescriptionController.update);
router.delete('/:id', prescriptionController.remove);

export default router;
