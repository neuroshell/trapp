import express from 'express';
import { nanoid } from 'nanoid';
import { authenticate } from '../middleware/auth.js';
import { validateSyncRequest, workoutRules, handleValidationErrors } from '../middleware/validate.js';
import {
  getUserData,
  syncUserData,
  saveWorkout,
  deleteWorkout,
  saveAchievement,
  getUserByDeviceId,
  registerDevice,
} from '../db/index.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/sync
 * Download user's synced data
 * Optional 'since' query param for incremental sync
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    // Note: decoded JWT has 'userId' not 'id'
    const userId = req.user.userId;
    const since = req.query.since;

    logger.info(`Sync download requested - userId: ${userId}, since: ${since}`);
    logger.info(`req.user: ${JSON.stringify(req.user)}`);

    if (!userId) {
      logger.error('User ID is undefined - authentication failed!');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found in token',
      });
    }

    const userData = await getUserData(userId);
    logger.info(`User data retrieved: ${userData.workouts.length} workouts`);

    // Filter by timestamp if provided
    let filteredData = userData;
    if (since) {
      const sinceDate = new Date(since);
      logger.info(`Filtering workouts since: ${sinceDate.toISOString()}`);
      logger.info(`Before filter: ${userData.workouts.length} workouts`);
      // Use >= to include workouts updated at the exact same timestamp
      filteredData = {
        workouts: userData.workouts.filter((w) => new Date(w.updatedAt) >= sinceDate),
        achievements: userData.achievements.filter((a) => new Date(a.unlockedAt) >= sinceDate),
        profile: userData.profile,
      };
      logger.info(`After filter: ${filteredData.workouts.length} workouts`);
      if (filteredData.workouts.length > 0) {
        logger.info(`Filtered workouts: ${JSON.stringify(filteredData.workouts.map(w => ({ id: w.id, updatedAt: w.updatedAt })))}`);
      }
    }

    logger.info(`Sync download complete for user ${userId}: ${filteredData.workouts.length} workouts`);

    res.json({
      success: true,
      data: filteredData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sync
 * Upload workout data for sync
 */
router.post('/', authenticate, validateSyncRequest, async (req, res, next) => {
  try {
    // Note: decoded JWT has 'userId' not 'id'
    const userId = req.user.userId;
    const { workouts, achievements, profile } = req.body;

    logger.info(`Sync upload requested for user ${userId}: ${workouts?.length || 0} workouts`);

    const result = await syncUserData(userId, {
      workouts: workouts || [],
      achievements: achievements || [],
      profile: profile || null,
    });

    logger.info(`Sync upload complete for user ${userId}: ${result.conflicts} conflicts resolved`);

    res.json({
      success: true,
      conflicts: result.conflicts,
      resolved: result.resolved,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sync/workout
 * Sync single workout (optimized for quick log)
 */
router.post('/workout', authenticate, ...workoutRules, handleValidationErrors, async (req, res, next) => {
  try {
    // Note: decoded JWT has 'userId' not 'id'
    const userId = req.user.userId;
    const workout = req.body;

    logger.info(`Single workout sync - userId: ${userId}`);
    logger.info(`req.user: ${JSON.stringify(req.user)}`);
    logger.info(`Workout data:`, JSON.stringify(workout, null, 2));

    if (!userId) {
      logger.error('User ID is undefined - authentication failed!');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID not found in token',
      });
    }

    const savedWorkout = await saveWorkout(userId, {
      ...workout,
      id: workout.id || nanoid(),
      createdAt: workout.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    logger.info(`Workout saved successfully: ${savedWorkout.id} for user ${userId}`);

    res.status(201).json({
      success: true,
      workout: savedWorkout,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(`Failed to save workout: ${error.message}`);
    next(error);
  }
});

/**
 * PUT /api/sync/workout/:id
 * Update existing workout
 */
router.put('/workout/:id', authenticate, ...workoutRules, handleValidationErrors, async (req, res, next) => {
  try {
    // Note: decoded JWT has 'userId' not 'id'
    const userId = req.user.userId;
    const { id } = req.params;
    const workout = req.body;

    logger.info(`Update workout ${id} for user ${userId}`);

    const updatedWorkout = await saveWorkout(userId, {
      ...workout,
      id,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      workout: updatedWorkout,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/sync/workout/:id
 * Delete synced workout
 */
router.delete('/workout/:id', authenticate, async (req, res, next) => {
  try {
    // Note: decoded JWT has 'userId' not 'id'
    const userId = req.user.userId;
    const { id } = req.params;

    logger.info(`Delete workout ${id} for user ${userId}`);

    await deleteWorkout(userId, id);

    res.json({
      success: true,
      deletedId: id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sync/achievement
 * Unlock/save achievement
 */
router.post('/achievement', authenticate, async (req, res, next) => {
  try {
    // Note: decoded JWT has 'userId' not 'id'
    const userId = req.user.userId;
    const achievement = req.body;

    if (!achievement.id || !achievement.name) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Achievement must include id and name',
      });
    }

    logger.info(`Save achievement ${achievement.id} for user ${userId}`);

    const savedAchievement = await saveAchievement(userId, {
      ...achievement,
      unlockedAt: achievement.unlockedAt || new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      achievement: savedAchievement,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Legacy endpoint: POST /api/sync/device
 * For backward compatibility with device-based auth
 */
router.post('/device', async (req, res, next) => {
  try {
    const { username, passwordHash, deviceId, payload } = req.body;

    if (!username || !passwordHash || !deviceId || !payload) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'username, passwordHash, deviceId and payload are required',
      });
    }

    // Find user by device
    const user = await getUserByDeviceId(deviceId);
    if (!user || user.passwordHash !== passwordHash) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
    }

    // Register device if not already registered
    await registerDevice(user.id, deviceId);

    // Save payload as workout data
    if (payload.workouts) {
      for (const workout of payload.workouts) {
        await saveWorkout(user.id, {
          ...workout,
          id: workout.id || nanoid(),
          createdAt: workout.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    res.json({
      success: true,
      userId: user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
