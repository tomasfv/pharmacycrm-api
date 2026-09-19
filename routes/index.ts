import { Router } from 'express';
import authRoutes from './auth';
import patientRoutes from './patients';
import medicationRoutes from './medications';
import orderRoutes from './orders';
import followUpRoutes from './followups';
import contactRoutes from './contacts';
import notificationRoutes from './notifications';
import dashboardRoutes from './dashboard';
import userRoutes from './users';
import activityLogRoutes from './activityLogs';
import catalogCategoryRoutes from './catalogCategories';
import catalogProductRoutes from './catalogProducts';
import catalogOrderRoutes from './catalogOrders';
import publicCatalogRoutes from './publicCatalog';
import uploadRoutes from './upload';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/medications', medicationRoutes);
router.use('/orders', orderRoutes);
router.use('/followups', followUpRoutes);
router.use('/contacts', contactRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/activity-logs', activityLogRoutes);
router.use('/upload', uploadRoutes);
router.use('/catalog/categories', catalogCategoryRoutes);
router.use('/catalog/products', catalogProductRoutes);
router.use('/catalog/orders', catalogOrderRoutes);
router.use('/public/catalog', publicCatalogRoutes);

export default router;
