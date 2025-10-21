import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserPermissions,
  deleteUser,
  changeUserPassword,
  getRolesAndPermissions
} from '../controllers/users.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/permissions.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin'));

// Get all roles and their default permissions
router.get('/roles', getRolesAndPermissions);

// CRUD operations
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Permission management
router.put('/:id/permissions', updateUserPermissions);

// Password management
router.put('/:id/password', changeUserPassword);

export default router;
