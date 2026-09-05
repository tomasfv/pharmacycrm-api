import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const ActivityLog = sequelize.define('ActivityLog', {
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
  type: {
    type: DataTypes.ENUM(
      'patient_registered',
      'order_created',
      'order_picked_up',
      'follow_up_status_changed',
    ),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  tableName: 'activity_logs',
  createdAt: 'createdAt',
  updatedAt: false,
});

export default ActivityLog;
