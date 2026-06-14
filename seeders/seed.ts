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
  { id: 'b0000000-0004-4000-b000-000000000004', name: 'Ana López', dni: '45678901', phone: '1554567890', email: 'ana.l@email.com', healthInsurance: 'OSDE', memberNumber: 'OSD-004', status: 'active', nextFollowUpDate: '2026-06-15', notes: 'Chronic kidney disease' },
  { id: 'b0000000-0005-4000-b000-000000000005', name: 'Diego Martínez', dni: '56789012', phone: '1555678901', email: 'diego.m@email.com', healthInsurance: 'N/A', memberNumber: 'N/A', status: 'active', nextFollowUpDate: '2026-06-25', notes: 'HIV treatment' },
  { id: 'b0000000-0006-4000-b000-000000000006', name: 'Laura Rodríguez', dni: '67890123', phone: '1556789012', email: 'laura.r@email.com', healthInsurance: 'Swiss Medical', memberNumber: 'SM-006', status: 'active', nextFollowUpDate: '2026-06-28', notes: 'Hypothyroidism' },
  { id: 'b0000000-0007-4000-b000-000000000007', name: 'Jorge Sánchez', dni: '78901234', phone: '1557890123', email: 'jorge.s@email.com', healthInsurance: 'Galeno', memberNumber: 'GAL-007', status: 'active', nextFollowUpDate: '2026-07-01', notes: 'Diabetes + Hypertension' },
  { id: 'b0000000-0008-4000-b000-000000000008', name: 'Patricia Díaz', dni: '89012345', phone: '1558901234', email: 'patricia.d@email.com', healthInsurance: 'OSDE', memberNumber: 'OSD-008', status: 'active', nextFollowUpDate: '2026-06-30', notes: 'Glaucoma' },
  { id: 'b0000000-0009-4000-b000-000000000009', name: 'Fernando Torres', dni: '90123456', phone: '1559012345', email: 'fernando.t@email.com', healthInsurance: 'Medicus', memberNumber: 'MED-009', status: 'active', nextFollowUpDate: '2026-06-17', notes: 'COPD' },
  { id: 'b0000000-0010-4000-b000-000000000010', name: 'Silvia Ramírez', dni: '01234567', phone: '1550123456', email: 'silvia.r@email.com', healthInsurance: 'N/A', memberNumber: 'N/A', status: 'active', nextFollowUpDate: '2026-07-05', notes: 'Rheumatoid arthritis' },
  { id: 'b0000000-0011-4000-b000-000000000011', name: 'Gustavo Herrera', dni: '11223344', phone: '1551122334', email: 'gustavo.h@email.com', healthInsurance: 'Swiss Medical', memberNumber: 'SM-011', status: 'active', nextFollowUpDate: '2026-06-19', notes: 'Organ transplant' },
  { id: 'b0000000-0012-4000-b000-000000000012', name: 'Valentina Castro', dni: '22334455', phone: '1552233445', email: 'valentina.c@email.com', healthInsurance: 'Galeno', memberNumber: 'GAL-012', status: 'inactive', nextFollowUpDate: null, notes: 'Migraine' },
  { id: 'b0000000-0013-4000-b000-000000000013', name: 'Andrés Vargas', dni: '33445566', phone: '1553344556', email: 'andres.v@email.com', healthInsurance: 'OSDE', memberNumber: 'OSD-013', status: 'active', nextFollowUpDate: '2026-07-10', notes: 'Hepatitis C' },
  { id: 'b0000000-0014-4000-b000-000000000014', name: 'Camila Ríos', dni: '44556677', phone: '1554455667', email: 'camila.r@email.com', healthInsurance: 'Medicus', memberNumber: 'MED-014', status: 'active', nextFollowUpDate: '2026-06-29', notes: 'Anxiety disorder' },
  { id: 'b0000000-0015-4000-b000-000000000015', name: 'Luis Pérez', dni: '55667788', phone: '1555566778', email: 'luis.p@email.com', healthInsurance: 'N/A', memberNumber: 'N/A', status: 'active', nextFollowUpDate: '2026-06-16', notes: 'Osteoporosis' },
  { id: 'b0000000-0016-4000-b000-000000000016', name: 'Carolina Medina', dni: '66778899', phone: '1556677889', email: 'carolina.m@email.com', healthInsurance: 'Swiss Medical', memberNumber: 'SM-016', status: 'active', nextFollowUpDate: '2026-07-08', notes: null },
  { id: 'b0000000-0017-4000-b000-000000000017', name: 'Ricardo Ortiz', dni: '77889900', phone: '1557788990', email: 'ricardo.o@email.com', healthInsurance: 'Galeno', memberNumber: 'GAL-017', status: 'active', nextFollowUpDate: '2026-06-24', notes: 'Epilepsy' },
  { id: 'b0000000-0018-4000-b000-000000000018', name: 'Mónica Salazar', dni: '88990011', phone: '1558899001', email: 'monica.s@email.com', healthInsurance: 'OSDE', memberNumber: 'OSD-018', status: 'active', nextFollowUpDate: '2026-06-21', notes: 'High cholesterol' },
  { id: 'b0000000-0019-4000-b000-000000000019', name: 'Alberto Núñez', dni: '99001122', phone: '1559900112', email: 'alberto.n@email.com', healthInsurance: 'Medicus', memberNumber: 'MED-019', status: 'active', nextFollowUpDate: '2026-07-03', notes: 'GERD' },
  { id: 'b0000000-0020-4000-b000-000000000020', name: 'Gabriela Silva', dni: '10111213', phone: '1551011121', email: 'gabriela.s@email.com', healthInsurance: 'N/A', memberNumber: 'N/A', status: 'inactive', nextFollowUpDate: null, notes: null },
];

