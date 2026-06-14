import { Request, Response, NextFunction } from 'express';
import { Prescription, PrescriptionMedication, Medication, FollowUp } from '../models';

export const listByPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientId } = req.query;
    const where = patientId ? { patientId: patientId as string } : {};
    const prescriptions = await Prescription.findAll({
      where,
      include: [{ association: 'medications', include: [{ model: Medication }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, data: prescriptions });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { medications, ...prescriptionData } = req.body;
    const prescription = await Prescription.create(prescriptionData) as any;
    if (medications && medications.length > 0) {
      const items = medications.map((m: Record<string, unknown>) => ({
        prescriptionId: prescription.id,
        medicationId: m.medicationId as string,
        medicationName: m.medicationName as string,
        quantity: (m.quantity as string) || '1',
        frequency: (m.frequency as string) || '',
      }));
      await PrescriptionMedication.bulkCreate(items);
    }
    await FollowUp.create({
      patientId: (prescription as any).patientId,
      patientName: (prescription as any).patientName,
      prescriptionId: prescription.id,
      medication: medications?.map((m: Record<string, unknown>) => m.medicationName).join(', ') || '',
      status: 'prescription_received',
      scheduledDate: new Date().toISOString().split('T')[0],
    });
    const result = await Prescription.findByPk(prescription.id, {
      include: [{ association: 'medications', include: [{ model: Medication }] }],
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prescription = await Prescription.findByPk(req.params.id as string) as any;
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found.' });
      return;
    }
    const { medications, ...prescriptionData } = req.body;
    await prescription.update(prescriptionData);
    if (medications) {
      await PrescriptionMedication.destroy({ where: { prescriptionId: prescription.id } });
      const items = medications.map((m: Record<string, unknown>) => ({
        prescriptionId: prescription.id,
        medicationId: m.medicationId as string,
        medicationName: m.medicationName as string,
        quantity: (m.quantity as string) || '1',
        frequency: (m.frequency as string) || '',
      }));
      await PrescriptionMedication.bulkCreate(items);
    }
    const result = await Prescription.findByPk(prescription.id, {
      include: [{ association: 'medications', include: [{ model: Medication }] }],
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const prescription = await Prescription.findByPk(req.params.id as string) as any;
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription not found.' });
      return;
    }
    await PrescriptionMedication.destroy({ where: { prescriptionId: prescription.id } });
    await prescription.destroy();
    res.json({ success: true, message: 'Prescription deleted.' });
  } catch (error) {
    next(error);
  }
};
