import logger from './logger.js';

/**
 * Global error handler middleware
 * Handles all errors consistently and securely
 */
export const errorHandler = (err, req, res, next) => {
  // Log error with context
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Determine status code
  const status = err.status || err.statusCode || 500;

  // Build response - don't leak internals in production
  const response = {
    error: err.name || 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  // Add validation details if present
  if (err.details) {
    response.details = err.details;
  }

  res.status(status).json(response);
};

/**
 * Custom AppError class for consistent error handling
 */
export class AppError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create specific error types
 */
export const errors = {
  badRequest: (message, details) => new AppError(message, 400, details),
  unauthorized: (message) => new AppError(message, 401),
  forbidden: (message) => new AppError(message, 403),
  notFound: (message) => new AppError(message, 404),
  tooManyRequests: (message) => new AppError(message, 429),
  internal: (message) => new AppError(message, 500),
};
