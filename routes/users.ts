import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import * as userController from '../controllers/userController';

const router = Router();

router.use(auth);

router.get('/', userController.list);
router.get('/:id', userController.getById);

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  userController.create,
);

router.put('/:id', userController.update);
router.delete('/:id', userController.remove);

export default router;
