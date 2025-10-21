import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { env } from '../config/index.js';
import { successResponse, errorResponse } from '../utils/responseFormatter.js';
import { AuthenticationError } from '../utils/errors.js';
import logger from '../config/logger.js';
import { mergePermissions, getRoleNameArabic } from '../config/permissions.js';

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      logger.warn(`Failed login attempt for username: ${username} - User not found`);
      throw new AuthenticationError('Invalid credentials');
    }
    
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      logger.warn(`Failed login attempt for username: ${username} - Invalid password`);
      throw new AuthenticationError('Invalid credentials');
    }
    
    const token = jwt.sign(
      { sub: user.id, role: user.role, name: user.name }, 
      env.jwt.secret, 
      { expiresIn: env.jwt.expiresIn }
    );
    
    // Generate refresh token (longer expiry)
    const refreshToken = jwt.sign(
      { sub: user.id, type: 'refresh' },
      env.jwt.secret,
      { expiresIn: '90d' }
    );
    
    // Merge role-based permissions with custom user permissions
    const permissions = mergePermissions(user.role, user.permissions);
    
    logger.info(`Successful login for user: ${user.name} (${user.role})`);
    
    return successResponse(res, {
      token,
      refreshToken,
      user: { 
        id: user.id, 
        name: user.name, 
        username: user.username,
        phone: user.phone, 
        role: user.role,
        roleNameArabic: getRoleNameArabic(user.role),
        permissions
      }
    }, 'Login successful');
  } catch (e) { 
    next(e); 
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token is required');
    }
    
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.jwt.secret);
    } catch (err) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
    
    if (decoded.type !== 'refresh') {
      throw new AuthenticationError('Invalid token type');
    }
    
    const user = await User.findByPk(decoded.sub);
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    
    // Generate new access token
    const token = jwt.sign(
      { sub: user.id, role: user.role, name: user.name },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );
    
    logger.info(`Token refreshed for user: ${user.name}`);
    
    return successResponse(res, { token }, 'Token refreshed successfully');
  } catch (e) {
    next(e);
  }
};

export const logout = async (req, res, next) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we log it for audit purposes
    logger.info(`User logged out: ${req.user?.name || 'Unknown'}`);
    
    return successResponse(res, null, 'Logged out successfully');
  } catch (e) {
    next(e);
  }
};


