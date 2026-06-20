import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Medication = sequelize.define('Medication', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'medications',
  createdAt: 'createdAt',
  updatedAt: false,
});

export default Medication;
