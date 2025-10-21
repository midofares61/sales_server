import { hasPermission, hasAnyPermission, hasAllPermissions } from '../config/permissions.js';
import { AuthorizationError } from '../utils/errors.js';
import logger from '../config/logger.js';

/**
 * Middleware to check if user has a specific permission
 * @param {string} permission - Required permission
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      logger.warn('Permission check failed: No user in request');
      throw new AuthorizationError('Authentication required');
    }
    
    // Admin role bypasses all permission checks
    if (user.role === 'admin') {
      return next();
    }
    
    const userPermissions = user.permissions || {};
    
    if (!hasPermission(userPermissions, permission)) {
      logger.warn(`Permission denied for user ${user.id}: ${permission}`);
      throw new AuthorizationError(`You don't have permission to perform this action`);
    }
    
    next();
  };
}

/**
 * Middleware to check if user has any of the specified permissions
 * @param {string[]} permissions - Array of permissions (user needs at least one)
 */
export function requireAnyPermission(permissions) {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      logger.warn('Permission check failed: No user in request');
      throw new AuthorizationError('Authentication required');
    }
    
    // Admin role bypasses all permission checks
    if (user.role === 'admin') {
      return next();
    }
    
    const userPermissions = user.permissions || {};
    
    if (!hasAnyPermission(userPermissions, permissions)) {
      logger.warn(`Permission denied for user ${user.id}: needs one of [${permissions.join(', ')}]`);
      throw new AuthorizationError(`You don't have permission to perform this action`);
    }
    
    next();
  };
}

/**
 * Middleware to check if user has all of the specified permissions
 * @param {string[]} permissions - Array of permissions (user needs all)
 */
export function requireAllPermissions(permissions) {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      logger.warn('Permission check failed: No user in request');
      throw new AuthorizationError('Authentication required');
    }
    
    // Admin role bypasses all permission checks
    if (user.role === 'admin') {
      return next();
    }
    
    const userPermissions = user.permissions || {};
    
    if (!hasAllPermissions(userPermissions, permissions)) {
      logger.warn(`Permission denied for user ${user.id}: needs all of [${permissions.join(', ')}]`);
      throw new AuthorizationError(`You don't have permission to perform this action`);
    }
    
    next();
  };
}

/**
 * Middleware to check if user has a specific role
 * @param {string|string[]} roles - Required role(s)
 */
export function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      logger.warn('Role check failed: No user in request');
      throw new AuthorizationError('Authentication required');
    }
    
    if (!allowedRoles.includes(user.role)) {
      logger.warn(`Role denied for user ${user.id}: has ${user.role}, needs one of [${allowedRoles.join(', ')}]`);
      throw new AuthorizationError(`You don't have permission to access this resource`);
    }
    
    next();
  };
}
