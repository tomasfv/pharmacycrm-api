import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { FollowUp, Order, ActivityLog } from '../models';

const getLocalDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalDateDaysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const handleDelivered = async (orderId: string | null, newStatus: string): Promise<void> => {
  if (newStatus !== 'delivered' || !orderId) return;
  const order = await Order.findByPk(orderId);
  if (order) {
    await order.update({
      lastPickupDate: getLocalDateString(),
      nextPickupDate: getLocalDateDaysFromNow(30),
    });
  }
};

const logStatusChange = async (
  patientId: string,
  patientName: string,
  oldStatus: string,
  newStatus: string,
  medication: string | null,
): Promise<void> => {
  await ActivityLog.create({
    patientId,
    type: 'follow_up_status_changed',
    description: `${patientName}: follow-up status changed from "${oldStatus}" to "${newStatus}"`,
    metadata: { oldStatus, newStatus, medication },
  });
};

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search, page = '1', limit = '50' } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [{ patientName: { [Op.iLike]: `%${search}%` } }];
    }
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const { rows, count } = await FollowUp.findAndCountAll({
      where,
      order: [['scheduledDate', 'ASC']],
      limit: parseInt(limit as string),
      offset,
    });
    res.json({ success: true, data: rows, total: count, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const followUp = await FollowUp.create(req.body);
    await ActivityLog.create({
      patientId: (followUp as any).patientId,
      type: 'follow_up_status_changed',
      description: `${(followUp as any).patientName}: follow-up created with status "${(followUp as any).status}"`,
      metadata: { status: (followUp as any).status, medication: (followUp as any).medication },
    });
    res.status(201).json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const followUp = await FollowUp.findByPk(req.params.id as string);
    if (!followUp) {
      res.status(404).json({ success: false, message: 'Follow-up not found.' });
      return;
    }
    const oldStatus = (followUp as any).status;
    const newStatus = req.body.status;
    await followUp.update(req.body);
    await handleDelivered((followUp as any).orderId, newStatus || oldStatus);
    if (newStatus && newStatus !== oldStatus) {
      await logStatusChange(
        (followUp as any).patientId,
        (followUp as any).patientName,
        oldStatus,
        newStatus,
        (followUp as any).medication,
      );
    }
    res.json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const followUp = await FollowUp.findByPk(req.params.id as string);
    if (!followUp) {
      res.status(404).json({ success: false, message: 'Follow-up not found.' });
      return;
    }
    const oldStatus = (followUp as any).status;
    await followUp.update({ status });
    await handleDelivered((followUp as any).orderId, status);
    if (status !== oldStatus) {
      await logStatusChange(
        (followUp as any).patientId,
        (followUp as any).patientName,
        oldStatus,
        status,
        (followUp as any).medication,
      );
    }
    res.json({ success: true, data: followUp });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const followUp = await FollowUp.findByPk(req.params.id as string);
    if (!followUp) {
      res.status(404).json({ success: false, message: 'Follow-up not found.' });
      return;
    }
    await followUp.destroy();
    res.json({ success: true, message: 'Follow-up deleted.' });
  } catch (error) {
    next(error);
  }
};
