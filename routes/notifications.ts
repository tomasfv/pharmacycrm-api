import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as notificationController from '../controllers/notificationController';

const router = Router();

router.use(auth);

router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);

export default router;
