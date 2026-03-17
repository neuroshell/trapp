import fs from "fs";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";
import { fileURLToPath } from "url";

import logger from "../utils/logger.js";
import { sanitizeKey } from "../middleware/security.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database instance (singleton)
let dbInstance = null;
let adapterInstance = null;

/**
 * Get or create database file path
 */
function getDbFilePath() {
  return process.env.DB_FILE || path.join(__dirname, "..", "data", "db.json");
}

/**
 * Initialize or reinitialize database connection
 * Call this when process.env.DB_FILE changes (e.g., in tests)
 */
export async function initDatabase() {
  const DB_FILE = getDbFilePath();

  // Ensure data directory exists
  const dataDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Create new adapter and database instance
  adapterInstance = new JSONFile(DB_FILE);
  dbInstance = new Low(adapterInstance);

  // Read existing data or initialize
  await dbInstance.read();
  dbInstance.data = dbInstance.data || {
    users: {},
    workouts: {},
    achievements: {},
    devices: {},
  };

  // Write default structure if empty
  if (Object.keys(dbInstance.data).length === 0) {
    dbInstance.data = {
      users: {},
      workouts: {},
      achievements: {},
      devices: {},
    };
    await dbInstance.write();
  }

  return dbInstance;
}

/**
 * Get database instance (lazy initialization)
 */
function getDb() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return dbInstance;
}

// Auto-initialize on module load for production use
await initDatabase();

/**
 * User Operations
 */

/**
 * Create a new user
 */
