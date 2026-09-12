import { Request, Response, NextFunction } from 'express';
import { CatalogOrder } from '../models';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await CatalogOrder.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await CatalogOrder.findByPk(req.params.id as string);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { items, ...orderData } = req.body;
    const total = items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );
    const order = await CatalogOrder.create({ ...orderData, items, total });
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
