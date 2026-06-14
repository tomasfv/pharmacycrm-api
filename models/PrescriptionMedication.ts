import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const PrescriptionMedication = sequelize.define('PrescriptionMedication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  prescriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'prescriptions', key: 'id' },
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
  tableName: 'prescription_medications',
  timestamps: false,
});

export default PrescriptionMedication;
