import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as followUpController from '../controllers/followUpController';

const router = Router();

router.use(auth);

router.get('/', followUpController.list);

router.post(
  '/',
  [
    body('patientId').notEmpty().withMessage('Patient ID is required'),
    body('patientName').notEmpty().withMessage('Patient name is required'),
    body('scheduledDate').notEmpty().withMessage('Scheduled date is required'),
  ],
  validate,
  followUpController.create,
);

router.put('/:id', followUpController.update);
router.patch('/:id/status', followUpController.updateStatus);
router.delete('/:id', followUpController.remove);

export default router;
