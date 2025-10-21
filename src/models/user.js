import { DataTypes, Model } from 'sequelize';

export class UserModel extends Model {}

export function initUser(sequelize) {
  UserModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('admin', 'marketer', 'mandobe', 'sales'), allowNull: false },
    permissions: { type: DataTypes.JSON, allowNull: true }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  });
  return UserModel;
}


