import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { successResponse } from '../utils/responseFormatter.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import logger from '../config/logger.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.sub);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return successResponse(res, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role
    }, 'Profile retrieved successfully');
  } catch (e) {
    next(e);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.sub;
    
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Check if phone is being changed and if it's already taken
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        throw new ValidationError('Phone number already exists');
      }
    }
    
    await user.update({ name, phone });
    
    logger.info(`Profile updated for user: ${userId}`);
    
    return successResponse(res, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role
    }, 'Profile updated successfully');
  } catch (e) {
    next(e);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.sub;
    
    if (!currentPassword || !newPassword) {
      throw new ValidationError('Current password and new password are required');
    }
    
    if (newPassword.length < 6) {
      throw new ValidationError('New password must be at least 6 characters long');
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      throw new ValidationError('Current password is incorrect');
    }
    
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await user.update({ password_hash: newPasswordHash });
    
    logger.info(`Password changed for user: ${userId}`);
    
    return successResponse(res, null, 'Password changed successfully');
  } catch (e) {
    next(e);
  }
};

