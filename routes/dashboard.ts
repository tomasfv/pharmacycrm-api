import { Router } from 'express';
import { Op } from 'sequelize';
import { auth } from '../middleware/auth';
import { FollowUp } from '../models';

const router = Router();

router.use(auth);

const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

router.get('/metrics', async (req, res, next) => {
  try {
    const todayStr = getLocalDateString();

    const [patientsToContactToday, pendingOrders, readyForPickup, overduePatients] =
      await Promise.all([
        FollowUp.count({ where: { scheduledDate: todayStr, status: 'pending_contact' } }),
        FollowUp.count({ where: { status: 'order_received' } }),
        FollowUp.count({ where: { status: 'prepared' } }),
        FollowUp.count({
          where: { scheduledDate: { [Op.lt]: todayStr }, status: { [Op.ne]: 'delivered' } },
        }),
      ]);

    res.json({
      success: true,
      data: { patientsToContactToday, pendingOrders, readyForPickup, overduePatients },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
