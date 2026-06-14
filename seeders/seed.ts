import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import sequelize from '../config/database';
import {
  User,
  Patient,
  Medication,
  Prescription,
  PrescriptionMedication,
  FollowUp,
  Contact,
  Notification,
} from '../models';

const medicationsData = [
  { id: 'a0000000-0001-4000-a000-000000000001', name: 'Metformina 850mg', brand: 'Glucophage', drug: 'Metformina', laboratory: 'Merck' },
  { id: 'a0000000-0002-4000-a000-000000000002', name: 'Glibenclamida 5mg', brand: 'Daonil', drug: 'Glibenclamida', laboratory: 'Sanofi' },
  { id: 'a0000000-0003-4000-a000-000000000003', name: 'Losartán 50mg', brand: 'Cozaar', drug: 'Losartán', laboratory: 'MSD' },
  { id: 'a0000000-0004-4000-a000-000000000004', name: 'Amlodipino 5mg', brand: 'Norvasc', drug: 'Amlodipino', laboratory: 'Pfizer' },
  { id: 'a0000000-0005-4000-a000-000000000005', name: 'Salbutamol Inhalador 100mcg', brand: 'Ventolin', drug: 'Salbutamol', laboratory: 'GSK' },
  { id: 'a0000000-0006-4000-a000-000000000006', name: 'Budesonida Inhalador 200mcg', brand: 'Pulmicort', drug: 'Budesonida', laboratory: 'AstraZeneca' },
  { id: 'a0000000-0007-4000-a000-000000000007', name: 'Furosemida 40mg', brand: 'Lasix', drug: 'Furosemida', laboratory: 'Sanofi' },
  { id: 'a0000000-0008-4000-a000-000000000008', name: 'Metotrexato 15mg', brand: 'Methotrexate', drug: 'Metotrexato', laboratory: 'Pfizer' },
  { id: 'a0000000-0009-4000-a000-000000000009', name: 'Tenofovir/Emtricitabina 200/300mg', brand: 'Truvada', drug: 'Tenofovir/Emtricitabina', laboratory: 'Gilead' },
  { id: 'a0000000-0010-4000-a000-000000000010', name: 'Levotiroxina 100mcg', brand: 'Synthroid', drug: 'Levotiroxina', laboratory: 'AbbVie' },
  { id: 'a0000000-0011-4000-a000-000000000011', name: 'Insulina Glargina 100U/mL', brand: 'Lantus', drug: 'Insulina Glargina', laboratory: 'Sanofi' },
  { id: 'a0000000-0012-4000-a000-000000000012', name: 'Insulina Lispro 100U/mL', brand: 'Humalog', drug: 'Insulina Lispro', laboratory: 'Eli Lilly' },
  { id: 'a0000000-0013-4000-a000-000000000013', name: 'Latanoprost 0.005%', brand: 'Xalatan', drug: 'Latanoprost', laboratory: 'Pfizer' },
  { id: 'a0000000-0014-4000-a000-000000000014', name: 'Sertralina 50mg', brand: 'Zoloft', drug: 'Sertralina', laboratory: 'Pfizer' },
  { id: 'a0000000-0015-4000-a000-000000000015', name: 'Tiotropio Inhalador 18mcg', brand: 'Spiriva', drug: 'Tiotropio', laboratory: 'Boehringer' },
  { id: 'a0000000-0016-4000-a000-000000000016', name: 'Salbutamol Nebulizador 5mg/mL', brand: 'Ventolin Neb', drug: 'Salbutamol', laboratory: 'GSK' },
  { id: 'a0000000-0017-4000-a000-000000000017', name: 'Ácido Alendrónico 70mg', brand: 'Fosamax', drug: 'Ácido Alendrónico', laboratory: 'MSD' },
  { id: 'a0000000-0018-4000-a000-000000000018', name: 'Calcio/Vitamina D', brand: 'Caltrate', drug: 'Calcio/Vitamina D', laboratory: 'Pfizer' },
  { id: 'a0000000-0019-4000-a000-000000000019', name: 'Levetiracetam 1000mg', brand: 'Keppra', drug: 'Levetiracetam', laboratory: 'UCB' },
  { id: 'a0000000-0020-4000-a000-000000000020', name: 'Tacrolimus 5mg', brand: 'Prograf', drug: 'Tacrolimus', laboratory: 'Astellas' },
  { id: 'a0000000-0021-4000-a000-000000000021', name: 'Micofenolato 500mg', brand: 'CellCept', drug: 'Micofenolato', laboratory: 'Roche' },
  { id: 'a0000000-0022-4000-a000-000000000022', name: 'Sumatriptán 50mg', brand: 'Imigran', drug: 'Sumatriptán', laboratory: 'GSK' },
  { id: 'a0000000-0023-4000-a000-000000000023', name: 'Propranolol 40mg', brand: 'Inderal', drug: 'Propranolol', laboratory: 'AstraZeneca' },
  { id: 'a0000000-0024-4000-a000-000000000024', name: 'Adalimumab 40mg', brand: 'Humira', drug: 'Adalimumab', laboratory: 'AbbVie' },
  { id: 'a0000000-0025-4000-a000-000000000025', name: 'Sofosbuvir/Velpatasvir 400/100mg', brand: 'Epclusa', drug: 'Sofosbuvir/Velpatasvir', laboratory: 'Gilead' },
  { id: 'a0000000-0026-4000-a000-000000000026', name: 'Clonazepam 2mg', brand: 'Rivotril', drug: 'Clonazepam', laboratory: 'Roche' },
  { id: 'a0000000-0027-4000-a000-000000000027', name: 'Fluoxetina 20mg', brand: 'Prozac', drug: 'Fluoxetina', laboratory: 'Eli Lilly' },
  { id: 'a0000000-0028-4000-a000-000000000028', name: 'Tramadol 50mg', brand: 'Tramal', drug: 'Tramadol', laboratory: 'Grünenthal' },
  { id: 'a0000000-0029-4000-a000-000000000029', name: 'Atorvastatina 20mg', brand: 'Lipitor', drug: 'Atorvastatina', laboratory: 'Pfizer' },
  { id: 'a0000000-0030-4000-a000-000000000030', name: 'Enalapril 10mg', brand: 'Renitec', drug: 'Enalapril', laboratory: 'MSD' },
  { id: 'a0000000-0031-4000-a000-000000000031', name: 'Carbonato de Calcio 500mg', brand: 'Caltrate Plus', drug: 'Carbonato de Calcio', laboratory: 'Pfizer' },
  { id: 'a0000000-0032-4000-a000-000000000032', name: 'Vitamina D 400UI', brand: 'Vigantol', drug: 'Vitamina D', laboratory: 'Merck' },
  { id: 'a0000000-0033-4000-a000-000000000033', name: 'Prednisona 10mg', brand: 'Deltisona', drug: 'Prednisona', laboratory: 'Schering' },
  { id: 'a0000000-0034-4000-a000-000000000034', name: 'Omeprazol 20mg', brand: 'Prilosec', drug: 'Omeprazol', laboratory: 'AstraZeneca' },
  { id: 'a0000000-0035-4000-a000-000000000035', name: 'Lorazepam 1mg', brand: 'Ativan', drug: 'Lorazepam', laboratory: 'Pfizer' },
];

