import { DataTypes, Model } from 'sequelize';

export class OrderModel extends Model {}

export function initOrder(sequelize) {
  OrderModel.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    order_code: { type: DataTypes.STRING(50), allowNull: true, unique: true },
    customer_name: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    phone_two: { type: DataTypes.STRING },
    address: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    date_time: { type: DataTypes.DATE, allowNull: true },
    nameAdd: { type: DataTypes.STRING },
    nameEdit: { type: DataTypes.STRING },
    sells: { type: DataTypes.BOOLEAN, defaultValue: false },
    mandobe: { type: DataTypes.BOOLEAN, defaultValue: false },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    shipping: { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: null },
    status: { type: DataTypes.ENUM('pending', 'accept', 'refuse', 'delay'), defaultValue: 'pending' },
    notes: { type: DataTypes.TEXT },
    mandobe_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    marketer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
  return OrderModel;
}


