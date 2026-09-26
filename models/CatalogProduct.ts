import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const CatalogProduct = sequelize.define('CatalogProduct', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'catalog_categories', key: 'id' },
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'catalog_products',
});

export default CatalogProduct;
