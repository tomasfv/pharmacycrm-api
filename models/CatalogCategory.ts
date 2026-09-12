import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const CatalogCategory = sequelize.define('CatalogCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'catalog_categories',
});

export default CatalogCategory;
