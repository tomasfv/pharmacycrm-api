import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const FollowUp = sequelize.define('FollowUp', {
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
  prescriptionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'prescriptions', key: 'id' },
  },
  medication: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending_contact', 'contacted', 'prescription_received', 'prepared', 'delivered'),
    defaultValue: 'prescription_received',
  },
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'follow_ups',
});

export default FollowUp;
