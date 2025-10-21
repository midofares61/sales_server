import bcrypt from 'bcrypt';
import { User } from '../models/index.js';
import { successResponse } from '../utils/responseFormatter.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import logger from '../config/logger.js';
import { getRoleNameArabic, ROLE_PERMISSIONS } from '../config/permissions.js';

/**
 * Parse permissions if they are stored as string
 */
function parsePermissions(permissions) {
  if (typeof permissions === 'string') {
    try {
      return JSON.parse(permissions);
    } catch (e) {
      return permissions;
    }
  }
  return permissions;
}

/**
 * Get all users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    
    const where = {};
    if (role) where.role = role;
    
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password_hash'] },
      order: [['id', 'DESC']]
    });
    
    // Add Arabic role name to each user and parse permissions
    const usersWithPermissions = users.map(user => {
      const userData = user.toJSON();
      return {
        ...userData,
        permissions: parsePermissions(userData.permissions),
        roleNameArabic: getRoleNameArabic(user.role)
      };
    });
    
    return successResponse(res, {
      users: usersWithPermissions,
      total: usersWithPermissions.length
    });
  } catch (e) {
    next(e);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    const userJson = user.toJSON();
    const userData = {
      ...userJson,
      permissions: parsePermissions(userJson.permissions),
      roleNameArabic: getRoleNameArabic(user.role)
    };
    
    return successResponse(res, userData);
  } catch (e) {
    next(e);
  }
};

/**
 * Create new user
 */
export const createUser = async (req, res, next) => {
  try {
    const { name, username, phone, password, role, permissions } = req.body;
    
    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new ValidationError('Username already exists');
    }
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    const userRole = role || 'sales';
    
    // If permissions are provided, use them as-is
    // Otherwise, use default permissions for the role
    const userPermissions = permissions !== undefined 
      ? permissions 
      : ROLE_PERMISSIONS[userRole];
    
    // Create user
    const user = await User.create({
      name,
      username,
      phone,
      password_hash,
      role: userRole,
      permissions: userPermissions
    });
    
    logger.info(`User created: ${user.username} (${user.role}) by admin ${req.user.id}`);
    
    const userJson = user.toJSON();
    const userData = {
      ...userJson,
      permissions: parsePermissions(userJson.permissions),
      roleNameArabic: getRoleNameArabic(user.role)
    };
    delete userData.password_hash;
    
    return successResponse(res, userData, 'User created successfully', 201);
  } catch (e) {
    next(e);
  }
};

/**
 * Update user
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, username, phone, role, permissions, password } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Check if new username already exists (if username is being changed)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        throw new ValidationError('Username already exists');
      }
    }
    
    // Validate password if provided
    if (password && password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }
    
    // Prepare update data
    const updateData = {
      name: name || user.name,
      username: username || user.username,
      phone: phone !== undefined ? phone : user.phone,
      role: role || user.role,
      permissions: permissions !== undefined ? permissions : user.permissions
    };
    
    // Hash and add password if provided
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    
    // Update user
    await user.update(updateData);
    
    logger.info(`User updated: ${user.username} by admin ${req.user.id}${password ? ' (password changed)' : ''}`);
    
    const userJson = user.toJSON();
    const userData = {
      ...userJson,
      permissions: parsePermissions(userJson.permissions),
      roleNameArabic: getRoleNameArabic(user.role)
    };
    delete userData.password_hash;
    
    return successResponse(res, userData, 'User updated successfully');
  } catch (e) {
    next(e);
  }
};

/**
 * Update user permissions
 */
export const updateUserPermissions = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    await user.update({ permissions });
    
    logger.info(`Permissions updated for user: ${user.username} by admin ${req.user.id}`);
    
    const userJson = user.toJSON();
    const userData = {
      ...userJson,
      permissions: parsePermissions(userJson.permissions),
      roleNameArabic: getRoleNameArabic(user.role)
    };
    delete userData.password_hash;
    
    return successResponse(res, userData, 'Permissions updated successfully');
  } catch (e) {
    next(e);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      throw new ValidationError('You cannot delete your own account');
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    await user.destroy();
    
    logger.info(`User deleted: ${user.username} by admin ${req.user.id}`);
    
    return successResponse(res, null, 'User deleted successfully');
  } catch (e) {
    next(e);
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }
    
    const user = await User.findByPk(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    const password_hash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash });
    
    logger.info(`Password changed for user: ${user.username} by admin ${req.user.id}`);
    
    return successResponse(res, null, 'Password changed successfully');
  } catch (e) {
    next(e);
  }
};

/**
 * Get available roles and their default permissions
 */
export const getRolesAndPermissions = async (req, res, next) => {
  try {
    const rolesData = Object.keys(ROLE_PERMISSIONS).map(role => ({
      role,
      roleNameArabic: getRoleNameArabic(role),
      permissions: ROLE_PERMISSIONS[role]
    }));
    
    return successResponse(res, { roles: rolesData });
  } catch (e) {
    next(e);
  }
};
