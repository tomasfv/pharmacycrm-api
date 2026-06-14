import User from './User';
import Patient from './Patient';
import Medication from './Medication';
import Prescription from './Prescription';
import PrescriptionMedication from './PrescriptionMedication';
import FollowUp from './FollowUp';
import Contact from './Contact';
import Notification from './Notification';

Patient.hasMany(Prescription, { foreignKey: 'patientId', as: 'prescriptions' });
Prescription.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Prescription.hasMany(PrescriptionMedication, { foreignKey: 'prescriptionId', as: 'medications' });
PrescriptionMedication.belongsTo(Prescription, { foreignKey: 'prescriptionId' });

Medication.hasMany(PrescriptionMedication, { foreignKey: 'medicationId' });
PrescriptionMedication.belongsTo(Medication, { foreignKey: 'medicationId' });

Patient.hasMany(FollowUp, { foreignKey: 'patientId', as: 'followUps' });
FollowUp.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Prescription.hasMany(FollowUp, { foreignKey: 'prescriptionId', as: 'followUps' });
FollowUp.belongsTo(Prescription, { foreignKey: 'prescriptionId' });

export {
  User,
  Patient,
  Medication,
  Prescription,
  PrescriptionMedication,
  FollowUp,
  Contact,
  Notification,
};
