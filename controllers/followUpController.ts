import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { FollowUp } from '../models';

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
