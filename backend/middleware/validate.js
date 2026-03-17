import { body, validationResult } from 'express-validator';
import { errors } from '../utils/errors.js';

/**
 * Valid activity types
 */
const VALID_ACTIVITY_TYPES = ['running', 'squats', 'pushups', 'pullups', 'other'];

/**
 * Workout validation rules
 */
export const workoutRules = [
  body('type')
    .isIn(VALID_ACTIVITY_TYPES)
    .withMessage('Invalid workout type. Must be one of: running, squats, pushups, pullups, other'),
  body('timestamp')
    .isISO8601()
    .withMessage('Invalid timestamp format. Must be ISO 8601'),
  body('data')
    .isObject()
    .withMessage('Data must be an object'),
  body('data.distance')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Distance must be between 0 and 100 km'),
  body('data.duration')
    .optional()
    .isFloat({ min: 0, max: 1440 })
    .withMessage('Duration must be between 0 and 1440 minutes'),
  body('data.reps')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Reps must be between 0 and 1000'),
  body('data.sets')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Sets must be between 0 and 100'),
  body('data.weight')
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage('Weight must be between 0 and 500 kg'),
];

/**
 * User registration validation
 */
export const registerRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
];

/**
 * Login validation
 */
export const loginRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Sync request validation
 * Validates bulk sync payload structure
 */
export const validateSyncRequest = [
  body().isObject().withMessage('Request body must be an object'),
  body('workouts')
    .optional()
    .isArray()
    .withMessage('Workouts must be an array'),
  body('workouts.*.type')
    .optional()
    .isIn(VALID_ACTIVITY_TYPES)
    .withMessage('Invalid workout type'),
  body('workouts.*.timestamp')
    .optional()
    .isISO8601()
    .withMessage('Invalid timestamp format'),
  body('workouts.*.data')
    .optional()
    .isObject()
    .withMessage('Workout data must be an object'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('profile')
    .optional()
    .isObject()
    .withMessage('Profile must be an object'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: errors.array(),
      });
    }
    next();
  },
];

/**
 * Validation error handler
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: errors.array(),
    });
  }
  next();
};
