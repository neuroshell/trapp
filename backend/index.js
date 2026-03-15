import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";

async function createServer(opts = {}) {
  const PORT = opts.port ?? process.env.PORT ?? 4000;
  const DB_FILE = opts.dbFile ?? process.env.DB_FILE ?? "data.json";

  const adapter = new JSONFile(DB_FILE);
  const db = new Low(adapter);
  await db.read();
  db.data = db.data || {};
  db.data.users = db.data.users || {};
  db.data.devices = db.data.devices || {};

  const ensureUser = (username, passwordHash) => {
    if (!username || !passwordHash) return null;
    const normalized = username.toLowerCase();

    // Ensure the users map exists before accessing it.
    db.data.users = db.data.users || {};

    let user = db.data.users[normalized];
    if (!user) {
      user = {
        username: normalized,
        passwordHash,
        devices: {},
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

  // Basic request/response logging for debugging
  app.use((req, res, next) => {
    const start = Date.now();
    const clientIp = req.ip || req.connection?.remoteAddress || "unknown";

    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} ${res.statusMessage || ""} - ${duration}ms - ${clientIp}`,
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
      if (!username || !passwordHash || !deviceId || typeof payload !== "object") {
        return res.status(400).json({
          error: "username, passwordHash, deviceId and payload are required",
        });
      }

      const user = ensureUser(username, passwordHash);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      // Track device for the user
      user.devices[deviceId] = true;

      const existing = db.data.devices[deviceId] || { id: deviceId, updatedAt: 0, payload: {}, owner: username };
      const updatedAt = Date.now();
      const newData = {
        ...existing,
        id: deviceId,
        owner: user.username,
        updatedAt,
        payload,
      };

      db.data.devices[deviceId] = newData;
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
      if (!username || !passwordHash || !deviceId) {
        return res.status(400).json({
          error: "username, passwordHash and deviceId query parameters are required",
        });
      }

      const user = ensureUser(username, passwordHash);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }

      if (!user.devices[deviceId]) {
        return res.status(403).json({ error: "Device not registered for this user" });
      }

      const device = db.data.devices[deviceId];
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
if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { createServer };
