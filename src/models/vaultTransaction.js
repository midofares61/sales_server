import { DataTypes, Model } from 'sequelize';

export class VaultTransactionModel extends Model {}

export function initVaultTransaction(sequelize) {
  VaultTransactionModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    type: { type: DataTypes.ENUM('in', 'out'), allowNull: false },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    note: { type: DataTypes.TEXT, allowNull: true },
    date_time: { type: DataTypes.DATE, allowNull: false },
    created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    sequelize,
    modelName: 'VaultTransaction',
    tableName: 'vault_transactions',
    timestamps: false
  });
  return VaultTransactionModel;
}
