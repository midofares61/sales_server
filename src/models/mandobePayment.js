import { DataTypes, Model } from 'sequelize';

export class MandobePaymentModel extends Model {}

export function initMandobePayment(sequelize) {
  MandobePaymentModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    mandobe_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    note: { type: DataTypes.TEXT, allowNull: true },
    date_time: { type: DataTypes.DATE, allowNull: false },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    sequelize,
    modelName: 'MandobePayment',
    tableName: 'mandobe_payments',
    timestamps: false
  });
  return MandobePaymentModel;
}
