import { Router } from 'express';
import { Op } from 'sequelize';
import { auth } from '../middleware/auth';
import { FollowUp, Patient, Prescription } from '../models';

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

    const activePatients = await Patient.count({ where: { status: 'active' } });
    const activePrescriptions = await Prescription.count();
    const overdueCount = await FollowUp.count({
      where: {
        scheduledDate: { [Op.lt]: todayStr },
        status: { [Op.ne]: 'delivered' },
      },
    });
    const upcoming = await FollowUp.findAll({
      where: { scheduledDate: todayStr, status: 'pending_contact' },
      limit: 5,
    });
    const recentPatients = await Patient.findAll({ order: [['createdAt', 'DESC']], limit: 5 });

    res.json({
      success: true,
      data: {
        activePatients,
        activePrescriptions,
        overdueFollowUps: overdueCount,
        upcomingFollowUps: upcoming,
        recentActivity: recentPatients,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