const patientsData = [
  { id: 'b0000000-0001-4000-b000-000000000001', name: 'Carlos Mendoza', dni: '12345678', phone: '1551234567', email: 'carlos.m@email.com', healthInsurance: 'OSDE', memberNumber: 'OSD-001', status: 'active', nextFollowUpDate: '2026-06-20', notes: 'Diabetic type 2' },
  { id: 'b0000000-0002-4000-b000-000000000002', name: 'María Fernández', dni: '23456789', phone: '1552345678', email: 'maria.f@email.com', healthInsurance: 'Swiss Medical', memberNumber: 'SM-002', status: 'active', nextFollowUpDate: '2026-06-18', notes: 'Hypertension' },
  { id: 'b0000000-0003-4000-b000-000000000003', name: 'Roberto Gómez', dni: '34567890', phone: '1553456789', email: 'roberto.g@email.com', healthInsurance: 'Galeno', memberNumber: 'GAL-003', status: 'active', nextFollowUpDate: '2026-06-22', notes: 'Asthma' },
];

const prescriptionsData = [
  { id: 'c0000000-0001-4000-c000-000000000001', patientId: patientsData[0].id, patientName: 'Carlos Mendoza', lastPickupDate: '2026-05-15', nextPickupDate: '2026-06-15' },
  { id: 'c0000000-0002-4000-c000-000000000002', patientId: patientsData[0].id, patientName: 'Carlos Mendoza', lastPickupDate: '2026-06-01', nextPickupDate: '2026-07-01' },
  { id: 'c0000000-0003-4000-c000-000000000003', patientId: patientsData[1].id, patientName: 'María Fernández', lastPickupDate: '2026-05-20', nextPickupDate: '2026-06-20' },
];

const prescriptionMedsData = [
  { id: 'd0000000-0001-4000-d000-000000000001', prescriptionId: prescriptionsData[0].id, medicationId: medicationsData[0].id, medicationName: 'Metformina 850mg', quantity: '1', frequency: 'Twice daily' },
  { id: 'd0000000-0002-4000-d000-000000000002', prescriptionId: prescriptionsData[0].id, medicationId: medicationsData[1].id, medicationName: 'Glibenclamida 5mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0003-4000-d000-000000000003', prescriptionId: prescriptionsData[1].id, medicationId: medicationsData[0].id, medicationName: 'Metformina 850mg', quantity: '1', frequency: 'Twice daily' },
  { id: 'd0000000-0004-4000-d000-000000000004', prescriptionId: prescriptionsData[1].id, medicationId: medicationsData[28].id, medicationName: 'Atorvastatina 20mg', quantity: '1', frequency: 'Once daily at night' },
  { id: 'd0000000-0005-4000-d000-000000000005', prescriptionId: prescriptionsData[2].id, medicationId: medicationsData[2].id, medicationName: 'Losartán 50mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0006-4000-d000-000000000006', prescriptionId: prescriptionsData[2].id, medicationId: medicationsData[29].id, medicationName: 'Enalapril 10mg', quantity: '1', frequency: 'Once daily' },
];

