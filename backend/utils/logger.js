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

// Remove line breaks from log messages to prevent log injection via user-controlled input
const sanitizeLogValue = (value) => {
  if (typeof value === 'string') {
    return value.replace(/[\r\n]/g, '');
  }
  return value;
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const safeMessage = sanitizeLogValue(message);
  const safeMeta =
    meta && typeof meta === 'object'
      ? Object.fromEntries(
          Object.entries(meta).map(([key, val]) => [
            key,
            sanitizeLogValue(val),
          ]),
        )
      : meta;
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
