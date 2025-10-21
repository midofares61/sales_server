import { DataTypes, Model } from 'sequelize';

export class MarketerPaymentModel extends Model {}

export function initMarketerPayment(sequelize) {
  MarketerPaymentModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    marketer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    commission: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    payment_date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    sequelize,
    modelName: 'MarketerPayment',
    tableName: 'marketer_payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
  return MarketerPaymentModel;
}
