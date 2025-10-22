import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.js';
import { login, refresh, logout } from '../controllers/auth.controller.js';
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../controllers/suppliers.controller.js';
import { createSupplierOrder, getSupplierOrders, updateSupplierOrder, addSupplierPayment, getSupplierPayments, updateSupplierPayment, getSupplierStatement, deleteSupplierOrder, deleteSupplierPayment } from '../controllers/supplierAccounts.controller.js';
import { listProducts, createProduct, updateProduct, deleteProduct, updateStock, getProductHistory, reorderProduct } from '../controllers/products.controller.js';
import { listMarketers, createMarketer, updateMarketer, deleteMarketer } from '../controllers/marketers.controller.js';
import { listMandobes, createMandobe, updateMandobe, deleteMandobe } from '../controllers/mandobes.controller.js';
import { listOrders, getOrderById, createOrder, updateOrder, deleteOrder, updateOrderStatus, updateOrderMandobe, updateOrderPayment, getOrderStatistics, getNextOrderCode } from '../controllers/orders.controller.js';
import { processBulkPayments, getMarketerPayments, getMarketerPaymentStats, getPaymentsByMonth, deletePayment } from '../controllers/marketerPayments.controller.js';
import { getProfile, updateProfile, changePassword } from '../controllers/profile.controller.js';
import usersRouter from './users.routes.js';

// Validators
import { validateLogin, validateRequest } from '../validators/auth.validator.js';
import { validateProduct, validateProductUpdate } from '../validators/products.validator.js';
import { validateOrder, validateOrderUpdate } from '../validators/orders.validator.js';
import { validateSupplier, validateSupplierUpdate } from '../validators/suppliers.validator.js';
import { validateMarketer, validateMarketerUpdate } from '../validators/marketers.validator.js';
import { validateMandobe, validateMandobeUpdate } from '../validators/mandobes.validator.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

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
router.post('/suppliers', authenticate, authorize('admin'), validateSupplier, validateRequest, createSupplier);
router.put('/suppliers/:id', authenticate, authorize('admin'), validateSupplierUpdate, validateRequest, updateSupplier);
router.delete('/suppliers/:id', authenticate, authorize('admin'), deleteSupplier);

// Supplier Accounts (Orders & Payments)
router.post('/supplier-orders', authenticate, authorize('admin'), createSupplierOrder);
router.get('/supplier-orders', authenticate, authorize('admin'), getSupplierOrders);
router.put('/supplier-orders/:id', authenticate, authorize('admin'), updateSupplierOrder);
router.delete('/supplier-orders/:id', authenticate, authorize('admin'), deleteSupplierOrder);
router.post('/supplier-payments', authenticate, authorize('admin'), addSupplierPayment);
router.get('/supplier-payments', authenticate, authorize('admin'), getSupplierPayments);
router.put('/supplier-payments/:id', authenticate, authorize('admin'), updateSupplierPayment);
router.delete('/supplier-payments/:id', authenticate, authorize('admin'), deleteSupplierPayment);
router.get('/suppliers/:supplier_id/statement', authenticate, authorize('admin'), getSupplierStatement);

// Products
router.get('/products', authenticate, listProducts);
router.post('/products', authenticate, authorize('admin'), validateProduct, validateRequest, createProduct);
router.put('/products/:id', authenticate, authorize('admin'), validateProductUpdate, validateRequest, updateProduct);
router.put('/products/:id/reorder', authenticate, authorize('admin'), reorderProduct);
router.put('/products/:id/stock', authenticate, authorize('admin'), updateStock);
router.get('/products/:id/history', authenticate, getProductHistory);
router.delete('/products/:id', authenticate, authorize('admin'), deleteProduct);

// Marketers
router.get('/marketers', authenticate, listMarketers);
router.post('/marketers', authenticate, authorize('admin'), validateMarketer, validateRequest, createMarketer);
router.put('/marketers/:id', authenticate, authorize('admin'), validateMarketerUpdate, validateRequest, updateMarketer);
router.delete('/marketers/:id', authenticate, authorize('admin'), deleteMarketer);

// Mandobes
router.get('/mandobes', authenticate, listMandobes);
router.post('/mandobes', authenticate, authorize('admin'), validateMandobe, validateRequest, createMandobe);
router.put('/mandobes/:id', authenticate, authorize('admin'), validateMandobeUpdate, validateRequest, updateMandobe);
router.delete('/mandobes/:id', authenticate, authorize('admin'), deleteMandobe);

// Orders
router.get('/orders', authenticate, listOrders);
router.get('/orders/statistics', authenticate, getOrderStatistics);
router.get('/orders/next-code', authenticate, getNextOrderCode);
router.get('/orders/:id', authenticate, getOrderById);
router.post('/orders', authenticate, authorize('admin', 'marketer'), validateOrder, validateRequest, createOrder);
router.put('/orders/:id', authenticate, authorize('admin', 'marketer'), validateOrderUpdate, validateRequest, updateOrder);
router.put('/orders/:id/status', authenticate, authorize('admin', 'marketer'), updateOrderStatus);
router.put('/orders/:id/mandobe', authenticate, authorize('admin'), updateOrderMandobe);
router.put('/orders/:id/payment', authenticate, authorize('admin'), updateOrderPayment);
router.delete('/orders/:id', authenticate, authorize('admin'), deleteOrder);

// Marketer Payments
router.post('/marketer-payments/bulk', authenticate, authorize('admin'), processBulkPayments);
router.get('/marketer-payments/by-month', authenticate, authorize('admin'), getPaymentsByMonth);
router.get('/marketer-payments', authenticate, authorize('admin'), getMarketerPayments);
router.get('/marketer-payments/stats', authenticate, authorize('admin'), getMarketerPaymentStats);
router.delete('/marketer-payments/:id', authenticate, authorize('admin'), deletePayment);

export default router;


