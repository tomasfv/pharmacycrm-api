import { Request, Response, NextFunction } from 'express';
import { ActivityLog } from '../models';

export const listByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId } = req.params;
    const logs = await ActivityLog.findAll({
      where: { patientId },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const log = await ActivityLog.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};
