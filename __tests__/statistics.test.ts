/**
 * Statistics Utility Tests
 * 
 * Tests for src/utils/statistics.ts
 * Covers: weekly stats, personal records, streak calculations
 */

import {
  calculateWeeklyStats,
  calculatePersonalRecords,
  calculateStreak,
  calculateLongestStreak,
  getWeekStart,
  getWeekEnd,
  getUniqueWorkoutDates,
  calculateTotalReps,
  calculateTotalDistance,
  calculateTotalDuration,
  hasWorkoutOnDate,
} from "../src/utils/statistics";
import { WorkoutEntry } from "../src/models";

// Helper to create workout entries
function createWorkout(
  id: string,
  type: "running" | "squats" | "pushups" | "pullups" | "other",
  timestamp: string,
  data: WorkoutEntry["data"]
): WorkoutEntry {
  return {
    id,
    userId: "test-user",
    type,
    timestamp,
    data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

describe("Statistics Utils", () => {
  describe("getWeekStart", () => {
    it("returns Sunday of the current week", () => {
      // March 16, 2026 is a Monday
      const date = new Date(2026, 2, 16); // Month is 0-indexed
      const weekStart = getWeekStart(date);
      
      expect(weekStart.getDay()).toBe(0); // Sunday
      expect(weekStart.getDate()).toBe(15); // March 15
      expect(weekStart.getHours()).toBe(0);
      expect(weekStart.getMinutes()).toBe(0);
    });

    it("returns the same day if already Sunday", () => {
      const date = new Date(2026, 2, 15); // Sunday
      const weekStart = getWeekStart(date);
      
      expect(weekStart.getDay()).toBe(0);
      expect(weekStart.getDate()).toBe(15);
    });
  });

  describe("getWeekEnd", () => {
    it("returns Saturday of the current week", () => {
      const date = new Date(2026, 2, 16); // Monday
      const weekEnd = getWeekEnd(date);
      
      expect(weekEnd.getDay()).toBe(6); // Saturday
      expect(weekEnd.getDate()).toBe(21); // March 21
      expect(weekEnd.getHours()).toBe(23);
      expect(weekEnd.getMinutes()).toBe(59);
    });
  });

  describe("calculateWeeklyStats", () => {
    it("returns zero stats for empty workouts", () => {
      const stats = calculateWeeklyStats([]);
      
      expect(stats.totalWorkouts).toBe(0);
      expect(stats.totalDuration).toBe(0);
      expect(stats.totalDistance).toBe(0);
      expect(stats.totalReps).toBe(0);
    });

    it("calculates weekly stats correctly", () => {
      const now = new Date();
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", now.toISOString(), {
          distance: 5,
          duration: 30,
        }),
        createWorkout("2", "squats", now.toISOString(), {
          reps: 20,
          sets: 3,
        }),
        createWorkout("3", "pushups", now.toISOString(), {
          reps: 15,
          sets: 3,
        }),
      ];

      const stats = calculateWeeklyStats(workouts);

      expect(stats.totalWorkouts).toBe(3);
      expect(stats.totalDistance).toBe(5);
      expect(stats.totalDuration).toBe(30);
      expect(stats.totalReps).toBe(105); // 20*3 + 15*3
      expect(stats.byType.running).toBe(1);
      expect(stats.byType.squats).toBe(1);
      expect(stats.byType.pushups).toBe(1);
    });

    it("only counts workouts from current week", () => {
      const now = new Date();
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 8); // Last week

      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", now.toISOString(), {
          distance: 5,
          duration: 30,
        }),
        createWorkout("2", "running", lastWeek.toISOString(), {
          distance: 10,
          duration: 60,
        }),
      ];

      const stats = calculateWeeklyStats(workouts);

      expect(stats.totalWorkouts).toBe(1);
      expect(stats.totalDistance).toBe(5);
    });
  });

  describe("calculatePersonalRecords", () => {
    it("returns empty array for no workouts", () => {
      const records = calculatePersonalRecords([]);
      expect(records).toHaveLength(0);
    });

    it("finds PR for running (distance)", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
        createWorkout("2", "running", "2026-03-02T10:00:00Z", {
          distance: 7.5,
          duration: 45,
        }),
        createWorkout("3", "running", "2026-03-03T10:00:00Z", {
          distance: 6,
          duration: 35,
        }),
      ];

      const records = calculatePersonalRecords(workouts);
      const runningPR = records.find((r) => r.type === "running");

      expect(runningPR).toBeDefined();
      expect(runningPR?.value).toBe(7.5);
      expect(runningPR?.date).toBe("2026-03-02T10:00:00Z");
    });

    it("finds PR for strength exercises (volume)", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "squats", "2026-03-01T10:00:00Z", {
          reps: 20,
          sets: 3,
        }),
        createWorkout("2", "squats", "2026-03-02T10:00:00Z", {
          reps: 25,
          sets: 4,
        }),
      ];

      const records = calculatePersonalRecords(workouts);
      const squatsPR = records.find((r) => r.type === "squats");

      expect(squatsPR).toBeDefined();
      expect(squatsPR?.value).toBe(100); // 25 * 4
    });
  });

  describe("calculateStreak", () => {
    it("returns zero streak for no workouts", () => {
      const streak = calculateStreak([]);
      
      expect(streak.currentStreak).toBe(0);
      expect(streak.longestStreak).toBe(0);
      expect(streak.isActive).toBe(false);
    });

    it("calculates current streak correctly", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", today.toISOString(), {
          distance: 5,
          duration: 30,
        }),
        createWorkout("2", "running", yesterday.toISOString(), {
          distance: 5,
          duration: 30,
        }),
        createWorkout("3", "running", twoDaysAgo.toISOString(), {
          distance: 5,
          duration: 30,
        }),
      ];

      const streak = calculateStreak(workouts);

      expect(streak.currentStreak).toBe(3);
      expect(streak.isActive).toBe(true);
    });

    it("resets streak when day is missed", () => {
      // Create dates: today and 3 days ago (skipping yesterday and 2 days ago)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", today.toISOString(), {
          distance: 5,
          duration: 30,
        }),
        // Yesterday and 2 days ago are missing
        createWorkout("2", "running", threeDaysAgo.toISOString(), {
          distance: 5,
          duration: 30,
        }),
      ];

      const streak = calculateStreak(workouts);

      // Streak should be 1 (just today), since there's a gap
      expect(streak.currentStreak).toBe(1);
      expect(streak.isActive).toBe(true);
    });

    it("counts streak as active if worked out yesterday", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", yesterday.toISOString(), {
          distance: 5,
          duration: 30,
        }),
      ];

      const streak = calculateStreak(workouts);

      expect(streak.currentStreak).toBe(1);
      expect(streak.isActive).toBe(true);
    });

    it("calculates longest streak correctly", () => {
      const dates = [
        "2026-03-01",
        "2026-03-02",
        "2026-03-03",
        "2026-03-05",
        "2026-03-06",
      ].map((date) => `${date}T10:00:00Z`);

      const workouts: WorkoutEntry[] = dates.map((date, i) =>
        createWorkout(`${i}`, "running", date, { distance: 5, duration: 30 })
      );

      const streak = calculateStreak(workouts);

      expect(streak.longestStreak).toBe(3); // March 1-3
    });
  });

  describe("calculateLongestStreak", () => {
    it("returns 0 for empty dates", () => {
      expect(calculateLongestStreak([])).toBe(0);
    });

    it("returns 1 for single date", () => {
      expect(calculateLongestStreak(["2026-03-01T00:00:00Z"])).toBe(1);
    });

    it("calculates longest streak from dates", () => {
      // Dates must be sorted descending (newest first) for the function
      const dates = [
        "2026-03-08T00:00:00Z",
        "2026-03-07T00:00:00Z",
        "2026-03-06T00:00:00Z",
        "2026-03-05T00:00:00Z",
        "2026-03-03T00:00:00Z",
        "2026-03-02T00:00:00Z",
        "2026-03-01T00:00:00Z",
      ];

      // Longest streak is 4 (March 5-8)
      expect(calculateLongestStreak(dates)).toBe(4);
    });
  });

  describe("calculateTotalReps", () => {
    it("calculates total reps for specific exercise type", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "squats", "2026-03-01T10:00:00Z", {
          reps: 20,
          sets: 3,
        }),
        createWorkout("2", "squats", "2026-03-02T10:00:00Z", {
          reps: 25,
          sets: 3,
        }),
        createWorkout("3", "pushups", "2026-03-01T10:00:00Z", {
          reps: 15,
          sets: 3,
        }),
      ];

      const totalSquatsReps = calculateTotalReps(workouts, "squats");
      expect(totalSquatsReps).toBe(135); // (20*3) + (25*3)
    });
  });

  describe("calculateTotalDistance", () => {
    it("calculates total distance for running workouts", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
        createWorkout("2", "running", "2026-03-02T10:00:00Z", {
          distance: 7.5,
          duration: 45,
        }),
        createWorkout("3", "squats", "2026-03-01T10:00:00Z", {
          reps: 20,
          sets: 3,
        }),
      ];

      const totalDistance = calculateTotalDistance(workouts);
      expect(totalDistance).toBe(12.5);
    });
  });

  describe("calculateTotalDuration", () => {
    it("calculates total duration for running workouts", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
        createWorkout("2", "running", "2026-03-02T10:00:00Z", {
          distance: 7.5,
          duration: 45,
        }),
      ];

      const totalDuration = calculateTotalDuration(workouts);
      expect(totalDuration).toBe(75);
    });
  });

  describe("hasWorkoutOnDate", () => {
    it("returns true if workout exists on date", () => {
      const date = new Date(2026, 2, 15);
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", date.toISOString(), {
          distance: 5,
          duration: 30,
        }),
      ];

      expect(hasWorkoutOnDate(workouts, date)).toBe(true);
    });

    it("returns false if no workout on date", () => {
      const date = new Date(2026, 2, 15);
      const otherDate = new Date(2026, 2, 14);
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", otherDate.toISOString(), {
          distance: 5,
          duration: 30,
        }),
      ];

      expect(hasWorkoutOnDate(workouts, date)).toBe(false);
    });
  });
});
