import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const CatalogProductVariation = sequelize.define('CatalogProductVariation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'catalog_products', key: 'id' },
  },
  label: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'catalog_product_variations',
});

export default CatalogProductVariation;
