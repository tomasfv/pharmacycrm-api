import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Patient } from '../models';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { dni: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { memberNumber: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const { rows, count } = await Patient.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit as string),
      offset,
    });
    res.json({ success: true, data: rows, total: count, page: parseInt(page as string), limit: parseInt(limit as string) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.findByPk(req.params.id as string, {
      include: [
        {
          association: 'orders',
          include: [{ association: 'medications' }],
          order: [['createdAt', 'DESC']] as [[string, string]],
        },
        {
          association: 'followUps',
          order: [['createdAt', 'DESC']] as [[string, string]],
        },
      ],
    });
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.findByPk(req.params.id as string);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }
    await patient.update(req.body);
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const patient = await Patient.findByPk(req.params.id as string);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found.' });
      return;
    }
    await patient.destroy();
    res.json({ success: true, message: 'Patient deleted.' });
  } catch (error) {
    next(error);
  }
};
