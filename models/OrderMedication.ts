import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const OrderMedication = sequelize.define('OrderMedication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'orders', key: 'id' },
  },
  medicationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'medications', key: 'id' },
  },
  medicationName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '1',
  },
  frequency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '',
  },
}, {
  tableName: 'order_medications',
  timestamps: false,
});

export default OrderMedication;
