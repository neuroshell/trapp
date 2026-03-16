/**
 * Achievement Utils Tests
 * 
 * Tests for src/utils/achievements.ts
 * Covers: achievement definitions, progress calculation, detection engine
 */

import {
  ACHIEVEMENT_DEFINITIONS,
  calculateAchievementProgress,
  checkAchievements,
  calculateAllAchievementProgress,
  getAchievementsByCategory,
  getUnlockedAchievements,
  getLockedAchievements,
  sortAchievementsByTier,
  getNextAchievement,
  calculateCompletionPercentage,
  getTierColor,
  getTierBackgroundColor,
  formatAchievementProgress,
  getAchievementAccessibilityLabel,
  Achievement,
  StreakData,
} from "../src/utils/achievements";
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

// Helper to create streak data
function createStreakData(
  currentStreak: number,
  longestStreak: number,
  isActive = true
): StreakData {
  return {
    currentStreak,
    longestStreak,
    lastWorkoutDate: currentStreak > 0 ? new Date().toISOString() : null,
    streakDates: [],
    isActive,
  };
}

describe("Achievement Utils", () => {
  describe("ACHIEVEMENT_DEFINITIONS", () => {
    it("has 15 achievements", () => {
      expect(ACHIEVEMENT_DEFINITIONS).toHaveLength(15);
    });

    it("has all consistency achievements", () => {
      const consistencyAchievements = ACHIEVEMENT_DEFINITIONS.filter(
        (a) => a.category === "consistency"
      );
      
      expect(consistencyAchievements).toHaveLength(6);
      expect(consistencyAchievements.map((a) => a.type)).toEqual([
        "first_workout",
        "workouts_5",
        "workouts_10",
        "workouts_25",
        "workouts_50",
        "workouts_100",
      ]);
    });

    it("has all streak achievements", () => {
      const streakAchievements = ACHIEVEMENT_DEFINITIONS.filter(
        (a) => a.category === "streak"
      );
      
      expect(streakAchievements).toHaveLength(5);
      expect(streakAchievements.map((a) => a.type)).toEqual([
        "streak_3",
        "streak_7",
        "streak_14",
        "streak_30",
        "streak_100",
      ]);
    });

    it("has all exercise achievements", () => {
      const exerciseAchievements = ACHIEVEMENT_DEFINITIONS.filter(
        (a) => a.category === "exercise"
      );
      
      expect(exerciseAchievements).toHaveLength(4);
      expect(exerciseAchievements.map((a) => a.type)).toEqual([
        "runs_10",
        "squats_1000",
        "pushups_500",
        "pullups_200",
      ]);
    });

    it("has unique IDs", () => {
      const ids = ACHIEVEMENT_DEFINITIONS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      
      expect(ids.length).toBe(uniqueIds.size);
    });
  });

  describe("getTierColor", () => {
    it("returns correct color for each tier", () => {
      expect(getTierColor("bronze")).toBe("#CD7F32");
      expect(getTierColor("silver")).toBe("#C0C0C0");
      expect(getTierColor("gold")).toBe("#FFD700");
      expect(getTierColor("platinum")).toBe("#E5E4E2");
      expect(getTierColor("diamond")).toBe("#B9F2FF");
    });
  });

  describe("getTierBackgroundColor", () => {
    it("returns correct background color for each tier", () => {
      expect(getTierBackgroundColor("bronze")).toBe("#FFF5EB");
      expect(getTierBackgroundColor("silver")).toBe("#F5F7FB");
      expect(getTierBackgroundColor("gold")).toBe("#FFFBEB");
    });
  });

  describe("calculateAchievementProgress", () => {
    it("calculates consistency progress (total workouts)", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
        createWorkout("2", "squats", "2026-03-02T10:00:00Z", {
          reps: 20,
          sets: 3,
        }),
        createWorkout("3", "pushups", "2026-03-03T10:00:00Z", {
          reps: 15,
          sets: 3,
        }),
      ];

      const achievement = ACHIEVEMENT_DEFINITIONS.find(
        (a) => a.type === "workouts_5"
      )!;

      const progress = calculateAchievementProgress(
        achievement,
        workouts,
        createStreakData(0, 0)
      );

      expect(progress).toBe(3);
    });

    it("calculates streak progress", () => {
      const achievement = ACHIEVEMENT_DEFINITIONS.find(
        (a) => a.type === "streak_7"
      )!;

      const progress = calculateAchievementProgress(
        achievement,
        [],
        createStreakData(5, 10)
      );

      expect(progress).toBe(5);
    });

    it("calculates runs achievement progress", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
        createWorkout("2", "running", "2026-03-02T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
        createWorkout("3", "squats", "2026-03-03T10:00:00Z", {
          reps: 20,
          sets: 3,
        }),
      ];

      const achievement = ACHIEVEMENT_DEFINITIONS.find(
        (a) => a.type === "runs_10"
      )!;

      const progress = calculateAchievementProgress(
        achievement,
        workouts,
        createStreakData(0, 0)
      );

      expect(progress).toBe(2);
    });

    it("calculates cumulative reps achievement (squats)", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "squats", "2026-03-01T10:00:00Z", {
          reps: 20,
          sets: 3,
        }),
        createWorkout("2", "squats", "2026-03-02T10:00:00Z", {
          reps: 25,
          sets: 3,
        }),
      ];

      const achievement = ACHIEVEMENT_DEFINITIONS.find(
        (a) => a.type === "squats_1000"
      )!;

      const progress = calculateAchievementProgress(
        achievement,
        workouts,
        createStreakData(0, 0)
      );

      expect(progress).toBe(135); // (20*3) + (25*3)
    });

    it("calculates cumulative reps achievement (pushups)", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "pushups", "2026-03-01T10:00:00Z", {
          reps: 50,
          sets: 3,
        }),
        createWorkout("2", "pushups", "2026-03-02T10:00:00Z", {
          reps: 60,
          sets: 3,
        }),
      ];

      const achievement = ACHIEVEMENT_DEFINITIONS.find(
        (a) => a.type === "pushups_500"
      )!;

      const progress = calculateAchievementProgress(
        achievement,
        workouts,
        createStreakData(0, 0)
      );

      expect(progress).toBe(330); // (50*3) + (60*3)
    });

    it("calculates cumulative reps achievement (pullups)", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "pullups", "2026-03-01T10:00:00Z", {
          reps: 10,
          sets: 3,
        }),
        createWorkout("2", "pullups", "2026-03-02T10:00:00Z", {
          reps: 12,
          sets: 3,
        }),
      ];

      const achievement = ACHIEVEMENT_DEFINITIONS.find(
        (a) => a.type === "pullups_200"
      )!;

      const progress = calculateAchievementProgress(
        achievement,
        workouts,
        createStreakData(0, 0)
      );

      expect(progress).toBe(66); // (10*3) + (12*3)
    });
  });

  describe("checkAchievements", () => {
    it("detects first workout achievement", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
      ];

      const newlyUnlocked = checkAchievements(workouts, createStreakData(1, 1), []);

      const firstStepAchievement = newlyUnlocked.find(
        (a) => a.id === "first_step"
      );

      expect(firstStepAchievement).toBeDefined();
      expect(firstStepAchievement?.unlocked).toBe(true);
    });

    it("skips already unlocked achievements", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
      ];

      const newlyUnlocked = checkAchievements(
        workouts,
        createStreakData(1, 1),
        ["first_step"] // Already unlocked
      );

      expect(newlyUnlocked.length).toBe(0);
    });

    it("detects multiple achievements at once", () => {
      // Create 5 workouts to unlock "first_step" and "getting_started"
      const workouts: WorkoutEntry[] = Array.from({ length: 5 }, (_, i) =>
        createWorkout(`${i}`, "running", `2026-03-0${i + 1}T10:00:00Z`, {
          distance: 5,
          duration: 30,
        })
      );

      const newlyUnlocked = checkAchievements(workouts, createStreakData(5, 5), []);

      const firstStep = newlyUnlocked.find((a) => a.id === "first_step");
      const gettingStarted = newlyUnlocked.find((a) => a.id === "getting_started");

      expect(firstStep).toBeDefined();
      expect(gettingStarted).toBeDefined();
    });

    it("detects streak achievements", () => {
      const workouts: WorkoutEntry[] = [];

      // 7-day streak
      const newlyUnlocked = checkAchievements(
        workouts,
        createStreakData(7, 7),
        ["first_step"] // Already have first workout
      );

      const onFire = newlyUnlocked.find((a) => a.id === "on_fire"); // 3-day
      const hotStreak = newlyUnlocked.find((a) => a.id === "hot_streak"); // 7-day

      expect(onFire).toBeDefined();
      expect(hotStreak).toBeDefined();
    });

    it("only returns achievements that meet requirements", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
        createWorkout("2", "running", "2026-03-02T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
      ];

      const newlyUnlocked = checkAchievements(workouts, createStreakData(2, 2), []);

      // Should only unlock first_step, not getting_started (needs 5)
      const firstStep = newlyUnlocked.find((a) => a.id === "first_step");
      const gettingStarted = newlyUnlocked.find((a) => a.id === "getting_started");

      expect(firstStep).toBeDefined();
      expect(gettingStarted).toBeUndefined();
    });
  });

  describe("calculateAllAchievementProgress", () => {
    it("returns progress for all achievements", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
      ];

      const achievements = calculateAllAchievementProgress(
        workouts,
        createStreakData(1, 1),
        []
      );

      expect(achievements).toHaveLength(15);
      
      const firstStep = achievements.find((a) => a.id === "first_step");
      expect(firstStep?.unlocked).toBe(true);
      expect(firstStep?.progress).toBe(1);

      const gettingStarted = achievements.find((a) => a.id === "getting_started");
      expect(gettingStarted?.unlocked).toBe(false);
      expect(gettingStarted?.progress).toBe(1);
    });
  });

  describe("getAchievementsByCategory", () => {
    it("filters achievements by category", () => {
      const allAchievements = calculateAllAchievementProgress(
        [],
        createStreakData(0, 0),
        []
      );

      const consistency = getAchievementsByCategory(allAchievements, "consistency");
      expect(consistency).toHaveLength(6);

      const streak = getAchievementsByCategory(allAchievements, "streak");
      expect(streak).toHaveLength(5);

      const exercise = getAchievementsByCategory(allAchievements, "exercise");
      expect(exercise).toHaveLength(4);
    });
  });

  describe("getUnlockedAchievements", () => {
    it("returns only unlocked achievements", () => {
      const workouts: WorkoutEntry[] = [
        createWorkout("1", "running", "2026-03-01T10:00:00Z", {
          distance: 5,
          duration: 30,
        }),
      ];

      const allAchievements = calculateAllAchievementProgress(
        workouts,
        createStreakData(1, 1),
        []
      );

      const unlocked = getUnlockedAchievements(allAchievements);
      
      expect(unlocked.length).toBeGreaterThan(0);
      unlocked.forEach((a) => {
        expect(a.unlocked).toBe(true);
      });
    });
  });

  describe("getLockedAchievements", () => {
    it("returns only locked achievements", () => {
      const allAchievements = calculateAllAchievementProgress(
        [],
        createStreakData(0, 0),
        []
      );

      const locked = getLockedAchievements(allAchievements);
      
      expect(locked.length).toBeGreaterThan(0);
      locked.forEach((a) => {
        expect(a.unlocked).toBe(false);
      });
    });
  });

  describe("sortAchievementsByTier", () => {
    it("sorts achievements by tier (diamond first)", () => {
      const achievements: Achievement[] = [
        {
          id: "bronze_achievement",
          type: "first_workout",
          category: "consistency",
          tier: "bronze",
          title: "Bronze",
          description: "Bronze achievement",
          requirement: 1,
          icon: "medal",
          unlocked: true,
          progress: 1,
        },
        {
          id: "gold_achievement",
          type: "workouts_50",
          category: "consistency",
          tier: "gold",
          title: "Gold",
          description: "Gold achievement",
          requirement: 50,
          icon: "trophy",
          unlocked: true,
          progress: 50,
        },
        {
          id: "diamond_achievement",
          type: "streak_100",
          category: "streak",
          tier: "diamond",
          title: "Diamond",
          description: "Diamond achievement",
          requirement: 100,
          icon: "diamond",
          unlocked: true,
          progress: 100,
        },
      ];

      const sorted = sortAchievementsByTier(achievements);

      expect(sorted[0].tier).toBe("diamond");
      expect(sorted[1].tier).toBe("gold");
      expect(sorted[2].tier).toBe("bronze");
    });
  });

  describe("getNextAchievement", () => {
    it("returns locked achievement with highest progress", () => {
      const achievements: Achievement[] = [
        {
          id: "ach_1",
          type: "workouts_5",
          category: "consistency",
          tier: "bronze",
          title: "Getting Started",
          description: "5 workouts",
          requirement: 5,
          icon: "seedling",
          unlocked: false,
          progress: 4,
        },
        {
          id: "ach_2",
          type: "workouts_10",
          category: "consistency",
          tier: "silver",
          title: "Committed",
          description: "10 workouts",
          requirement: 10,
          icon: "medal",
          unlocked: false,
          progress: 4,
        },
        {
          id: "ach_3",
          type: "workouts_25",
          category: "consistency",
          tier: "silver",
          title: "Dedicated",
          description: "25 workouts",
          requirement: 25,
          icon: "trophy-outline",
          unlocked: false,
          progress: 2,
        },
      ];

      const next = getNextAchievement(achievements);

      // Should return one of the achievements with progress 4
      expect(next).toBeDefined();
      expect(next?.progress).toBe(4);
    });

    it("returns null if all achievements are unlocked", () => {
      const achievements: Achievement[] = [
        {
          id: "ach_1",
          type: "first_workout",
          category: "consistency",
          tier: "bronze",
          title: "First Step",
          description: "First workout",
          requirement: 1,
          icon: "foot-print",
          unlocked: true,
          progress: 1,
        },
      ];

      const next = getNextAchievement(achievements);
      expect(next).toBeNull();
    });
  });

  describe("calculateCompletionPercentage", () => {
    it("calculates correct percentage", () => {
      const achievements: Achievement[] = [
        {
          id: "ach_1",
          type: "first_workout",
          category: "consistency",
          tier: "bronze",
          title: "First Step",
          description: "First workout",
          requirement: 1,
          icon: "foot-print",
          unlocked: true,
          progress: 1,
        },
        {
          id: "ach_2",
          type: "workouts_5",
          category: "consistency",
          tier: "bronze",
          title: "Getting Started",
          description: "5 workouts",
          requirement: 5,
          icon: "seedling",
          unlocked: false,
          progress: 3,
        },
      ];

      const percentage = calculateCompletionPercentage(achievements);
      expect(percentage).toBe(50);
    });

    it("returns 0 for empty array", () => {
      expect(calculateCompletionPercentage([])).toBe(0);
    });

    it("returns 100 when all unlocked", () => {
      const achievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => ({
        ...def,
        unlocked: true,
        progress: def.requirement,
        unlockedAt: new Date().toISOString(),
      }));

      const percentage = calculateCompletionPercentage(achievements);
      expect(percentage).toBe(100);
    });
  });

  describe("formatAchievementProgress", () => {
    it("returns 'Completed' for unlocked achievements", () => {
      const achievement: Achievement = {
        id: "ach_1",
        type: "first_workout",
        category: "consistency",
        tier: "bronze",
        title: "First Step",
        description: "First workout",
        requirement: 1,
        icon: "foot-print",
        unlocked: true,
        progress: 1,
      };

      expect(formatAchievementProgress(achievement)).toBe("Completed");
    });

    it("returns remaining count for locked achievements", () => {
      const achievement: Achievement = {
        id: "ach_1",
        type: "workouts_5",
        category: "consistency",
        tier: "bronze",
        title: "Getting Started",
        description: "5 workouts",
        requirement: 5,
        icon: "seedling",
        unlocked: false,
        progress: 3,
      };

      expect(formatAchievementProgress(achievement)).toBe("2 more to go");
    });
  });

  describe("getAchievementAccessibilityLabel", () => {
    it("returns correct label for unlocked achievement", () => {
      const achievement: Achievement = {
        id: "ach_1",
        type: "first_workout",
        category: "consistency",
        tier: "bronze",
        title: "First Step",
        description: "First workout",
        requirement: 1,
        icon: "foot-print",
        unlocked: true,
        progress: 1,
        unlockedAt: "2026-03-16T10:00:00Z",
      };

      const label = getAchievementAccessibilityLabel(achievement);
      expect(label).toContain("First Step");
      expect(label).toContain("Unlocked");
    });

    it("returns correct label for locked achievement", () => {
      const achievement: Achievement = {
        id: "ach_1",
        type: "workouts_5",
        category: "consistency",
        tier: "bronze",
        title: "Getting Started",
        description: "5 workouts",
        requirement: 5,
        icon: "seedling",
        unlocked: false,
        progress: 3,
      };

      const label = getAchievementAccessibilityLabel(achievement);
      expect(label).toContain("Getting Started");
      expect(label).toContain("Progress: 3 out of 5");
    });
  });
});
