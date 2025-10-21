import { DataTypes, Model } from 'sequelize';

export class MarketerModel extends Model {}

export function initMarketer(sequelize) {
  MarketerModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'Marketer',
    tableName: 'marketers',
    timestamps: false
  });
  return MarketerModel;
}


