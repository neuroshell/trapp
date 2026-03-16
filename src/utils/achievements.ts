/**
 * Achievement Detection Engine
 *
 * Provides achievement tracking and detection functionality:
 * - Achievement definitions (15 achievements)
 * - Progress calculation
 * - Automatic detection of unlocked achievements
 *
 * All calculations are optimized to complete in <200ms
 */

import { ActivityType, WorkoutEntry } from "../models";
import { StreakData, calculateTotalReps } from "./statistics";

/**
 * Achievement categories
 */
export type AchievementCategory = "consistency" | "streak" | "exercise";

/**
 * Achievement tiers
 */
export type AchievementTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";

/**
 * Achievement types matching user stories
 */
export type AchievementType =
  | "first_workout"
  | "workouts_5"
  | "workouts_10"
  | "workouts_25"
  | "workouts_50"
  | "workouts_100"
  | "streak_3"
  | "streak_7"
  | "streak_14"
  | "streak_30"
  | "streak_100"
  | "runs_10"
  | "squats_1000"
  | "pushups_500"
  | "pullups_200";

/**
 * Achievement model
 */
export interface Achievement {
  id: string;
  type: AchievementType;
  category: AchievementCategory;
  tier: AchievementTier;
  title: string;
  description: string;
  requirement: number;
  icon: string; // Material Community Icons name
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

/**
 * Achievement definition (without user-specific state)
 */
export interface AchievementDefinition {
  id: string;
  type: AchievementType;
  category: AchievementCategory;
  tier: AchievementTier;
  title: string;
  description: string;
  requirement: number;
  icon: string;
}

/**
 * All achievement definitions (15 total)
 * Ordered by category and tier
 */
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ==================== CONSISTENCY ACHIEVEMENTS ====================
  {
    id: "first_step",
    type: "first_workout",
    category: "consistency",
    tier: "bronze",
    title: "First Step",
    description: "Log your first workout",
    requirement: 1,
    icon: "foot-print",
  },
  {
    id: "getting_started",
    type: "workouts_5",
    category: "consistency",
    tier: "bronze",
    title: "Getting Started",
    description: "Log 5 workouts",
    requirement: 5,
    icon: "seedling",
  },
  {
    id: "committed",
    type: "workouts_10",
    category: "consistency",
    tier: "silver",
    title: "Committed",
    description: "Log 10 workouts",
    requirement: 10,
    icon: "medal",
  },
  {
    id: "dedicated",
    type: "workouts_25",
    category: "consistency",
    tier: "silver",
    title: "Dedicated",
    description: "Log 25 workouts",
    requirement: 25,
    icon: "trophy-outline",
  },
  {
    id: "devoted",
    type: "workouts_50",
    category: "consistency",
    tier: "gold",
    title: "Devoted",
    description: "Log 50 workouts",
    requirement: 50,
    icon: "trophy",
  },
  {
    id: "obsessed",
    type: "workouts_100",
    category: "consistency",
    tier: "platinum",
    title: "Obsessed",
    description: "Log 100 workouts",
    requirement: 100,
    icon: "crown",
  },

  // ==================== STREAK ACHIEVEMENTS ====================
  {
    id: "on_fire",
    type: "streak_3",
    category: "streak",
    tier: "bronze",
    title: "On Fire",
    description: "3-day workout streak",
    requirement: 3,
    icon: "fire",
  },
  {
    id: "hot_streak",
    type: "streak_7",
    category: "streak",
    tier: "silver",
    title: "Hot Streak",
    description: "7-day workout streak",
    requirement: 7,
    icon: "flame",
  },
  {
    id: "unstoppable",
    type: "streak_14",
    category: "streak",
    tier: "gold",
    title: "Unstoppable",
    description: "14-day workout streak",
    requirement: 14,
    icon: "local-fire-department",
  },
  {
    id: "legendary",
    type: "streak_30",
    category: "streak",
    tier: "platinum",
    title: "Legendary",
    description: "30-day workout streak",
    requirement: 30,
    icon: "star-circle",
  },
  {
    id: "immortal",
    type: "streak_100",
    category: "streak",
    tier: "diamond",
    title: "Immortal",
    description: "100-day workout streak",
    requirement: 100,
    icon: "infinity",
  },

