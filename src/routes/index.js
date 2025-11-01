import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { login, refresh, logout } from '../controllers/auth.controller.js';
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/suppliers.controller.js';
import { createSupplierOrder, getSupplierOrders, updateSupplierOrder, addSupplierPayment, getSupplierPayments, updateSupplierPayment, getSupplierStatement, deleteSupplierOrder, deleteSupplierPayment } from '../controllers/supplierAccounts.controller.js';
import { listProducts, createProduct, updateProduct, deleteProduct, updateStock, getProductHistory, reorderProduct } from '../controllers/products.controller.js';
import { listMarketers, createMarketer, updateMarketer, deleteMarketer } from '../controllers/marketers.controller.js';
import { listMandobes, createMandobe, updateMandobe, deleteMandobe } from '../controllers/mandobes.controller.js';
import { listOrders, getOrderById, createOrder, updateOrder, deleteOrder, updateOrderStatus, updateOrderMandobe, updateOrderPayment, getOrderStatistics } from '../controllers/orders.controller.js';
import { processBulkPayments, getMarketerPayments, getMarketerPaymentStats, getPaymentsByMonth, deletePayment } from '../controllers/marketerPayments.controller.js';
import { getProfile, updateProfile, changePassword } from '../controllers/profile.controller.js';
import usersRouter from './users.routes.js';
import healthRouter from './health.routes.js';

// Validators
import { validateLogin, validateRequest } from '../validators/auth.validator.js';
import { validateProduct, validateProductUpdate } from '../validators/products.validator.js';
import { validateOrder, validateOrderUpdate } from '../validators/orders.validator.js';
import { validateSupplier, validateSupplierUpdate } from '../validators/suppliers.validator.js';
import { validateMarketer, validateMarketerUpdate } from '../validators/marketers.validator.js';
import { validateMandobe, validateMandobeUpdate } from '../validators/mandobes.validator.js';

const router = Router();

// Health check & Keep-Alive endpoints
router.use('/', healthRouter);

// Auth
router.post('/auth/login', validateLogin, validateRequest, login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', authenticate, logout);

// Profile
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/profile/password', authenticate, changePassword);

// Users Management (Admin only)
router.use('/users', usersRouter);

// Suppliers
router.get('/suppliers', authenticate, listSuppliers);
router.post('/suppliers', authenticate, validateSupplier, validateRequest, createSupplier);
router.put('/suppliers/:id', authenticate, validateSupplierUpdate, validateRequest, updateSupplier);
router.delete('/suppliers/:id', authenticate, deleteSupplier);

// Supplier Accounts (Orders & Payments)
router.post('/supplier-orders', authenticate, createSupplierOrder);
router.get('/supplier-orders', authenticate, getSupplierOrders);
router.put('/supplier-orders/:id', authenticate, updateSupplierOrder);
router.delete('/supplier-orders/:id', authenticate, deleteSupplierOrder);
router.post('/supplier-payments', authenticate, addSupplierPayment);
router.get('/supplier-payments', authenticate, getSupplierPayments);
router.put('/supplier-payments/:id', authenticate, updateSupplierPayment);
router.delete('/supplier-payments/:id', authenticate, deleteSupplierPayment);
router.get('/suppliers/:supplier_id/statement', authenticate, getSupplierStatement);

// Products
router.get('/products', authenticate, listProducts);
router.post('/products', authenticate, validateProduct, validateRequest, createProduct);
router.put('/products/:id', authenticate, validateProductUpdate, validateRequest, updateProduct);
router.put('/products/:id/reorder', authenticate, reorderProduct);
router.put('/products/:id/stock', authenticate, updateStock);
router.get('/products/:id/history', authenticate, getProductHistory);
router.delete('/products/:id', authenticate, deleteProduct);

// Marketers
router.get('/marketers', authenticate, listMarketers);
router.post('/marketers', authenticate, validateMarketer, validateRequest, createMarketer);
router.put('/marketers/:id', authenticate, validateMarketerUpdate, validateRequest, updateMarketer);
router.delete('/marketers/:id', authenticate, deleteMarketer);

// Mandobes
router.get('/mandobes', authenticate, listMandobes);
router.post('/mandobes', authenticate, validateMandobe, validateRequest, createMandobe);
router.put('/mandobes/:id', authenticate, validateMandobeUpdate, validateRequest, updateMandobe);
router.delete('/mandobes/:id', authenticate, deleteMandobe);

// Orders
router.get('/orders', authenticate, listOrders);
router.get('/orders/statistics', authenticate, getOrderStatistics);
router.get('/orders/:id', authenticate, getOrderById);
router.post('/orders', authenticate, validateOrder, validateRequest, createOrder);
router.put('/orders/:id', authenticate, validateOrderUpdate, validateRequest, updateOrder);
router.put('/orders/:id/status', authenticate, updateOrderStatus);
router.put('/orders/:id/mandobe', authenticate, updateOrderMandobe);
router.put('/orders/:id/payment', authenticate, updateOrderPayment);
router.delete('/orders/:id', authenticate, deleteOrder);

// Marketer Payments
router.post('/marketer-payments/bulk', authenticate, processBulkPayments);
router.get('/marketer-payments/by-month', authenticate, getPaymentsByMonth);
router.get('/marketer-payments', authenticate, getMarketerPayments);
router.get('/marketer-payments/stats', authenticate, getMarketerPaymentStats);
router.delete('/marketer-payments/:id', authenticate, deletePayment);

export default router;


