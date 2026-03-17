import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware
 * Configurable via environment variables
 * Disabled in test environment
 */
export const createRateLimiter = (options = {}) => {
  // Disable rate limiting in test environment
  if (process.env.NODE_ENV === 'test') {
    return (req, res, next) => next();
  }

  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
  const max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;

  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip || req.connection?.remoteAddress || 'unknown';
    },
    ...options,
  });
};

/**
 * Stricter rate limiter for auth endpoints
 * Disabled in test environment
 */
export const authRateLimiter = (req, res, next) => {
  // Disable rate limiting in test environment
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    message: {
      error: 'Too many requests',
      message: 'Too many authentication attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  })(req, res, next);
};

/**
 * Default API rate limiter
 */
export const apiRateLimiter = createRateLimiter();
