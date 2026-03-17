import express from 'express';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { registerRules, loginRules, handleValidationErrors } from '../middleware/validate.js';
import { generateToken } from '../middleware/auth.js';
import { createUser, getUserByEmail } from '../db/index.js';
import { errors } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { authRateLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  authRateLimiter,
  registerRules,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password, username } = req.body;

      logger.info(`Registration attempt for email: ${email}`);

      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        logger.warn(`Registration failed - email already exists: ${email}`);
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email already registered',
        });
      }

      // Hash password with bcrypt
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userId = nanoid();
      const user = await createUser(userId, {
        email,
        passwordHash,
        username: username || email.split('@')[0],
        createdAt: new Date().toISOString(),
      });

      logger.info(`User registered successfully: ${email}`);

      // Generate JWT token
      const token = generateToken(userId, email);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      });
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post(
  '/login',
  authRateLimiter,
  loginRules,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      logger.info(`Login attempt for email: ${email}`);

      // Find user by email
      const user = await getUserByEmail(email);
      if (!user) {
        logger.warn(`Login failed - user not found: ${email}`);
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        logger.warn(`Login failed - invalid password for: ${email}`);
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      logger.info(`User logged in successfully: ${email}`);

      // Generate JWT token
      const token = generateToken(user.id, email);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
      });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      next(error);
    }
  }
);

/**
 * POST /api/auth/verify
 * Verify JWT token validity
 */
router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No token provided',
    });
  }

  // Token verification happens in authenticate middleware
  // If we reach here, token is valid
  res.json({
    valid: true,
    user: req.user,
  });
});

export default router;
