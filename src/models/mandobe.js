import { DataTypes, Model } from 'sequelize';

export class MandobeModel extends Model {}

export function initMandobe(sequelize) {
  MandobeModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'Mandobe',
    tableName: 'mandobes',
    timestamps: false
  });
  return MandobeModel;
}


