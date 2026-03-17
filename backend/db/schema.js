/**
 * Database Schema Definitions
 * Defines the structure for users, workouts, and achievements
 */

/**
 * User schema
 */
export const userSchema = {
  id: "string (required, unique)",
  email: "string (required, unique, normalized)",
  username: "string (optional, defaults to email prefix)",
  passwordHash: "string (required)",
  displayName: "string (optional)",
  profile: {
    avatar: "string (optional, URL)",
    bio: "string (optional)",
    timezone: "string (optional)",
    units: "string (optional, metric|imperial)",
  },
  devices: "array of device IDs (optional)",
  createdAt: "string (ISO 8601, required)",
  updatedAt: "string (ISO 8601, auto-updated)",
  lastSync: "string (ISO 8601, optional)",
};

/**
 * Workout schema
 */
export const workoutSchema = {
  id: "string (required, unique)",
  userId: "string (required, indexed)",
  type: "string (required, one of: running|squats|pushups|pullups|other)",
  timestamp: "string (ISO 8601, required)",
  data: {
    distance: "number (optional, 0-100 km, for running)",
    duration: "number (optional, 0-1440 min, for running)",
    reps: "number (optional, 0-1000, for strength)",
    sets: "number (optional, 0-100, for strength)",
    weight: "number (optional, 0-500 kg, for strength)",
    notes: "string (optional)",
  },
  createdAt: "string (ISO 8601, required)",
  updatedAt: "string (ISO 8601, auto-updated)",
};

/**
 * Achievement schema
 */
export const achievementSchema = {
  id: "string (required, unique)",
  userId: "string (required, indexed)",
  name: "string (required)",
  description: "string (required)",
  category: "string (optional, streak|personal_record|milestone)",
  unlockedAt: "string (ISO 8601, required)",
  progress: {
    current: "number (optional)",
    target: "number (optional)",
  },
  icon: "string (optional, icon name)",
  points: "number (optional, default 0)",
};

/**
 * Device schema (legacy support)
 */
export const deviceSchema = {
  id: "string (required, unique)",
  userId: "string (required, indexed)",
  name: "string (optional)",
  lastSync: "string (ISO 8601)",
  createdAt: "string (ISO 8601)",
};

/**
 * Default database structure
 */
export const defaultDatabase = {
  users: {}, // Map<userId, User>
  workouts: {}, // Map<workoutId, Workout>
  achievements: {}, // Map<achievementId, Achievement>
  devices: {}, // Map<deviceId, Device> - legacy support
};

/**
 * Valid activity types
 */
export const VALID_ACTIVITY_TYPES = [
  "running",
  "squats",
  "pushups",
  "pullups",
  "other",
];

/**
 * Achievement categories
 */
export const ACHIEVEMENT_CATEGORIES = [
  "streak",
  "personal_record",
  "milestone",
  "consistency",
];
