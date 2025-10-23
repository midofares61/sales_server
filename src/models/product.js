import { DataTypes, Model } from 'sequelize';

export class ProductModel extends Model {}

export function initProduct(sequelize) {
  ProductModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    code: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    count: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    order_by: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products', 
    timestamps: false
  });
  return ProductModel;
}


