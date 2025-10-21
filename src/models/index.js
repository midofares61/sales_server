import { Sequelize } from 'sequelize';
import { env } from '../config/index.js';

export const sequelize = new Sequelize(env.db.database, env.db.username, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: 'mysql',
  logging: false
});

// Models import functions
import { initSupplier } from './supplier.js';
import { initProduct } from './product.js';
import { initMarketer } from './marketer.js';
import { initMandobe } from './mandobe.js';
import { initOrder } from './order.js';
import { initOrderDetail } from './orderDetail.js';
import { initUser } from './user.js';
import { initVault } from './vault.js';
import { initVaultTransaction } from './vaultTransaction.js';
import { initProductHistory } from './productHistory.js';
import { initMandobePayment } from './mandobePayment.js';
import { initMarketerPayment } from './marketerPayment.js';
import { initSupplierOrder } from './supplierOrder.js';
import { initSupplierOrderDetail } from './supplierOrderDetail.js';
import { initSupplierPayment } from './supplierPayment.js';
import { initOrderCode } from './orderCode.js';

// Initialize models
export const Supplier = initSupplier(sequelize);
export const Product = initProduct(sequelize);
export const Marketer = initMarketer(sequelize);
export const Mandobe = initMandobe(sequelize);
export const Order = initOrder(sequelize);
export const OrderDetail = initOrderDetail(sequelize);
export const User = initUser(sequelize);
export const Vault = initVault(sequelize);
export const VaultTransaction = initVaultTransaction(sequelize);
export const ProductHistory = initProductHistory(sequelize);
export const MandobePayment = initMandobePayment(sequelize);
export const MarketerPayment = initMarketerPayment(sequelize);
export const SupplierOrder = initSupplierOrder(sequelize);
export const SupplierOrderDetail = initSupplierOrderDetail(sequelize);
export const SupplierPayment = initSupplierPayment(sequelize);
export const OrderCode = initOrderCode(sequelize);

// Associations
// Removed supplier-product association per business requirement

Marketer.hasMany(Order, { foreignKey: 'marketer_id', as: 'orders' });
Order.belongsTo(Marketer, { foreignKey: 'marketer_id', as: 'marketer' });

Mandobe.hasMany(Order, { foreignKey: 'mandobe_id', as: 'orders' });
Order.belongsTo(Mandobe, { foreignKey: 'mandobe_id', as: 'mandobeUser' });

Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'details', onDelete: 'CASCADE' });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Product.hasMany(OrderDetail, { foreignKey: 'product_id', as: 'orderDetails' });
OrderDetail.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Product History
Product.hasMany(ProductHistory, { foreignKey: 'product_id', as: 'history', onDelete: 'CASCADE' });
ProductHistory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Vault Transactions
User.hasMany(VaultTransaction, { foreignKey: 'created_by', as: 'vaultTransactions' });
VaultTransaction.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Mandobe Payments
Mandobe.hasMany(MandobePayment, { foreignKey: 'mandobe_id', as: 'payments', onDelete: 'CASCADE' });
MandobePayment.belongsTo(Mandobe, { foreignKey: 'mandobe_id', as: 'mandobe' });
User.hasMany(MandobePayment, { foreignKey: 'created_by', as: 'mandobePayments' });
MandobePayment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Marketer Payments
Marketer.hasMany(MarketerPayment, { foreignKey: 'marketer_id', as: 'payments', onDelete: 'CASCADE' });
MarketerPayment.belongsTo(Marketer, { foreignKey: 'marketer_id', as: 'marketer' });
Order.hasMany(MarketerPayment, { foreignKey: 'order_id', as: 'marketerPayments', onDelete: 'CASCADE' });
MarketerPayment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
User.hasMany(MarketerPayment, { foreignKey: 'created_by', as: 'marketerPayments' });
MarketerPayment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Supplier Orders
Supplier.hasMany(SupplierOrder, { foreignKey: 'supplier_id', as: 'orders', onDelete: 'CASCADE' });
SupplierOrder.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
User.hasMany(SupplierOrder, { foreignKey: 'created_by', as: 'supplierOrders' });
SupplierOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Supplier Order Details
SupplierOrder.hasMany(SupplierOrderDetail, { foreignKey: 'supplier_order_id', as: 'details', onDelete: 'CASCADE' });
SupplierOrderDetail.belongsTo(SupplierOrder, { foreignKey: 'supplier_order_id', as: 'supplierOrder' });
Product.hasMany(SupplierOrderDetail, { foreignKey: 'product_id', as: 'supplierOrderDetails' });
SupplierOrderDetail.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// Supplier Payments
Supplier.hasMany(SupplierPayment, { foreignKey: 'supplier_id', as: 'payments', onDelete: 'CASCADE' });
SupplierPayment.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
User.hasMany(SupplierPayment, { foreignKey: 'created_by', as: 'supplierPayments' });
SupplierPayment.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

export async function connectDatabase() {
  await sequelize.authenticate();
}


