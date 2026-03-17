/**
 * Security Middleware
 * - Prototype pollution prevention
 * - Input sanitization
 * - Log injection prevention
 */

/**
 * SECURITY: Forbidden property names that could cause prototype pollution
 * Whitelist approach with comprehensive blocklist
 */
const FORBIDDEN_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toString',
  'valueOf',
  'toLocaleString',
]);

/**
 * SECURITY: Validate and sanitize a user-controlled key.
 * Uses whitelist approach with strict regex validation.
 * Returns null if the key is dangerous or invalid.
 */
export function sanitizeKey(key) {
  if (typeof key !== 'string') {
    return null;
  }

  const trimmed = key.trim();

  // Length validation
  if (trimmed.length === 0 || trimmed.length > 256) {
    return null;
  }

  // Whitelist: Only allow alphanumeric, hyphens, underscores
  const validKeyPattern = /^[a-zA-Z0-9_-]+$/;
  if (!validKeyPattern.test(trimmed)) {
    return null;
  }

  // Block forbidden keys (prototype pollution prevention)
  if (FORBIDDEN_KEYS.has(trimmed)) {
    return null;
  }

  // Block any key starting with special characters
  if (trimmed.startsWith('_') || trimmed.startsWith('$')) {
    return null;
  }

  return trimmed;
}

/**
 * SECURITY: Sanitize string for safe logging.
 * Removes control characters that could inject fake log entries.
 */
export function sanitizeForLog(str) {
  if (typeof str !== 'string') {
    str = String(str);
  }
  // Remove all ASCII control characters (including newlines) to prevent log injection
  str = str.replace(/[\x00-\x1F\x7F]/g, ' ');
  str = str.replace(/\s+/g, ' ').trim();
  // Truncate to prevent log flooding
  const MAX_LOG_LEN = 1024;
  if (str.length > MAX_LOG_LEN) {
    str = str.slice(0, MAX_LOG_LEN) + '…';
  }
  return str;
}

/**
 * Middleware: Check for prototype pollution attempts in request body/query
 */
export const preventPrototypePollution = (req, res, next) => {
  const dangerousKeys = Array.from(FORBIDDEN_KEYS);

  const checkObject = (obj, path = '') => {
    if (typeof obj !== 'object' || obj === null) return true;

    for (const key of Object.keys(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (dangerousKeys.includes(key)) {
        return false;
      }
      
      if (!checkObject(obj[key], currentPath)) {
        return false;
      }
    }
    return true;
  };

  const bodySafe = checkObject(req.body);
  const querySafe = checkObject(req.query);

  if (!bodySafe || !querySafe) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid request format',
    });
  }

  next();
};

/**
 * Middleware: Request logging with sanitization
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    // SECURITY: Sanitize all user-controlled data before logging
    const method = sanitizeForLog(req.method);
    const url = sanitizeForLog(req.originalUrl);
    const statusMessage = sanitizeForLog(res.statusMessage || '');
    const ip = sanitizeForLog(clientIp);

    console.log(
      `[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} ${statusMessage} - ${duration}ms - ${ip}`
    );
  });

  next();
};
