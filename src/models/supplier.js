import { DataTypes, Model } from 'sequelize';

export class SupplierModel extends Model {}

export function initSupplier(sequelize) {
  SupplierModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    balance: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'Supplier',
    tableName: 'suppliers',
    timestamps: false
  });
  return SupplierModel;
} 


