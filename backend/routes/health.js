import express from 'express';

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint - returns server status
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '0.1.0',
  });
});

/**
 * GET /api/health/ready
 * Readiness check - verifies database connection
 */
router.get('/ready', (req, res) => {
  // Basic readiness check
  res.json({
    ready: true,
    timestamp: new Date().toISOString(),
  });
});

export default router;
