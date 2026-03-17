import AsyncStorage from "@react-native-async-storage/async-storage";

import { ActivityType, WorkoutEntry } from "../src/models";
import {
  clearWorkouts,
  deleteWorkout,
  getDefaultValues,
  getLastWorkoutValues,
  getWorkouts,
  loadWorkouts,
  saveWorkout,
  updateWorkout,
} from "../src/storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("Storage Functions", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(async () => {
    await AsyncStorage.clear();
  });

  const createTestWorkout = (
    type: ActivityType = "running",
    overrides?: Partial<WorkoutEntry>,
  ): WorkoutEntry => ({
    id: `test-${Date.now()}`,
    userId: "test-user",
    type,
    timestamp: new Date().toISOString(),
    data: {
      distance: type === "running" ? 5 : undefined,
      duration: type === "running" ? 30 : undefined,
      reps: type !== "running" ? 20 : undefined,
      sets: type !== "running" ? 3 : undefined,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  });

  describe("loadWorkouts", () => {
    it("should return empty array when no workouts exist", async () => {
      const workouts = await loadWorkouts();
      expect(workouts).toEqual([]);
    });

    it("should return workouts after saving", async () => {
      const workout = createTestWorkout();
      await saveWorkout(workout);

      const workouts = await loadWorkouts();
      expect(workouts).toHaveLength(1);
      expect(workouts[0].id).toBe(workout.id);
    });
  });

  describe("saveWorkout", () => {
    it("should save a workout to storage", async () => {
      const workout = createTestWorkout();
      await saveWorkout(workout);

      const workouts = await getWorkouts();
      expect(workouts).toHaveLength(1);
      expect(workouts[0]).toEqual(workout);
    });

    it("should append multiple workouts", async () => {
      const workout1 = createTestWorkout("running");
      const workout2 = createTestWorkout("squats");

      await saveWorkout(workout1);
      await saveWorkout(workout2);

      const workouts = await getWorkouts();
      expect(workouts).toHaveLength(2);
    });
  });

  describe("deleteWorkout", () => {
    it("should delete a workout by id", async () => {
      const workout = createTestWorkout();
      await saveWorkout(workout);

      await deleteWorkout(workout.id);

      const workouts = await getWorkouts();
      expect(workouts).toHaveLength(0);
    });

    it("should only delete the specified workout", async () => {
      const workout1 = createTestWorkout("running", { id: "test-workout-1" });
      const workout2 = createTestWorkout("squats", { id: "test-workout-2" });

      await saveWorkout(workout1);
      await saveWorkout(workout2);

      await deleteWorkout(workout1.id);

      const workouts = await getWorkouts();
      expect(workouts).toHaveLength(1);
      expect(workouts[0].id).toBe(workout2.id);
    });
  });

  describe("getWorkouts", () => {
    it("should return all workouts", async () => {
      const workout1 = createTestWorkout("running");
      const workout2 = createTestWorkout("squats");
      const workout3 = createTestWorkout("pushups");

      await saveWorkout(workout1);
      await saveWorkout(workout2);
      await saveWorkout(workout3);

      const workouts = await getWorkouts();
      expect(workouts).toHaveLength(3);
    });
  });

  describe("getLastWorkoutValues", () => {
    it("should return default values when no workouts exist", async () => {
      const values = await getLastWorkoutValues("running");
      expect(values).toEqual(getDefaultValues("running"));
    });

    it("should return most recent workout values", async () => {
      const oldWorkout = createTestWorkout("running", {
        data: { distance: 3, duration: 20 },
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      });
      const newWorkout = createTestWorkout("running", {
        data: { distance: 10, duration: 60 },
        timestamp: new Date().toISOString(),
      });

      await saveWorkout(oldWorkout);
      await saveWorkout(newWorkout);

      const values = await getLastWorkoutValues("running");
      expect(values?.distance).toBe(10);
      expect(values?.duration).toBe(60);
    });

    it("should filter by workout type", async () => {
      const runningWorkout = createTestWorkout("running", {
        data: { distance: 5, duration: 30 },
      });
      const squatsWorkout = createTestWorkout("squats", {
        data: { reps: 30, sets: 5 },
      });

      await saveWorkout(runningWorkout);
      await saveWorkout(squatsWorkout);

      const runningValues = await getLastWorkoutValues("running");
      const squatsValues = await getLastWorkoutValues("squats");

      expect(runningValues?.distance).toBe(5);
      expect(squatsValues?.reps).toBe(30);
    });
  });

  describe("getDefaultValues", () => {
    it("should return running defaults", () => {
      const values = getDefaultValues("running");
      expect(values.distance).toBe(5);
      expect(values.duration).toBe(30);
    });

    it("should return squats defaults", () => {
      const values = getDefaultValues("squats");
      expect(values.reps).toBe(20);
      expect(values.sets).toBe(3);
    });

    it("should return pushups defaults", () => {
      const values = getDefaultValues("pushups");
      expect(values.reps).toBe(15);
      expect(values.sets).toBe(3);
    });

    it("should return pullups defaults", () => {
      const values = getDefaultValues("pullups");
      expect(values.reps).toBe(10);
      expect(values.sets).toBe(3);
    });

    it("should return empty object for other type", () => {
      const values = getDefaultValues("other");
      expect(values).toEqual({});
    });
  });

  describe("updateWorkout", () => {
    it("should update an existing workout", async () => {
      const workout = createTestWorkout("running", {
        data: { distance: 5, duration: 30 },
      });
      await saveWorkout(workout);

      await updateWorkout(workout.id, {
        data: { distance: 10, duration: 60 },
      });

      const workouts = await getWorkouts();
      expect(workouts[0].data.distance).toBe(10);
      expect(workouts[0].data.duration).toBe(60);
    });

    it("should throw error if workout not found", async () => {
      await expect(
        updateWorkout("non-existent-id", { data: { distance: 10 } }),
      ).rejects.toThrow("Workout not found");
    });

    it("should update updatedAt timestamp", async () => {
      const workout = createTestWorkout();
      await saveWorkout(workout);

      const beforeUpdate = new Date(workout.updatedAt);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await updateWorkout(workout.id, { data: { distance: 10 } });

      const workouts = await getWorkouts();
      const afterUpdate = new Date(workouts[0].updatedAt);

      expect(afterUpdate.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });
  });

  describe("clearWorkouts", () => {
    it("should remove all workouts", async () => {
      await saveWorkout(createTestWorkout("running"));
      await saveWorkout(createTestWorkout("squats"));

      await clearWorkouts();

      const workouts = await getWorkouts();
      expect(workouts).toHaveLength(0);
    });
  });
});
