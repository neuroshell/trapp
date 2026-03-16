import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY: Forbidden property names that could cause prototype pollution
// Whitelist approach with comprehensive blocklist
// ─────────────────────────────────────────────────────────────────────────────
const FORBIDDEN_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toString",
  "valueOf",
  "toLocaleString",
]);

/**
 * SECURITY: Validate and sanitize a user-controlled key.
 * Uses whitelist approach with strict regex validation.
 * Returns null if the key is dangerous or invalid.
 */
function sanitizeKey(key) {
  if (typeof key !== "string") {
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
  if (trimmed.startsWith("_") || trimmed.startsWith("$")) {
    return null;
  }

  return trimmed;
}

/**
 * SECURITY: Sanitize string for safe logging.
 * Removes control characters that could inject fake log entries.
 */
function sanitizeForLog(str) {
  if (typeof str !== "string") {
    str = String(str);
  }
  // Remove newline characters to prevent log line injection
  str = str.replace(/[\r\n]/g, " ");
  str = str.replace(/\s+/g, " ").trim();
  // Truncate to prevent log flooding
  const MAX_LOG_LEN = 1024;
  if (str.length > MAX_LOG_LEN) {
    str = str.slice(0, MAX_LOG_LEN) + "…";
  }
  return str;
}

async function createServer(opts = {}) {
  const PORT = opts.port ?? process.env.PORT ?? 4000;
  const DB_FILE = opts.dbFile ?? process.env.DB_FILE ?? "data.json";

  const adapter = new JSONFile(DB_FILE);
  const db = new Low(adapter);
  await db.read();
  db.data = db.data || {};

  // SECURITY: Use Map for user-controlled keys to prevent prototype pollution
  // Maps don't have prototype chain, making them immune to prototype pollution
  db.data.users = new Map();
  db.data.devices = new Map();

  const ensureUser = (username, passwordHash) => {
    if (!username || !passwordHash) return null;

    // SECURITY: Sanitize the username key with strict validation
    const normalized = sanitizeKey(username.toLowerCase());
    if (!normalized) {
      return null; // Invalid username format
    }

    // Ensure the users map exists
    if (!(db.data.users instanceof Map)) {
      db.data.users = new Map();
    }

    let user = db.data.users.get(normalized);
    if (!user) {
      user = {
        username: normalized,
        passwordHash,
        // SECURITY: Use Map for devices to prevent prototype pollution
        devices: new Map(),
        createdAt: Date.now(),
      };
      db.data.users.set(normalized, user);
    }

    if (user.passwordHash !== passwordHash) return null;
    return user;
  };

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  // ───────────────────────────────────────────────────────────────────────────
  // SECURITY FIX: Sanitize log output to prevent log injection
  // ───────────────────────────────────────────────────────────────────────────
  app.use((req, res, next) => {
    const start = Date.now();
    const clientIp = req.ip || req.connection?.remoteAddress || "unknown";

    res.on("finish", () => {
      const duration = Date.now() - start;
      // SECURITY: Sanitize all user-controlled data before logging
      const method = sanitizeForLog(req.method);
      const url = sanitizeForLog(req.originalUrl);
      const statusMessage = sanitizeForLog(res.statusMessage || "");
      const ip = sanitizeForLog(clientIp);

      console.log(
        `[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} ${statusMessage} - ${duration}ms - ${ip}`,
      );
    });

    next();
  });

  app.get("/health", (req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  // Upload sync payload for a device (requires username/password).
  app.post("/sync", async (req, res) => {
    try {
      const { username, passwordHash, deviceId, payload } = req.body;

      // SECURITY: Validate deviceId with strict whitelist regex
      const safeDeviceId = sanitizeKey(deviceId);
      if (!safeDeviceId) {
        return res
          .status(400)
          .json({ error: "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed." });
      }

      if (!username || !passwordHash || typeof payload !== "object" || payload === null) {
        return res.status(400).json({
          error: "username, passwordHash, deviceId and payload are required",
        });
      }

      const user = ensureUser(username, passwordHash);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // SECURITY: safeDeviceId is validated, Map prevents prototype pollution
      user.devices.set(safeDeviceId, true);

      const existing = db.data.devices.get(safeDeviceId) || {
        id: safeDeviceId,
        updatedAt: 0,
        payload: {},
        owner: username,
      };
      const updatedAt = Date.now();
      const newData = {
        ...existing,
        id: safeDeviceId,
        owner: user.username,
        updatedAt,
        payload,
      };

      // SECURITY: Map prevents prototype pollution
      db.data.devices.set(safeDeviceId, newData);
      await db.write();

      res.json({ ok: true, device: newData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Download sync payload for a device (requires username/password).
  app.get("/sync", async (req, res) => {
    try {
      const { username, passwordHash, deviceId } = req.query;

      // SECURITY: Validate deviceId with strict whitelist regex
      const safeDeviceId = sanitizeKey(deviceId);
      if (!safeDeviceId) {
        return res
          .status(400)
          .json({ error: "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed." });
      }

      if (!username || !passwordHash) {
        return res.status(400).json({
          error: "username, passwordHash and deviceId query parameters are required",
        });
      }

      const user = ensureUser(username, passwordHash);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // SECURITY: safeDeviceId validated, Map prevents prototype pollution
      if (!user.devices.has(safeDeviceId)) {
        return res.status(403).json({ error: "Device not registered for this user" });
      }

      const device = db.data.devices.get(safeDeviceId);
      if (!device) {
        return res.json({ ok: true, device: null });
      }

      res.json({ ok: true, device });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const server = app.listen(PORT, () => {
    console.log(`Trapp backend listening on http://localhost:${PORT}`);
  });

  return server;
}

// Start server if run directly
// Check if this file is being run directly (not imported)
const isMainModule =
  process.argv[1] && (process.argv[1].endsWith("index.js") || process.argv[1].endsWith("index.mjs"));

if (isMainModule) {
  createServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

export { createServer };