const prescriptionsData = [
  { id: 'c0000000-0001-4000-c000-000000000001', patientId: patientsData[0].id, patientName: 'Carlos Mendoza', lastPickupDate: '2026-05-15', nextPickupDate: '2026-06-15' },
  { id: 'c0000000-0002-4000-c000-000000000002', patientId: patientsData[0].id, patientName: 'Carlos Mendoza', lastPickupDate: '2026-06-01', nextPickupDate: '2026-07-01' },
  { id: 'c0000000-0003-4000-c000-000000000003', patientId: patientsData[1].id, patientName: 'María Fernández', lastPickupDate: '2026-05-20', nextPickupDate: '2026-06-20' },
  { id: 'c0000000-0004-4000-c000-000000000004', patientId: patientsData[1].id, patientName: 'María Fernández', lastPickupDate: '2026-06-10', nextPickupDate: '2026-07-10' },
  { id: 'c0000000-0005-4000-c000-000000000005', patientId: patientsData[2].id, patientName: 'Roberto Gómez', lastPickupDate: '2026-05-25', nextPickupDate: '2026-06-25' },
  { id: 'c0000000-0006-4000-c000-000000000006', patientId: patientsData[3].id, patientName: 'Ana López', lastPickupDate: '2026-05-10', nextPickupDate: '2026-06-10' },
  { id: 'c0000000-0007-4000-c000-000000000007', patientId: patientsData[4].id, patientName: 'Diego Martínez', lastPickupDate: '2026-05-30', nextPickupDate: '2026-06-30' },
  { id: 'c0000000-0008-4000-c000-000000000008', patientId: patientsData[5].id, patientName: 'Laura Rodríguez', lastPickupDate: '2026-06-01', nextPickupDate: '2026-07-01' },
  { id: 'c0000000-0009-4000-c000-000000000009', patientId: patientsData[6].id, patientName: 'Jorge Sánchez', lastPickupDate: '2026-06-05', nextPickupDate: '2026-07-05' },
  { id: 'c0000000-0010-4000-c000-000000000010', patientId: patientsData[7].id, patientName: 'Patricia Díaz', lastPickupDate: '2026-05-28', nextPickupDate: '2026-06-28' },
  { id: 'c0000000-0011-4000-c000-000000000011', patientId: patientsData[8].id, patientName: 'Fernando Torres', lastPickupDate: '2026-05-12', nextPickupDate: '2026-06-12' },
  { id: 'c0000000-0012-4000-c000-000000000012', patientId: patientsData[9].id, patientName: 'Silvia Ramírez', lastPickupDate: '2026-06-02', nextPickupDate: '2026-07-02' },
  { id: 'c0000000-0013-4000-c000-000000000013', patientId: patientsData[10].id, patientName: 'Gustavo Herrera', lastPickupDate: '2026-05-22', nextPickupDate: '2026-06-22' },
  { id: 'c0000000-0014-4000-c000-000000000014', patientId: patientsData[12].id, patientName: 'Andrés Vargas', lastPickupDate: '2026-06-08', nextPickupDate: '2026-07-08' },
  { id: 'c0000000-0015-4000-c000-000000000015', patientId: patientsData[13].id, patientName: 'Camila Ríos', lastPickupDate: '2026-06-03', nextPickupDate: '2026-07-03' },
  { id: 'c0000000-0016-4000-c000-000000000016', patientId: patientsData[14].id, patientName: 'Luis Pérez', lastPickupDate: '2026-05-05', nextPickupDate: '2026-06-05' },
  { id: 'c0000000-0017-4000-c000-000000000017', patientId: patientsData[15].id, patientName: 'Carolina Medina', lastPickupDate: '2026-06-10', nextPickupDate: '2026-07-10' },
  { id: 'c0000000-0018-4000-c000-000000000018', patientId: patientsData[16].id, patientName: 'Ricardo Ortiz', lastPickupDate: '2026-05-18', nextPickupDate: '2026-06-18' },
  { id: 'c0000000-0019-4000-c000-000000000019', patientId: patientsData[17].id, patientName: 'Mónica Salazar', lastPickupDate: '2026-06-07', nextPickupDate: '2026-07-07' },
  { id: 'c0000000-0020-4000-c000-000000000020', patientId: patientsData[18].id, patientName: 'Alberto Núñez', lastPickupDate: '2026-05-29', nextPickupDate: '2026-06-29' },
  { id: 'c0000000-0021-4000-c000-000000000021', patientId: patientsData[6].id, patientName: 'Jorge Sánchez', lastPickupDate: '2026-06-01', nextPickupDate: '2026-07-01' },
  { id: 'c0000000-0022-4000-c000-000000000022', patientId: patientsData[9].id, patientName: 'Silvia Ramírez', lastPickupDate: '2026-05-25', nextPickupDate: '2026-06-25' },
  { id: 'c0000000-0023-4000-c000-000000000023', patientId: patientsData[10].id, patientName: 'Gustavo Herrera', lastPickupDate: '2026-06-05', nextPickupDate: '2026-07-05' },
];

