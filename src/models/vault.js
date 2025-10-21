import { DataTypes, Model } from 'sequelize';

export class VaultModel extends Model {}

export function initVault(sequelize) {
  VaultModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    balance: { type: DataTypes.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
    updated_at: { type: DataTypes.DATE, allowNull: false }
  }, {
    sequelize,
    modelName: 'Vault',
    tableName: 'vault',
    timestamps: false
  });
  return VaultModel;
}
