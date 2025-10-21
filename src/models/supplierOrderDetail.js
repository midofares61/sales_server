import { DataTypes, Model } from 'sequelize';

export class SupplierOrderDetailModel extends Model {}

export function initSupplierOrderDetail(sequelize) {
  SupplierOrderDetailModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    supplier_order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    total: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
  }, {
    sequelize,
    modelName: 'SupplierOrderDetail',
    tableName: 'supplier_order_details',
    timestamps: false
  });
  return SupplierOrderDetailModel;
}
