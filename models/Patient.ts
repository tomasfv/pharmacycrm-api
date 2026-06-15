import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dni: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    set(value: string) {
      this.setDataValue('email', value || null);
    },
    validate: { isEmail: true },
  },
  healthInsurance: {
    type: DataTypes.STRING,
    defaultValue: 'N/A',
  },
  memberNumber: {
    type: DataTypes.STRING,
    defaultValue: 'N/A',
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
  nextFollowUpDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'patients',
});

export default Patient;
