import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logLevel = process.env.LOG_LEVEL || 'info';
const logFile = process.env.LOG_FILE || 'logs/app.log';

// Ensure log directory exists
const logDir = path.dirname(logFile);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const shouldLog = (level) => levels[level] <= levels[logLevel];

// Sanitize potentially user-controlled values before logging to prevent
// log injection via newlines or other control characters.
const sanitizeLogValue = (value) => {
  if (!value || typeof value !== 'string') {
    return value;
  }
  // Replace CR/LF sequences with a single space to keep log lines single-line.
  return value.replace(/[\r\n]+/g, ' ');
};

const sanitizeMeta = (meta) => {
  if (!meta || typeof meta !== 'object') {
    return meta;
  }

  const sanitized = Array.isArray(meta) ? [] : {};

  for (const [key, value] of Object.entries(meta)) {
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeMeta(value);
    } else {
      sanitized[key] = sanitizeLogValue(value);
    }
  }

  return sanitized;
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const safeMessage = sanitizeLogValue(message);
  const safeMeta = sanitizeMeta(meta);
  const metaStr =
    safeMeta && Object.keys(safeMeta).length
      ? ` ${JSON.stringify(safeMeta)}`
      : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${safeMessage}${metaStr}`;
};

const writeLog = (level, message, meta = {}) => {
  if (!shouldLog(level)) return;

  const formattedMessage = formatMessage(level, message, meta);

  // Console output
  if (level === 'error') {
    console.error(formattedMessage);
  } else if (level === 'warn') {
    console.warn(formattedMessage);
  } else {
    console.log(formattedMessage);
  }

  // File output
  try {
    fs.appendFileSync(logFile, formattedMessage + '\n');
  } catch (err) {
    // Silent fail for file logging
  }
};

const logger = {
  error: (message, meta) => writeLog('error', message, meta),
  warn: (message, meta) => writeLog('warn', message, meta),
  info: (message, meta) => writeLog('info', message, meta),
  debug: (message, meta) => writeLog('debug', message, meta),
};

export default logger;
