import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import medicationRoutes from './medications';
import prescriptionRoutes from './prescriptions';
import followUpRoutes from './followups';
import contactRoutes from './contacts';
import notificationRoutes from './notifications';
import dashboardRoutes from './dashboard';
import userRoutes from './users';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/medications', medicationRoutes);
router.use('/prescriptions', prescriptionRoutes);
router.use('/followups', followUpRoutes);
router.use('/contacts', contactRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

export default router;
