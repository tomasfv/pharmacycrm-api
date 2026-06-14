import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Medication } from '../models';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { drug: { [Op.iLike]: `%${search}%` } },
        { laboratory: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const { rows, count } = await Medication.findAndCountAll({
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

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const medication = await Medication.create(req.body);
    res.status(201).json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const medication = await Medication.findByPk(req.params.id as string);
    if (!medication) {
      res.status(404).json({ success: false, message: 'Medication not found.' });
      return;
    }
    await medication.update(req.body);
    res.json({ success: true, data: medication });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const medication = await Medication.findByPk(req.params.id as string);
    if (!medication) {
      res.status(404).json({ success: false, message: 'Medication not found.' });
      return;
    }
    await medication.destroy();
    res.json({ success: true, message: 'Medication deleted.' });
  } catch (error) {
    next(error);
  }
};