export async function createUser(userId, userData) {
  const db = getDb();
  const user = {
    id: userId,
    email: userData.email.toLowerCase().trim(),
    username: userData.username || userData.email.split("@")[0],
    passwordHash: userData.passwordHash,
    displayName: userData.displayName || null,
    profile: userData.profile || null,
    devices: [],
    createdAt: userData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.data.users[userId] = user;
  await db.write();

  logger.debug(`User created: ${user.email}`);
  return user;
}

/**
 * Get user by ID
 */
export function getUserById(userId) {
  const db = getDb();
  return db.data.users[userId] || null;
}

/**
 * Get user by email
 */
export function getUserByEmail(email) {
  const db = getDb();
  const normalizedEmail = email.toLowerCase().trim();
  return (
    Object.values(db.data.users).find(
      (user) => user.email.toLowerCase() === normalizedEmail,
    ) || null
  );
}

/**
 * Get user by device ID (legacy support)
 */
export function getUserByDeviceId(deviceId) {
  const db = getDb();
  return (
    Object.values(db.data.users).find(
      (user) => user.devices && user.devices.includes(deviceId),
    ) || null
  );
}

/**
 * Update user
 */
export async function updateUser(userId, updates) {
  const db = getDb();
  const user = db.data.users[userId];
  if (!user) {
    return null;
  }

  db.data.users[userId] = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await db.write();
  return db.data.users[userId];
}

/**
 * Register device for user (legacy support)
 */
export async function registerDevice(userId, deviceId) {
  const db = getDb();
  const user = db.data.users[userId];
  if (!user) {
    return null;
  }

  if (!user.devices.includes(deviceId)) {
    user.devices.push(deviceId);
    user.updatedAt = new Date().toISOString();
    await db.write();
  }

  return user;
}

/**
 * Workout Operations
 */

/**
 * Get all workouts for a user
 */
export function getUserWorkouts(userId) {
  const db = getDb();
  return Object.values(db.data.workouts).filter(
    (workout) => workout.userId === userId,
  );
}

/**
 * Get workout by ID
 */
export function getWorkoutById(workoutId) {
  const db = getDb();
  return db.data.workouts[workoutId] || null;
}

/**
 * Save a workout (create or update)
 */
export async function saveWorkout(userId, workoutData) {
  const db = getDb();

  // SECURITY: Validate workout ID to prevent prototype pollution
  const sanitizedId = sanitizeKey(workoutData.id);
  if (!sanitizedId) {
    logger.error(`Invalid workout ID attempted: ${workoutData.id}`);
    throw new Error("Invalid workout ID format");
  }

  const workout = {
    ...workoutData,
    userId,
    updatedAt: new Date().toISOString(),
  };

  db.data.workouts[sanitizedId] = workout;
  await db.write();

  logger.debug(`Workout saved: ${sanitizedId} for user ${userId}`);
  return workout;
}

/**
 * Delete a workout
 */
export async function deleteWorkout(userId, workoutId) {
  const db = getDb();

  // SECURITY: Validate workout ID to prevent prototype pollution
  const sanitizedId = sanitizeKey(workoutId);
  if (!sanitizedId) {
    logger.error(`Invalid workout ID deletion attempted: ${workoutId}`);
    throw new Error("Invalid workout ID format");
  }

  const workout = db.data.workouts[sanitizedId];
  if (!workout || workout.userId !== userId) {
    return false;
  }

  delete db.data.workouts[sanitizedId];
  await db.write();

  logger.debug(`Workout deleted: ${sanitizedId} for user ${userId}`);
  return true;
}

/**
 * Achievement Operations
 */

/**
 * Get all achievements for a user
 */
export function getUserAchievements(userId) {
  const db = getDb();
  return Object.values(db.data.achievements).filter(
    (achievement) => achievement.userId === userId,
  );
}

/**
 * Save an achievement (create or update)
 */
export async function saveAchievement(userId, achievementData) {
  const db = getDb();

  // SECURITY: Validate achievement ID to prevent prototype pollution
  const sanitizedId = sanitizeKey(achievementData.id);
  if (!sanitizedId) {
    logger.error(`Invalid achievement ID attempted: ${achievementData.id}`);
    throw new Error("Invalid achievement ID format");
  }

  const achievement = {
    ...achievementData,
    userId,
  };

  db.data.achievements[sanitizedId] = achievement;
  await db.write();

  logger.debug(`Achievement saved: ${sanitizedId} for user ${userId}`);
  return achievement;
}

/**
 * Sync Operations
 */

/**
 * Get complete user data for sync
 */
export function getUserData(userId) {
  const db = getDb();
  const user = db.data.users[userId];

  if (!user) {
    return {
      workouts: [],
      achievements: [],
      profile: null,
      createdAt: new Date().toISOString(),
    };
  }

  const workouts = getUserWorkouts(userId);
  const achievements = getUserAchievements(userId);

  return {
    workouts,
    achievements,
    profile: user.profile,
    lastSync: user.lastSync,
    createdAt: user.createdAt,
  };
}

/**
 * Sync user data (merge with existing)
 * Uses last-write-wins conflict resolution
 */
export async function syncUserData(userId, data) {
  const currentUser = getUserData(userId);
  const conflicts = [];
  const resolved = [];

  // Merge workouts (last-write-wins based on updatedAt timestamp)
  const workoutMap = new Map();

  // Add existing workouts
  currentUser.workouts.forEach((w) => {
    workoutMap.set(w.id, { ...w, source: "server" });
  });

  // Merge new workouts
  if (data.workouts && Array.isArray(data.workouts)) {
    data.workouts.forEach((w) => {
      const existing = workoutMap.get(w.id);

      if (existing) {
        // Conflict: same ID, compare update times
        const existingTime = new Date(existing.updatedAt).getTime();
        const newTime = new Date(w.updatedAt).getTime();

        if (newTime > existingTime) {
          conflicts.push({
            id: w.id,
            type: "workout",
            resolution: "client_wins",
          });
          resolved.push(w.id);
          workoutMap.set(w.id, { ...w, source: "client" });
        } else {
          conflicts.push({
            id: w.id,
            type: "workout",
            resolution: "server_wins",
          });
        }
      } else {
        workoutMap.set(w.id, { ...w, source: "client" });
      }
    });
  }

  const mergedWorkouts = Array.from(workoutMap.values()).map(
    ({ source, ...w }) => w,
  );

  // Merge achievements (union of unlocked achievements)
  const achievementMap = new Map();

  currentUser.achievements.forEach((a) => {
    achievementMap.set(a.id, a);
  });

  if (data.achievements && Array.isArray(data.achievements)) {
    data.achievements.forEach((a) => {
      if (!achievementMap.has(a.id)) {
        achievementMap.set(a.id, a);
      }
    });
  }

  const mergedAchievements = Array.from(achievementMap.values());

  // Save merged workouts
  for (const workout of mergedWorkouts) {
    await saveWorkout(userId, workout);
  }

  // Save merged achievements
  for (const achievement of mergedAchievements) {
    await saveAchievement(userId, achievement);
  }

  // Update user profile if provided
  if (data.profile) {
    await updateUser(userId, { profile: data.profile });
  }

  // Update last sync timestamp
  await updateUser(userId, { lastSync: new Date().toISOString() });

  logger.debug(`Sync complete for ${userId}: ${conflicts.length} conflicts`);

  return {
    conflicts: conflicts.length,
    resolved,
    mergedWorkouts: mergedWorkouts.length,
    mergedAchievements: mergedAchievements.length,
  };
}

/**
 * Database utility functions
 */

/**
 * Get database instance (for testing)
 */
export function getDatabase() {
  return getDb();
}

/**
 * Clear database (for testing)
 */
export async function clearDatabase() {
  const db = getDb();
  db.data = {
    users: {},
    workouts: {},
    achievements: {},
    devices: {},
  };
  await db.write();
}

/**
 * Reinitialize database connection (for testing with new DB_FILE)
 */
export async function reinitializeDatabase() {
  return await initDatabase();
}

/**
 * Export database to JSON (for backup)
 */
export function exportDatabase() {
  const db = getDb();
  return JSON.parse(JSON.stringify(db.data));
}

export default dbInstance;
