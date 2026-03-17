import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { createTempDb, cleanupTemp, hashPassword } from './test-utils.js';
import {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  saveWorkout,
  getWorkoutById,
  getUserWorkouts,
  deleteWorkout,
  saveAchievement,
  getUserAchievements,
  getUserData,
  syncUserData,
  clearDatabase,
  getDatabase,
  exportDatabase,
  reinitializeDatabase,
} from '../db/index.js';

let tmpDir;
let dbFile;

beforeEach(async () => {
  const temp = await createTempDb();
  tmpDir = temp.tmpDir;
  dbFile = temp.dbFile;

  process.env.DB_FILE = dbFile;
  
  // Reinitialize database with new file path
  await reinitializeDatabase();
  
  await clearDatabase();
});

afterEach(async () => {
  await cleanupTemp(tmpDir);
});

describe('Database Tests', () => {
  describe('User Operations', () => {
    test('should create user successfully', async () => {
      const user = await createUser('user-1', {
        email: 'test@example.com',
        passwordHash: hashPassword('password123'),
        username: 'testuser',
      });

      assert.strictEqual(user.id, 'user-1');
      assert.strictEqual(user.email, 'test@example.com');
      assert.strictEqual(user.username, 'testuser');
      assert.ok(user.createdAt);
    });

    test('should normalize email to lowercase', async () => {
      const user = await createUser('user-2', {
        email: 'TEST@EXAMPLE.COM',
        passwordHash: hashPassword('password123'),
      });

      assert.strictEqual(user.email, 'test@example.com');
    });

    test('should get user by ID', async () => {
      const created = await createUser('user-3', {
        email: 'test3@example.com',
        passwordHash: hashPassword('password123'),
      });

      const found = getUserById('user-3');

      assert.strictEqual(found.id, 'user-3');
      assert.strictEqual(found.email, 'test3@example.com');
    });

    test('should return null for non-existent user', async () => {
      const found = getUserById('non-existent');
      assert.strictEqual(found, null);
    });

    test('should get user by email', async () => {
      await createUser('user-4', {
        email: 'test4@example.com',
        passwordHash: hashPassword('password123'),
      });

      const found = getUserByEmail('test4@example.com');

      assert.strictEqual(found.id, 'user-4');
    });

    test('should get user by email case-insensitively', async () => {
      await createUser('user-5', {
        email: 'test5@example.com',
        passwordHash: hashPassword('password123'),
      });

      const found = getUserByEmail('TEST5@EXAMPLE.COM');

      assert.strictEqual(found.id, 'user-5');
    });

    test('should update user', async () => {
      await createUser('user-6', {
        email: 'test6@example.com',
        passwordHash: hashPassword('password123'),
      });

      const updated = await updateUser('user-6', {
        displayName: 'Test User',
        profile: { bio: 'Test bio' },
      });

      assert.strictEqual(updated.displayName, 'Test User');
      assert.strictEqual(updated.profile.bio, 'Test bio');
      assert.ok(updated.updatedAt);
    });

    test('should return null when updating non-existent user', async () => {
      const updated = await updateUser('non-existent', { displayName: 'Test' });
      assert.strictEqual(updated, null);
    });
  });

  describe('Workout Operations', () => {
    test('should save workout successfully', async () => {
      await createUser('user-w1', {
        email: 'workout1@example.com',
        passwordHash: hashPassword('password123'),
      });

      const workout = {
        id: 'workout-1',
        type: 'running',
        timestamp: new Date().toISOString(),
        data: { distance: 5, duration: 30 },
      };

      const saved = await saveWorkout('user-w1', workout);

      assert.strictEqual(saved.id, 'workout-1');
      assert.strictEqual(saved.userId, 'user-w1');
      assert.strictEqual(saved.type, 'running');
      assert.strictEqual(saved.data.distance, 5);
    });

    test('should get workout by ID', async () => {
      await createUser('user-w2', {
        email: 'workout2@example.com',
        passwordHash: hashPassword('password123'),
      });

      const workout = {
        id: 'workout-2',
        type: 'pushups',
        timestamp: new Date().toISOString(),
        data: { reps: 20 },
      };

      await saveWorkout('user-w2', workout);
      const found = getWorkoutById('workout-2');

      assert.strictEqual(found.id, 'workout-2');
      assert.strictEqual(found.type, 'pushups');
    });

    test('should get user workouts', async () => {
      await createUser('user-w3', {
        email: 'workout3@example.com',
        passwordHash: hashPassword('password123'),
      });

      await saveWorkout('user-w3', {
        id: 'workout-3a',
        type: 'running',
        timestamp: new Date().toISOString(),
        data: { distance: 5 },
      });

      await saveWorkout('user-w3', {
        id: 'workout-3b',
        type: 'pushups',
        timestamp: new Date().toISOString(),
        data: { reps: 20 },
      });

      const workouts = getUserWorkouts('user-w3');

      assert.strictEqual(workouts.length, 2);
    });

    test('should update existing workout', async () => {
      await createUser('user-w4', {
        email: 'workout4@example.com',
        passwordHash: hashPassword('password123'),
      });

      const workout = {
        id: 'workout-4',
        type: 'running',
        timestamp: new Date().toISOString(),
        data: { distance: 5 },
      };

      await saveWorkout('user-w4', workout);

      // Update
      const updated = await saveWorkout('user-w4', {
        ...workout,
        data: { distance: 10 },
      });

      assert.strictEqual(updated.data.distance, 10);
    });

    test('should delete workout', async () => {
      await createUser('user-w5', {
        email: 'workout5@example.com',
        passwordHash: hashPassword('password123'),
      });

      const workout = {
        id: 'workout-5',
        type: 'running',
        timestamp: new Date().toISOString(),
        data: { distance: 5 },
      };

      await saveWorkout('user-w5', workout);

      const deleted = await deleteWorkout('user-w5', 'workout-5');

      assert.strictEqual(deleted, true);
      assert.strictEqual(getWorkoutById('workout-5'), null);
    });

    test('should not delete another user\'s workout', async () => {
      await createUser('user-w6a', {
        email: 'workout6a@example.com',
        passwordHash: hashPassword('password123'),
      });

      await createUser('user-w6b', {
        email: 'workout6b@example.com',
        passwordHash: hashPassword('password123'),
      });

      const workout = {
        id: 'workout-6',
        type: 'running',
        timestamp: new Date().toISOString(),
        data: { distance: 5 },
      };

      await saveWorkout('user-w6a', workout);

      const deleted = await deleteWorkout('user-w6b', 'workout-6');

      assert.strictEqual(deleted, false);
      assert.ok(getWorkoutById('workout-6'));
    });
  });

  describe('Achievement Operations', () => {
    test('should save achievement successfully', async () => {
      await createUser('user-a1', {
        email: 'achievement1@example.com',
        passwordHash: hashPassword('password123'),
      });

      const achievement = {
        id: 'achievement-1',
        name: 'First Workout',
        description: 'Complete your first workout',
        unlockedAt: new Date().toISOString(),
      };

      const saved = await saveAchievement('user-a1', achievement);

      assert.strictEqual(saved.id, 'achievement-1');
      assert.strictEqual(saved.name, 'First Workout');
    });

    test('should get user achievements', async () => {
      await createUser('user-a2', {
        email: 'achievement2@example.com',
        passwordHash: hashPassword('password123'),
      });

      await saveAchievement('user-a2', {
        id: 'achievement-2a',
        name: 'First Workout',
        description: 'Complete your first workout',
        unlockedAt: new Date().toISOString(),
      });

      await saveAchievement('user-a2', {
        id: 'achievement-2b',
        name: 'Streak Master',
        description: '7 day streak',
        unlockedAt: new Date().toISOString(),
      });

      const achievements = getUserAchievements('user-a2');

      assert.strictEqual(achievements.length, 2);
    });

    test('should update existing achievement', async () => {
      await createUser('user-a3', {
        email: 'achievement3@example.com',
        passwordHash: hashPassword('password123'),
      });

      const achievement = {
        id: 'achievement-3',
        name: 'Test',
        description: 'Test description',
        unlockedAt: new Date().toISOString(),
      };

      await saveAchievement('user-a3', achievement);

      // Update
      const updated = await saveAchievement('user-a3', {
        ...achievement,
        description: 'Updated description',
      });

      assert.strictEqual(updated.description, 'Updated description');
    });
  });

  describe('Sync Operations', () => {
    test('should get user data for sync', async () => {
      await createUser('user-s1', {
        email: 'sync1@example.com',
        passwordHash: hashPassword('password123'),
      });

      await saveWorkout('user-s1', {
        id: 'workout-s1',
        type: 'running',
        timestamp: new Date().toISOString(),
        data: { distance: 5 },
      });

      const userData = getUserData('user-s1');

      assert.ok(userData);
      assert.strictEqual(userData.workouts.length, 1);
      assert.ok(Array.isArray(userData.achievements));
    });

    test('should return empty data for non-existent user', async () => {
      const userData = getUserData('non-existent');

      assert.ok(userData);
      assert.strictEqual(userData.workouts.length, 0);
      assert.strictEqual(userData.achievements.length, 0);
    });

    test('should sync user data with merge', async () => {
      await createUser('user-s2', {
        email: 'sync2@example.com',
        passwordHash: hashPassword('password123'),
      });

      // Add existing workout
      await saveWorkout('user-s2', {
        id: 'existing-workout',
        type: 'running',
        timestamp: new Date().toISOString(),
        data: { distance: 5 },
        updatedAt: new Date().toISOString(),
      });

      // Sync with new workout
      const result = await syncUserData('user-s2', {
        workouts: [
          {
            id: 'new-workout',
            type: 'pushups',
            timestamp: new Date().toISOString(),
            data: { reps: 20 },
            updatedAt: new Date().toISOString(),
          },
        ],
      });

      assert.strictEqual(result.mergedWorkouts, 2);
      assert.strictEqual(result.conflicts, 0);

      const userData = getUserData('user-s2');
      assert.strictEqual(userData.workouts.length, 2);
    });

    test('should resolve conflicts with last-write-wins', async () => {
      await createUser('user-s3', {
        email: 'sync3@example.com',
        passwordHash: hashPassword('password123'),
      });

      // Create workout with old timestamp explicitly by directly manipulating db
      const oldTimestamp = new Date('2024-01-01').toISOString();
      const newTimestamp = new Date('2026-01-01').toISOString();

      // Get raw db access and insert directly
      const db = getDatabase();
      const oldWorkout = {
        id: 'conflict-workout',
        userId: 'user-s3',
        type: 'running',
        timestamp: oldTimestamp,
        data: { distance: 5 },
        createdAt: oldTimestamp,
        updatedAt: oldTimestamp,
      };
      db.data.workouts['conflict-workout'] = oldWorkout;
      await db.write();

      // Sync with newer timestamp
      const result = await syncUserData('user-s3', {
        workouts: [
          {
            id: 'conflict-workout',
            type: 'running',
            timestamp: newTimestamp,
            data: { distance: 10 },
            updatedAt: newTimestamp,
          },
        ],
      });

      // Client has newer timestamp, should win (1 conflict detected but resolved)
      assert.strictEqual(result.conflicts, 1);
      assert.strictEqual(result.resolved.length, 1);

      const userData = getUserData('user-s3');
      assert.strictEqual(userData.workouts.length, 1);
      assert.strictEqual(userData.workouts[0].data.distance, 10);
    });

    test('should merge achievements as union', async () => {
      await createUser('user-s4', {
        email: 'sync4@example.com',
        passwordHash: hashPassword('password123'),
      });

      await saveAchievement('user-s4', {
        id: 'existing-achievement',
        name: 'First Workout',
        description: 'Complete your first workout',
        unlockedAt: new Date().toISOString(),
      });

      // Sync with new achievement
      await syncUserData('user-s4', {
        achievements: [
          {
            id: 'new-achievement',
            name: 'Streak Master',
            description: '7 day streak',
            unlockedAt: new Date().toISOString(),
          },
        ],
      });

      const userData = getUserData('user-s4');
      assert.strictEqual(userData.achievements.length, 2);
    });
  });

  describe('Database Utilities', () => {
    test('should clear database', async () => {
      await createUser('user-u1', {
        email: 'util1@example.com',
        passwordHash: hashPassword('password123'),
      });

      await clearDatabase();

      const found = getUserByEmail('util1@example.com');
      assert.strictEqual(found, null);
    });

    test('should export database', async () => {
      await createUser('user-u2', {
        email: 'util2@example.com',
        passwordHash: hashPassword('password123'),
      });

      const exported = exportDatabase();

      assert.ok(exported.users);
      assert.ok(exported.users['user-u2']);
    });

    test('should get database instance', async () => {
      const db = getDatabase();
      assert.ok(db);
      assert.ok(db.data);
    });
  });
});
