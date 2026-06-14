import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Contact } from '../models';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const where: any = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } },
      ];
    }
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    const { rows, count } = await Contact.findAndCountAll({
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
    const contact = await Contact.create(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contact = await Contact.findByPk(req.params.id as string);
    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact not found.' });
      return;
    }
    await contact.update(req.body);
    res.json({ success: true, data: contact });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const contact = await Contact.findByPk(req.params.id as string);
    if (!contact) {
      res.status(404).json({ success: false, message: 'Contact not found.' });
      return;
    }
    await contact.destroy();
    res.json({ success: true, message: 'Contact deleted.' });
  } catch (error) {
    next(error);
  }
};
