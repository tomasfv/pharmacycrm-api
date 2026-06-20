import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as patientController from '../controllers/patientController';

const router = Router();

router.use(auth);

router.get('/', patientController.list);
router.get('/:id', patientController.getById);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('address').optional().isString(),
  ],
  validate,
  patientController.create,
);

router.put('/:id', patientController.update);
router.delete('/:id', patientController.remove);

export default router;