const followUpsData = [
  { patientId: patientsData[0].id, patientName: patientsData[0].name, prescriptionId: prescriptionsData[1].id, status: 'pending_contact', scheduledDate: '2026-06-14', notes: 'Check blood sugar levels' },
  { patientId: patientsData[1].id, patientName: patientsData[1].name, prescriptionId: prescriptionsData[2].id, status: 'contacted', scheduledDate: '2026-06-15', notes: 'Blood pressure check' },
  { patientId: patientsData[2].id, patientName: patientsData[2].name, prescriptionId: prescriptionsData[2].id, status: 'prescription_received', scheduledDate: '2026-06-16', notes: 'Inhaler technique review' },
];

const contactsData = [
  { name: 'Farmacia San Juan', phone: '1144556677', email: 'contacto@sanjuan.com', category: 'supplier', notes: 'Main wholesaler' },
  { name: 'Carlos Méndez', phone: '1155667788', email: 'carlos.mendez@courier.com', category: 'delivery', notes: 'Courier' },
  { name: 'Dra. Laura Bustos', phone: '1166778899', email: 'lbustos@hospital.com', category: 'doctor', notes: 'Endocrinologist' },
  { name: 'Dr. Martín Soto', phone: '1177889900', email: 'msoto@clinica.com', category: 'doctor', notes: 'Cardiologist' },
  { name: 'LabCentral', phone: '1188990011', email: 'results@labcentral.com', category: 'lab', notes: 'Lab results' },
  { name: 'Distribuidora Farma', phone: '1199001122', email: 'ventas@distfarma.com', category: 'supplier', notes: 'Generic drugs' },
  { name: 'Dr. Pablo Rivas', phone: '1510102020', email: 'privas@neumo.com', category: 'doctor', notes: 'Pulmonologist' },
  { name: 'Mensajería Express', phone: '1520203030', email: 'info@mensajeriaexpress.com', category: 'delivery', notes: 'Same-day delivery' },
  { name: 'Laboratorio BioAnálisis', phone: '1530304040', email: 'contacto@bioanalisis.com', category: 'lab', notes: 'Specialized tests' },
  { name: 'Dra. Ana Guerrero', phone: '1540405050', email: 'aguerrero@reuma.com', category: 'doctor', notes: 'Rheumatologist' },
  { name: 'Farmacia Central', phone: '1550506060', email: 'central@farmacia.com', category: 'supplier', notes: 'Local pharmacy' },
  { name: 'LogiSalud', phone: '1560607070', email: 'ops@logisalud.com', category: 'delivery', notes: 'Medical logistics' },
  { name: 'LabDiagnóstico', phone: '1570708080', email: 'info@labdiagnostico.com', category: 'lab', notes: 'Clinical analysis' },
  { name: 'Dr. Ricardo Luna', phone: '1580809090', email: 'rluna@hosp.com', category: 'doctor', notes: 'Nephrologist' },
  { name: 'ProveerMed', phone: '1590901010', email: 'ventas@proveermed.com', category: 'supplier', notes: 'Medical supplies' },
];

const notificationsData = [
  { type: 'contact_today', message: 'Carlos Mendoza needs follow-up contact today', patientId: patientsData[0].id, read: false },
  { type: 'upcoming_pickup', message: 'María Fernández has a pickup scheduled in 3 days', patientId: patientsData[1].id, read: false },
  { type: 'overdue_followup', message: 'Roberto Gómez follow-up is overdue', patientId: patientsData[2].id, read: true },
];

async function seed(): Promise<void> {
  try {
    await sequelize.sync({ force: true });
    console.log('Tables recreated.');

    const hashedPassword = await bcrypt.hash('PharmaCare2026', 10);
    await User.bulkCreate([
      { name: 'Admin', email: 'admin@pharmacare.com', password: hashedPassword, role: 'admin', avatar: null },
      { name: 'Staff User', email: 'staff@pharmacare.com', password: hashedPassword, role: 'staff', avatar: null },
    ]);
    console.log('Users seeded.');

    await Medication.bulkCreate(medicationsData);
    console.log('Medications seeded.');

    await Patient.bulkCreate(patientsData as any);
    console.log('Patients seeded.');

    await Prescription.bulkCreate(prescriptionsData);
    console.log('Prescriptions seeded.');

    await PrescriptionMedication.bulkCreate(prescriptionMedsData);
    console.log('Prescription medications seeded.');

    await FollowUp.bulkCreate(followUpsData as any);
    console.log('Follow-ups seeded.');

    await Contact.bulkCreate(contactsData as any);
    console.log('Contacts seeded.');

    await Notification.bulkCreate(notificationsData as any);
    console.log('Notifications seeded.');

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
