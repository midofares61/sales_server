import { DataTypes, Model } from 'sequelize';

export class OrderCodeModel extends Model {}

export function initOrderCode(sequelize) {
  OrderCodeModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    current: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    updated_at: { type: DataTypes.DATE, allowNull: false }
  }, {
    sequelize,
    modelName: 'OrderCode',
    tableName: 'order_codes',
    timestamps: false
  });
  return OrderCodeModel;
}
