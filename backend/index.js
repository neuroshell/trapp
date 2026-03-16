import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY: Forbidden property names that could cause prototype pollution
// ─────────────────────────────────────────────────────────────────────────────
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * SECURITY: Validate a user-controlled key to prevent prototype pollution.
 * Returns null if the key is dangerous, otherwise returns the sanitized key.
 */
function sanitizeKey(key) {
  if (typeof key !== "string") {
    return null;
  }
  const trimmed = key.trim();
  if (trimmed.length === 0 || trimmed.length > 256) {
    return null;
  }
  if (FORBIDDEN_KEYS.has(trimmed)) {
    return null;
  }
  // Block keys starting with __ (reserved)
  if (trimmed.startsWith("__")) {
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

  // SECURITY: Use Object.create(null) for maps with user-controlled keys
  // This prevents prototype pollution even if a bad key slips through
  db.data.users = db.data.users || Object.create(null);
  db.data.devices = db.data.devices || Object.create(null);

  const ensureUser = (username, passwordHash) => {
    if (!username || !passwordHash) return null;

    // SECURITY: Sanitize the username key
    const normalized = sanitizeKey(username.toLowerCase());
    if (!normalized) {
      return null; // Invalid username format
    }

    // Ensure the users map exists before accessing it.
    db.data.users = db.data.users || Object.create(null);

    let user = db.data.users[normalized];
    if (!user) {
      user = {
        username: normalized,
        passwordHash,
        // SECURITY: Use Object.create(null) for devices map
        devices: Object.create(null),
        createdAt: Date.now(),
      };
      db.data.users[normalized] = user;
    }

    if (user.passwordHash !== passwordHash) return null;
    return user;
  };

  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  // ───────────────────────────────────────────────────────────────────────────
  // SECURITY FIX #4: Sanitize log output to prevent log injection
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

      // SECURITY: Validate deviceId is a safe key
      const safeDeviceId = sanitizeKey(deviceId);
      if (!safeDeviceId) {
        return res.status(400).json({
          error: "Invalid deviceId format",
        });
      }

      if (
        !username ||
        !passwordHash ||
        typeof payload !== "object" ||
        payload === null
      ) {
        return res.status(400).json({
          error: "username, passwordHash, deviceId and payload are required",
        });
      }

      const user = ensureUser(username, passwordHash);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // SECURITY: safeDeviceId is already validated by sanitizeKey()
      // user.devices uses Object.create(null), preventing prototype pollution
      // This is safe - deviceId is validated to block __proto__, constructor, prototype
      user.devices[safeDeviceId] = true;

      const existing = db.data.devices[safeDeviceId] || {
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

      // SECURITY: db.data.devices uses Object.create(null)
      // safeDeviceId is validated by sanitizeKey() to block dangerous keys
      // This is safe - deviceId is validated to block __proto__, constructor, prototype
      db.data.devices[safeDeviceId] = newData;
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

      // SECURITY: Validate deviceId is a safe key
      const safeDeviceId = sanitizeKey(deviceId);
      if (!safeDeviceId) {
        return res.status(400).json({
          error: "Invalid deviceId format",
        });
      }

      if (!username || !passwordHash) {
        return res.status(400).json({
          error:
            "username, passwordHash and deviceId query parameters are required",
        });
      }

      const user = ensureUser(username, passwordHash);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // SECURITY: safeDeviceId validated, user.devices is prototype-safe
      if (!user.devices[safeDeviceId]) {
        return res
          .status(403)
          .json({ error: "Device not registered for this user" });
      }

      const device = db.data.devices[safeDeviceId];
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
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('index.js') || 
  process.argv[1].endsWith('index.mjs')
);

if (isMainModule) {
  createServer().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

export { createServer };