  // ==================== EXERCISE-SPECIFIC ACHIEVEMENTS ====================
  {
    id: "runner",
    type: "runs_10",
    category: "exercise",
    tier: "bronze",
    title: "Runner",
    description: "Complete 10 runs",
    requirement: 10,
    icon: "run",
  },
  {
    id: "squat_master",
    type: "squats_1000",
    category: "exercise",
    tier: "silver",
    title: "Squat Master",
    description: "Complete 1000 squats total",
    requirement: 1000,
    icon: "dumbbell",
  },
  {
    id: "pushup_king",
    type: "pushups_500",
    category: "exercise",
    tier: "gold",
    title: "Pushup King",
    description: "Complete 500 pushups total",
    requirement: 500,
    icon: "arm-flex",
  },
  {
    id: "pullup_champion",
    type: "pullups_200",
    category: "exercise",
    tier: "platinum",
    title: "Pullup Champion",
    description: "Complete 200 pullups total",
    requirement: 200,
    icon: "weight-lifter",
  },
];

/**
 * Get achievement definition by ID
 */
export function getAchievementById(
  id: string,
): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((a) => a.id === id);
}

/**
 * Get achievement tier color
 */
export function getTierColor(tier: AchievementTier): string {
  switch (tier) {
    case "bronze":
      return "#CD7F32";
    case "silver":
      return "#C0C0C0";
    case "gold":
      return "#FFD700";
    case "platinum":
      return "#E5E4E2";
    case "diamond":
      return "#B9F2FF";
    default:
      return "#808080";
  }
}

/**
 * Get achievement tier background color (subtle version)
 */
export function getTierBackgroundColor(tier: AchievementTier): string {
  switch (tier) {
    case "bronze":
      return "#FFF5EB";
    case "silver":
      return "#F5F7FB";
    case "gold":
      return "#FFFBEB";
    case "platinum":
      return "#F8F9FA";
    case "diamond":
      return "#EBF9FF";
    default:
      return "#F5F5F5";
  }
}

/**
 * Map achievement type to activity type
 */
export function getActivityTypeForAchievement(
  type: AchievementType,
): ActivityType | null {
  switch (type) {
    case "runs_10":
      return "running";
    case "squats_1000":
      return "squats";
    case "pushups_500":
      return "pushups";
    case "pullups_200":
      return "pullups";
    default:
      return null;
  }
}

/**
 * Calculate progress for an achievement
 * Performance: <10ms per achievement
 */
export function calculateAchievementProgress(
  achievement: AchievementDefinition,
  workouts: WorkoutEntry[],
  streak: StreakData,
): number {
  switch (achievement.category) {
    case "consistency":
      // Count total workouts
      return workouts.length;

    case "streak":
      // Use current streak
      return streak.currentStreak;

    case "exercise": {
      const activityType = getActivityTypeForAchievement(achievement.type);
      if (!activityType) return 0;

      const relevantWorkouts = workouts.filter((w) => w.type === activityType);

      // For cumulative rep achievements, sum total reps
      if (
        achievement.type === "squats_1000" ||
        achievement.type === "pushups_500" ||
        achievement.type === "pullups_200"
      ) {
        return calculateTotalReps(workouts, activityType);
      }

      // For workout count achievements, count workouts
      return relevantWorkouts.length;
    }

    default:
      return 0;
  }
}

/**
 * Check and detect newly unlocked achievements
 * Performance: <200ms for all 15 achievements
 *
 * @param workouts - All user workouts
 * @param streak - Current streak data
 * @param unlockedAchievementIds - IDs of already unlocked achievements
 * @returns Array of newly unlocked achievements
 */
