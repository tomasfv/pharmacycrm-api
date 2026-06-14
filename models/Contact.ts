import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true },
  },
  category: {
    type: DataTypes.ENUM('supplier', 'delivery', 'doctor', 'lab', 'other'),
    defaultValue: 'other',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'contacts',
  createdAt: 'createdAt',
  updatedAt: false,
});

export default Contact;
