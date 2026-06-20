import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'patients', key: 'id' },
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastPickupDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  nextPickupDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'orders',
});

export default Order;