export function checkAchievements(
  workouts: WorkoutEntry[],
  streak: StreakData,
  unlockedAchievementIds: string[] = [],
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    // Skip if already unlocked
    if (unlockedAchievementIds.includes(definition.id)) {
      continue;
    }

    const progress = calculateAchievementProgress(definition, workouts, streak);
    const isUnlocked = progress >= definition.requirement;

    if (isUnlocked) {
      const newAchievement: Achievement = {
        ...definition,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress,
      };

      newlyUnlocked.push(newAchievement);
    }
  }

  return newlyUnlocked;
}

/**
 * Calculate progress for all achievements
 * Performance: <150ms for all 15 achievements
 */
export function calculateAllAchievementProgress(
  workouts: WorkoutEntry[],
  streak: StreakData,
  unlockedAchievementIds: string[] = [],
): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const progress = calculateAchievementProgress(definition, workouts, streak);
    const isUnlocked =
      progress >= definition.requirement ||
      unlockedAchievementIds.includes(definition.id);

    return {
      ...definition,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked
        ? unlockedAchievementIds.includes(definition.id)
          ? undefined // Already unlocked, no date yet
          : new Date().toISOString()
        : undefined,
      progress,
    };
  });
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  achievements: Achievement[],
  category: AchievementCategory,
): Achievement[] {
  return achievements.filter((a) => a.category === category);
}

/**
 * Get unlocked achievements
 */
export function getUnlockedAchievements(
  achievements: Achievement[],
): Achievement[] {
  return achievements.filter((a) => a.unlocked);
}

/**
 * Get locked achievements
 */
export function getLockedAchievements(
  achievements: Achievement[],
): Achievement[] {
  return achievements.filter((a) => !a.unlocked);
}

/**
 * Get achievements sorted by tier (diamond first)
 */
export function sortAchievementsByTier(
  achievements: Achievement[],
): Achievement[] {
  const tierOrder: Record<AchievementTier, number> = {
    diamond: 0,
    platinum: 1,
    gold: 2,
    silver: 3,
    bronze: 4,
  };

  return [...achievements].sort(
    (a, b) => tierOrder[a.tier] - tierOrder[b.tier],
  );
}

/**
 * Get next achievable achievement (highest progress locked achievement)
 */
export function getNextAchievement(
  achievements: Achievement[],
): Achievement | null {
  const locked = getLockedAchievements(achievements);
  if (locked.length === 0) return null;

  return locked.reduce((highest, current) =>
    current.progress > highest.progress ? current : highest,
  );
}

/**
 * Calculate achievement completion percentage
 */
export function calculateCompletionPercentage(
  achievements: Achievement[],
): number {
  if (achievements.length === 0) return 0;

  const unlocked = getUnlockedAchievements(achievements).length;
  return Math.round((unlocked / achievements.length) * 100);
}

/**
 * Get tier badge icon
 */
export function getTierBadgeIcon(tier: AchievementTier): string {
  switch (tier) {
    case "bronze":
      return "medal";
    case "silver":
      return "medal-outline";
    case "gold":
      return "star";
    case "platinum":
      return "star-outline";
    case "diamond":
      return "diamond";
    default:
      return "medal";
  }
}

/**
 * Format achievement progress for display
 */
export function formatAchievementProgress(achievement: Achievement): string {
  if (achievement.unlocked) {
    return "Completed";
  }

  const remaining = achievement.requirement - achievement.progress;
  if (remaining <= 0) {
    return "Ready to unlock!";
  }

  return `${remaining} more to go`;
}

/**
 * Get accessibility label for achievement
 */
export function getAchievementAccessibilityLabel(
  achievement: Achievement,
): string {
  const status = achievement.unlocked
    ? `Unlocked ${achievement.title}. ${achievement.description}`
    : `${achievement.title}. ${achievement.description}. Progress: ${achievement.progress} out of ${achievement.requirement}`;

  return status;
}
