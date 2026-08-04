import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { FollowUp, Order } from '../models';

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
    await followUp.update(req.body);
    await handleDelivered((followUp as any).orderId, req.body.status || (followUp as any).status);
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
    await followUp.update({ status });
    await handleDelivered((followUp as any).orderId, status);
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
