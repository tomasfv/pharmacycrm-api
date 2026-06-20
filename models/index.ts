import User from './User';
import Patient from './Patient';
import Medication from './Medication';
import Order from './Order';
import OrderMedication from './OrderMedication';
import FollowUp from './FollowUp';
import Contact from './Contact';
import Notification from './Notification';

Patient.hasMany(Order, { foreignKey: 'patientId', as: 'orders' });
Order.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Order.hasMany(OrderMedication, { foreignKey: 'orderId', as: 'medications' });
OrderMedication.belongsTo(Order, { foreignKey: 'orderId' });

Medication.hasMany(OrderMedication, { foreignKey: 'medicationId' });
OrderMedication.belongsTo(Medication, { foreignKey: 'medicationId' });

Patient.hasMany(FollowUp, { foreignKey: 'patientId', as: 'followUps' });
FollowUp.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

Order.hasMany(FollowUp, { foreignKey: 'orderId', as: 'followUps' });
FollowUp.belongsTo(Order, { foreignKey: 'orderId' });

export {
  User,
  Patient,
  Medication,
  Order,
  OrderMedication,
  FollowUp,
  Contact,
  Notification,
};
