import { DataTypes, Model } from 'sequelize';

export class SupplierPaymentModel extends Model {}

export function initSupplierPayment(sequelize) {
  SupplierPaymentModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    supplier_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    note: { type: DataTypes.TEXT, allowNull: true },
    date_time: { type: DataTypes.DATE, allowNull: false },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    sequelize,
    modelName: 'SupplierPayment',
    tableName: 'supplier_payments',
    timestamps: false
  });
  return SupplierPaymentModel;
}
