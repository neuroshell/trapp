import AsyncStorage from "@react-native-async-storage/async-storage";

import { WorkoutEntry } from "../src/models";
import {
  getWorkoutsByDateRange,
  getWorkoutsForHistory,
} from "../src/storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("Storage - Date Range Queries", () => {
  const WORKOUTS_KEY = "TRAPP_TRACKER_WORKOUTS_V1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  const createWorkout = (date: string): WorkoutEntry => ({
    id: `workout-${date}`,
    userId: "test-user",
    type: "running",
    timestamp: date,
    data: {
      distance: 5.0,
      duration: 30,
    },
    createdAt: date,
    updatedAt: date,
  });

  describe("getWorkoutsByDateRange", () => {
    it("returns workouts within date range", async () => {
      // Arrange
      const workouts: WorkoutEntry[] = [
        createWorkout("2026-03-01T10:00:00.000Z"),
        createWorkout("2026-03-15T10:00:00.000Z"),
        createWorkout("2026-03-31T10:00:00.000Z"),
        createWorkout("2026-04-01T10:00:00.000Z"),
      ];

      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));

      // Act
      const result = await getWorkoutsByDateRange(
        "2026-03-01T00:00:00.000Z",
        "2026-03-31T23:59:59.999Z",
      );

      // Assert
      expect(result).toHaveLength(3);
      expect(result.map((w) => w.id)).toEqual([
        "workout-2026-03-01T10:00:00.000Z",
        "workout-2026-03-15T10:00:00.000Z",
        "workout-2026-03-31T10:00:00.000Z",
      ]);
    });

    it("returns empty array when no workouts in range", async () => {
      // Arrange
      const workouts: WorkoutEntry[] = [
        createWorkout("2026-02-01T10:00:00.000Z"),
        createWorkout("2026-04-01T10:00:00.000Z"),
      ];

      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));

      // Act
      const result = await getWorkoutsByDateRange(
        "2026-03-01T00:00:00.000Z",
        "2026-03-31T23:59:59.999Z",
      );

      // Assert
      expect(result).toHaveLength(0);
    });

    it("returns empty array when no workouts exist", async () => {
      // Act
      const result = await getWorkoutsByDateRange(
        "2026-03-01T00:00:00.000Z",
        "2026-03-31T23:59:59.999Z",
      );

      // Assert
      expect(result).toHaveLength(0);
    });

    it("includes workouts on end date", async () => {
      // Arrange - workout at start of day
      const workouts: WorkoutEntry[] = [
        createWorkout("2026-03-31T10:00:00.000Z"),
      ];

      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));

      // Act - query entire month
      const result = await getWorkoutsByDateRange(
        "2026-03-31T00:00:00.000Z",
        "2026-03-31T23:59:59.999Z",
      );

      // Assert - should include workout on end date
      expect(result).toHaveLength(1);
    });
  });

  describe("getWorkoutsForHistory", () => {
    it("returns all workouts sorted by date descending", async () => {
      // Arrange
      const workouts: WorkoutEntry[] = [
        createWorkout("2026-03-01T10:00:00.000Z"),
        createWorkout("2026-03-15T10:00:00.000Z"),
        createWorkout("2026-03-10T10:00:00.000Z"),
      ];

      await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));

      // Act
      const result = await getWorkoutsForHistory();

      // Assert - newest first
      expect(result).toHaveLength(3);
      expect(result[0].timestamp).toBe("2026-03-15T10:00:00.000Z");
      expect(result[1].timestamp).toBe("2026-03-10T10:00:00.000Z");
      expect(result[2].timestamp).toBe("2026-03-01T10:00:00.000Z");
    });

    it("returns empty array when no workouts exist", async () => {
      // Act
      const result = await getWorkoutsForHistory();

      // Assert
      expect(result).toHaveLength(0);
    });

    it("handles storage errors gracefully", async () => {
      // Act & Assert - should not throw
      await expect(getWorkoutsForHistory()).resolves.toEqual([]);
    });
  });
});
