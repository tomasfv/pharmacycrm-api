import { Request, Response, NextFunction } from 'express';
import { Order, OrderMedication, Medication, FollowUp } from '../models';

export const listByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId } = req.query;
    const where = patientId ? { patientId: patientId as string } : {};
    const orders = await Order.findAll({
      where,
      include: [{ association: 'medications', include: [{ model: Medication }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { medications, ...orderData } = req.body;
    const order = await Order.create(orderData) as any;
    if (medications && medications.length > 0) {
      const items = medications.map((m: Record<string, unknown>) => ({
        orderId: order.id,
        medicationId: m.medicationId as string,
        medicationName: m.medicationName as string,
        quantity: (m.quantity as string) || '1',
      }));
      await OrderMedication.bulkCreate(items);
    }
    await FollowUp.create({
      patientId: (order as any).patientId,
      patientName: (order as any).patientName,
      orderId: order.id,
      medication: medications?.map((m: Record<string, unknown>) => m.medicationName).join(', ') || '',
      status: 'order_received',
      scheduledDate: new Date().toISOString().split('T')[0],
    });
    const result = await Order.findByPk(order.id, {
      include: [{ association: 'medications', include: [{ model: Medication }] }],
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findByPk(req.params.id as string) as any;
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    const { medications, ...orderData } = req.body;
    await order.update(orderData);
    if (medications) {
      await OrderMedication.destroy({ where: { orderId: order.id } });
      const items = medications.map((m: Record<string, unknown>) => ({
        orderId: order.id,
        medicationId: m.medicationId as string,
        medicationName: m.medicationName as string,
        quantity: (m.quantity as string) || '1',
      }));
      await OrderMedication.bulkCreate(items);
    }
    const result = await Order.findByPk(order.id, {
      include: [{ association: 'medications', include: [{ model: Medication }] }],
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findByPk(req.params.id as string) as any;
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    await OrderMedication.destroy({ where: { orderId: order.id } });
    await order.destroy();
    res.json({ success: true, message: 'Order deleted.' });
  } catch (error) {
    next(error);
  }
};
