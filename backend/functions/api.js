/**
 * Netlify Function - Standalone Express Backend
 *
 * This is a self-contained function that includes all routes
 * to avoid ES module import issues with Netlify.
 */

const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const serverless = require("serverless-http");

// App cache
let _app = null;

async function createApp() {
  if (_app) return _app;

  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // Dynamically import routes (ES modules)
  const { default: healthRoutes } = await import("../routes/health.js");
  const { default: authRoutes } = await import("../routes/auth.js");
  const { default: syncRoutes } = await import("../routes/sync.js");

  // Apply routes
  app.use("/health", healthRoutes);
  app.use("/api/health", healthRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/sync", syncRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error("[Error]", err.message);
    res.status(err.status || 500).json({
      error: err.message || "Internal server error",
    });
  });

  _app = app;
  return app;
}

// Netlify function handler
module.exports.handler = async (event, context) => {
  const app = await createApp();
  const handler = serverless(app);
  return handler(event, context);
};
