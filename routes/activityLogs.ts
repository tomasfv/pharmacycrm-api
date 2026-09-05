import { Router } from 'express';
import { auth } from '../middleware/auth';
import * as activityLogController from '../controllers/activityLogController';

const router = Router();

router.use(auth);

router.get('/:patientId', activityLogController.listByPatient);
router.post('/', activityLogController.create);

export default router;
