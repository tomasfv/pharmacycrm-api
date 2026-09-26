import User from './User';
import Patient from './Patient';
import Medication from './Medication';
import Order from './Order';
import OrderMedication from './OrderMedication';
import FollowUp from './FollowUp';
import Contact from './Contact';
import Notification from './Notification';
import ActivityLog from './ActivityLog';
import CatalogCategory from './CatalogCategory';
import CatalogProduct from './CatalogProduct';
import CatalogProductVariation from './CatalogProductVariation';
import CatalogOrder from './CatalogOrder';

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

Patient.hasMany(ActivityLog, { foreignKey: 'patientId', as: 'activityLogs' });
ActivityLog.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

CatalogCategory.hasMany(CatalogProduct, { foreignKey: 'categoryId', as: 'products' });
CatalogProduct.belongsTo(CatalogCategory, { foreignKey: 'categoryId', as: 'category' });

CatalogProduct.hasMany(CatalogProductVariation, { foreignKey: 'productId', as: 'variations' });
CatalogProductVariation.belongsTo(CatalogProduct, { foreignKey: 'productId' });

export {
  User,
  Patient,
  Medication,
  Order,
  OrderMedication,
  FollowUp,
  Contact,
  Notification,
  ActivityLog,
  CatalogCategory,
  CatalogProduct,
  CatalogProductVariation,
  CatalogOrder,
};
