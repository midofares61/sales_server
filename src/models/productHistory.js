import { DataTypes, Model } from 'sequelize';

export class ProductHistoryModel extends Model {}

export function initProductHistory(sequelize) {
  ProductHistoryModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    count_delta: { type: DataTypes.INTEGER, allowNull: false },
    count_before: { type: DataTypes.INTEGER, allowNull: false },
    count_after: { type: DataTypes.INTEGER, allowNull: false },
    note: { type: DataTypes.STRING, allowNull: true },
    date_time: { type: DataTypes.DATE, allowNull: false },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    sequelize,
    modelName: 'ProductHistory',
    tableName: 'product_history',
    timestamps: false
  });
  return ProductHistoryModel;
}
