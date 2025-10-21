import { DataTypes, Model } from 'sequelize';

export class SupplierOrderModel extends Model {}

export function initSupplierOrder(sequelize) {
  SupplierOrderModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    supplier_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    total: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('pending', 'completed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    notes: { type: DataTypes.TEXT, allowNull: true },
    date_time: { type: DataTypes.DATE, allowNull: false },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    sequelize,
    modelName: 'SupplierOrder',
    tableName: 'supplier_orders',
    timestamps: false
  });
  return SupplierOrderModel;
}
