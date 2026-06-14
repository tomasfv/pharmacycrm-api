import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models';

export const list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const markRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await Notification.findByPk(req.params.id as string);
    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found.' });
      return;
    }
    await notification.update({ read: true });
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.update({ read: true }, { where: { read: false } });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};
