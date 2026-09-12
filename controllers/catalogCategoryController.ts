import { Request, Response, NextFunction } from 'express';
import { CatalogCategory } from '../models';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await CatalogCategory.findAll({
      order: [['name', 'ASC']],
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await CatalogCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await CatalogCategory.findByPk(req.params.id as string);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    await category.update(req.body);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const category = await CatalogCategory.findByPk(req.params.id as string);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    await category.destroy();
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    next(error);
  }
};
