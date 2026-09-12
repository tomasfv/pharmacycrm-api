import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const CatalogOrder = sequelize.define('CatalogOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deliveryMethod: {
    type: DataTypes.ENUM('pickup', 'delivery'),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card'),
    allowNull: false,
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
}, {
  tableName: 'catalog_orders',
});

export default CatalogOrder;
