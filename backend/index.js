import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import { apiRateLimiter } from "./middleware/rateLimit.js";
import {
  requestLogger,
  preventPrototypePollution,
  sanitizeForLog,
} from "./middleware/security.js";
import authRoutes from "./routes/auth.js";
import healthRoutes from "./routes/health.js";
import syncRoutes from "./routes/sync.js";

// Import middleware
import { errorHandler } from "./utils/errors.js";
import logger from "./utils/logger.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────────────────────────────────────

// Helmet security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }),
);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:8081", "http://localhost:8082", "exp://localhost:8083"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parsing with size limits
app.use(
  express.json({
    limit: "2mb",
    strict: true,
  }),
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  }),
);

// Rate limiting for all API routes
app.use("/api/", apiRateLimiter);

// Prototype pollution prevention
app.use(preventPrototypePollution);

// Request logging with sanitization
app.use(requestLogger);

// ─────────────────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────────────────

// Health check (no auth required)
app.use("/api/health", healthRoutes);
app.use("/health", healthRoutes); // Legacy support

// Authentication (no auth required)
app.use("/api/auth", authRoutes);

// Sync endpoints (auth required in route handlers)
app.use("/api/sync", syncRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Error Handler
// ─────────────────────────────────────────────────────────────────────────────

app.use(errorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create and start the server
 * Exported for testing purposes
 */
export async function createServer(opts = {}) {
  const port = opts.port || PORT;
  const serverInstance = app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    logger.info(`Allowed origins: ${allowedOrigins.join(", ")}`);
  });
  return serverInstance;
}

// Only auto-start if this is the main module
let server = null;

// Graceful shutdown handlers
function setupGracefulShutdown(serverInstance) {
  process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    serverInstance.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");
    serverInstance.close(() => {
      logger.info("Server closed");
      process.exit(0);
    });
  });
}

// Export for testing
export { app };

// Start server if run directly
const isMainModule =
  process.argv[1] &&
  (process.argv[1].endsWith("index.js") ||
    process.argv[1].endsWith("index.mjs"));

if (isMainModule) {
  createServer()
    .then((serverInstance) => {
      server = serverInstance;
      setupGracefulShutdown(serverInstance);
      logger.info("Starting Trapp Tracker Backend Server...");
    })
    .catch((err) => {
      logger.error(`Failed to start server: ${err.message}`);
      process.exit(1);
    });
}

export default app;
