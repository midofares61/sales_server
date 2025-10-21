import logger from '../config/logger.js';
import { AppError, ValidationError, AuthenticationError, AuthorizationError, NotFoundError } from '../utils/errors.js';

const handleSequelizeError = (err) => {
  if (err.name === 'SequelizeValidationError') {
    return new ValidationError('Validation error', err.errors.map(e => e.message));
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return new ValidationError('Duplicate entry', [err.message]);
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return new ValidationError('Foreign key constraint failed', [err.message]);
  }
  if (err.name === 'SequelizeDatabaseError') {
    return new ValidationError('Database error', [err.message]);
  }
  return err;
};

const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  return err;
};

export function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Handle specific error types
  if (err.name?.startsWith('Sequelize')) {
    error = handleSequelizeError(err);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = 'Internal server error';
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || null,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}