const prescriptionMedsData = [
  { id: 'd0000000-0001-4000-d000-000000000001', prescriptionId: prescriptionsData[0].id, medicationId: medicationsData[0].id, medicationName: 'Metformina 850mg', quantity: '1', frequency: 'Twice daily' },
  { id: 'd0000000-0002-4000-d000-000000000002', prescriptionId: prescriptionsData[0].id, medicationId: medicationsData[1].id, medicationName: 'Glibenclamida 5mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0003-4000-d000-000000000003', prescriptionId: prescriptionsData[1].id, medicationId: medicationsData[0].id, medicationName: 'Metformina 850mg', quantity: '1', frequency: 'Twice daily' },
  { id: 'd0000000-0004-4000-d000-000000000004', prescriptionId: prescriptionsData[1].id, medicationId: medicationsData[28].id, medicationName: 'Atorvastatina 20mg', quantity: '1', frequency: 'Once daily at night' },
  { id: 'd0000000-0005-4000-d000-000000000005', prescriptionId: prescriptionsData[2].id, medicationId: medicationsData[2].id, medicationName: 'Losartán 50mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0006-4000-d000-000000000006', prescriptionId: prescriptionsData[2].id, medicationId: medicationsData[29].id, medicationName: 'Enalapril 10mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0007-4000-d000-000000000007', prescriptionId: prescriptionsData[3].id, medicationId: medicationsData[2].id, medicationName: 'Losartán 50mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0008-4000-d000-000000000008', prescriptionId: prescriptionsData[4].id, medicationId: medicationsData[4].id, medicationName: 'Salbutamol Inhalador 100mcg', quantity: '1', frequency: 'As needed' },
  { id: 'd0000000-0009-4000-d000-000000000009', prescriptionId: prescriptionsData[4].id, medicationId: medicationsData[5].id, medicationName: 'Budesonida Inhalador 200mcg', quantity: '1', frequency: 'Twice daily' },
  { id: 'd0000000-0010-4000-d000-000000000010', prescriptionId: prescriptionsData[5].id, medicationId: medicationsData[6].id, medicationName: 'Furosemida 40mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0011-4000-d000-000000000011', prescriptionId: prescriptionsData[6].id, medicationId: medicationsData[8].id, medicationName: 'Tenofovir/Emtricitabina 200/300mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0012-4000-d000-000000000012', prescriptionId: prescriptionsData[7].id, medicationId: medicationsData[9].id, medicationName: 'Levotiroxina 100mcg', quantity: '1', frequency: 'Once daily on empty stomach' },
  { id: 'd0000000-0013-4000-d000-000000000013', prescriptionId: prescriptionsData[8].id, medicationId: medicationsData[0].id, medicationName: 'Metformina 850mg', quantity: '1', frequency: 'Twice daily' },
  { id: 'd0000000-0014-4000-d000-000000000014', prescriptionId: prescriptionsData[8].id, medicationId: medicationsData[2].id, medicationName: 'Losartán 50mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0015-4000-d000-000000000015', prescriptionId: prescriptionsData[9].id, medicationId: medicationsData[12].id, medicationName: 'Latanoprost 0.005%', quantity: '1', frequency: 'One drop each eye at night' },
  { id: 'd0000000-0016-4000-d000-000000000016', prescriptionId: prescriptionsData[10].id, medicationId: medicationsData[4].id, medicationName: 'Salbutamol Inhalador 100mcg', quantity: '1', frequency: 'As needed' },
  { id: 'd0000000-0017-4000-d000-000000000017', prescriptionId: prescriptionsData[10].id, medicationId: medicationsData[14].id, medicationName: 'Tiotropio Inhalador 18mcg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0018-4000-d000-000000000018', prescriptionId: prescriptionsData[11].id, medicationId: medicationsData[7].id, medicationName: 'Metotrexato 15mg', quantity: '1', frequency: 'Once weekly' },
  { id: 'd0000000-0019-4000-d000-000000000019', prescriptionId: prescriptionsData[12].id, medicationId: medicationsData[18].id, medicationName: 'Levetiracetam 1000mg', quantity: '1', frequency: 'Twice daily' },
  { id: 'd0000000-0020-4000-d000-000000000020', prescriptionId: prescriptionsData[12].id, medicationId: medicationsData[19].id, medicationName: 'Tacrolimus 5mg', quantity: '1', frequency: 'Twice daily' },
  { id: 'd0000000-0021-4000-d000-000000000021', prescriptionId: prescriptionsData[12].id, medicationId: medicationsData[20].id, medicationName: 'Micofenolato 500mg', quantity: '2', frequency: 'Twice daily' },
  { id: 'd0000000-0022-4000-d000-000000000022', prescriptionId: prescriptionsData[13].id, medicationId: medicationsData[24].id, medicationName: 'Sofosbuvir/Velpatasvir 400/100mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0023-4000-d000-000000000023', prescriptionId: prescriptionsData[14].id, medicationId: medicationsData[13].id, medicationName: 'Sertralina 50mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0024-4000-d000-000000000024', prescriptionId: prescriptionsData[15].id, medicationId: medicationsData[16].id, medicationName: 'Ácido Alendrónico 70mg', quantity: '1', frequency: 'Once weekly' },
  { id: 'd0000000-0025-4000-d000-000000000025', prescriptionId: prescriptionsData[15].id, medicationId: medicationsData[17].id, medicationName: 'Calcio/Vitamina D', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0026-4000-d000-000000000026', prescriptionId: prescriptionsData[16].id, medicationId: medicationsData[13].id, medicationName: 'Sertralina 50mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0027-4000-d000-000000000027', prescriptionId: prescriptionsData[17].id, medicationId: medicationsData[25].id, medicationName: 'Clonazepam 2mg', quantity: '1', frequency: 'At bedtime' },
  { id: 'd0000000-0028-4000-d000-000000000028', prescriptionId: prescriptionsData[17].id, medicationId: medicationsData[26].id, medicationName: 'Fluoxetina 20mg', quantity: '1', frequency: 'Once daily' },
  { id: 'd0000000-0029-4000-d000-000000000029', prescriptionId: prescriptionsData[18].id, medicationId: medicationsData[28].id, medicationName: 'Atorvastatina 20mg', quantity: '1', frequency: 'Once daily at night' },
  { id: 'd0000000-0030-4000-d000-000000000030', prescriptionId: prescriptionsData[19].id, medicationId: medicationsData[33].id, medicationName: 'Omeprazol 20mg', quantity: '1', frequency: 'Once daily before breakfast' },
  { id: 'd0000000-0031-4000-d000-000000000031', prescriptionId: prescriptionsData[20].id, medicationId: medicationsData[28].id, medicationName: 'Atorvastatina 20mg', quantity: '1', frequency: 'Once daily at night' },
  { id: 'd0000000-0032-4000-d000-000000000032', prescriptionId: prescriptionsData[21].id, medicationId: medicationsData[23].id, medicationName: 'Adalimumab 40mg', quantity: '1', frequency: 'Every 2 weeks' },
  { id: 'd0000000-0033-4000-d000-000000000033', prescriptionId: prescriptionsData[22].id, medicationId: medicationsData[19].id, medicationName: 'Tacrolimus 5mg', quantity: '1', frequency: 'Twice daily' },
];

const followUpsData = [
  { patientId: patientsData[0].id, patientName: patientsData[0].name, prescriptionId: prescriptionsData[1].id, status: 'pending_contact', scheduledDate: '2026-06-14', notes: 'Check blood sugar levels' },
  { patientId: patientsData[1].id, patientName: patientsData[1].name, prescriptionId: prescriptionsData[3].id, status: 'pending_contact', scheduledDate: '2026-06-15', notes: 'Blood pressure check' },
  { patientId: patientsData[2].id, patientName: patientsData[2].name, prescriptionId: prescriptionsData[4].id, status: 'contacted', scheduledDate: '2026-06-16', notes: 'Inhaler technique review' },
  { patientId: patientsData[3].id, patientName: patientsData[3].name, prescriptionId: prescriptionsData[5].id, status: 'prescription_received', scheduledDate: '2026-06-17', notes: 'Renal function labs' },
  { patientId: patientsData[4].id, patientName: patientsData[4].name, prescriptionId: prescriptionsData[6].id, status: 'prepared', scheduledDate: '2026-06-18', notes: 'Viral load test' },
  { patientId: patientsData[5].id, patientName: patientsData[5].name, prescriptionId: prescriptionsData[7].id, status: 'delivered', scheduledDate: '2026-06-10', notes: 'Delivered' },
  { patientId: patientsData[6].id, patientName: patientsData[6].name, prescriptionId: prescriptionsData[8].id, status: 'pending_contact', scheduledDate: '2026-06-19', notes: 'HbA1c check' },
  { patientId: patientsData[7].id, patientName: patientsData[7].name, prescriptionId: prescriptionsData[9].id, status: 'contacted', scheduledDate: '2026-06-20', notes: 'Eye pressure check' },
  { patientId: patientsData[8].id, patientName: patientsData[8].name, prescriptionId: prescriptionsData[10].id, status: 'pending_contact', scheduledDate: '2026-06-21', notes: 'Spirometry' },
  { patientId: patientsData[9].id, patientName: patientsData[9].name, prescriptionId: prescriptionsData[11].id, status: 'prescription_received', scheduledDate: '2026-06-22', notes: 'Joint pain assessment' },
  { patientId: patientsData[10].id, patientName: patientsData[10].name, prescriptionId: prescriptionsData[12].id, status: 'pending_contact', scheduledDate: '2026-06-23', notes: 'Tacrolimus levels' },
  { patientId: patientsData[12].id, patientName: patientsData[12].name, prescriptionId: prescriptionsData[13].id, status: 'contacted', scheduledDate: '2026-06-24', notes: 'Liver enzymes' },
  { patientId: patientsData[13].id, patientName: patientsData[13].name, prescriptionId: prescriptionsData[14].id, status: 'pending_contact', scheduledDate: '2026-06-25', notes: 'Therapy adherence' },
  { patientId: patientsData[14].id, patientName: patientsData[14].name, prescriptionId: prescriptionsData[15].id, status: 'prepared', scheduledDate: '2026-06-12', notes: 'Bone density' },
  { patientId: patientsData[15].id, patientName: patientsData[15].name, prescriptionId: prescriptionsData[16].id, status: 'delivered', scheduledDate: '2026-06-11', notes: 'Delivered' },
  { patientId: patientsData[16].id, patientName: patientsData[16].name, prescriptionId: prescriptionsData[17].id, status: 'pending_contact', scheduledDate: '2026-06-26', notes: 'Seizure frequency' },
  { patientId: patientsData[17].id, patientName: patientsData[17].name, prescriptionId: prescriptionsData[18].id, status: 'contacted', scheduledDate: '2026-06-27', notes: 'Lipid panel' },
  { patientId: patientsData[18].id, patientName: patientsData[18].name, prescriptionId: prescriptionsData[19].id, status: 'pending_contact', scheduledDate: '2026-06-28', notes: 'Reflux symptoms' },
  { patientId: patientsData[0].id, patientName: patientsData[0].name, prescriptionId: prescriptionsData[1].id, status: 'delivered', scheduledDate: '2026-06-01', notes: 'Previous pickup' },
  { patientId: patientsData[6].id, patientName: patientsData[6].name, prescriptionId: prescriptionsData[8].id, status: 'delivered', scheduledDate: '2026-06-05', notes: 'Previous pickup' },
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
  { type: 'overdue_followup', message: 'Luis Pérez follow-up is overdue', patientId: patientsData[14].id, read: false },
  { type: 'upcoming_pickup', message: 'María Fernández has a pickup scheduled in 3 days', patientId: patientsData[1].id, read: false },
  { type: 'contact_today', message: 'Jorge Sánchez needs follow-up contact today', patientId: patientsData[6].id, read: false },
  { type: 'overdue_followup', message: 'Silvia Ramírez follow-up is overdue', patientId: patientsData[9].id, read: true },
  { type: 'upcoming_pickup', message: 'Roberto Gómez has a pickup in 5 days', patientId: patientsData[2].id, read: false },
  { type: 'contact_today', message: 'Gustavo Herrera needs follow-up contact today', patientId: patientsData[10].id, read: false },
  { type: 'overdue_followup', message: 'Ana López follow-up is overdue', patientId: patientsData[3].id, read: true },
  { type: 'upcoming_pickup', message: 'Patricia Díaz has a pickup in 2 days', patientId: patientsData[7].id, read: false },
  { type: 'contact_today', message: 'Ricardo Ortiz needs follow-up contact today', patientId: patientsData[16].id, read: false },
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
