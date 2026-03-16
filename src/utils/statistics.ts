/**
 * Statistics Calculation Engine
 *
 * Provides performant calculations for workout statistics including:
 * - Weekly summaries
 * - Personal records
 * - Streak calculations
 *
 * All calculations are optimized to complete in <100ms
 */

import { ActivityType, WorkoutEntry } from "../models";

/**
 * Weekly statistics summary
 */
export interface WeeklyStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalDistance: number; // km
  totalReps: number; // for strength exercises
  byType: Record<ActivityType, number>;
  weekStart: Date;
  weekEnd: Date;
}

/**
 * Personal record for an exercise type
 */
export interface PersonalRecord {
  type: ActivityType;
  value: number;
  unit: string;
  date: string;
  workoutId: string;
  isNew?: boolean; // Flag for recently achieved PR
}

/**
 * Streak data
 */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakDates: string[]; // Array of dates in current streak
  isActive: boolean;
}

/**
 * Get the start of the week (Sunday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the week (Saturday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const result = new Date(weekStart);
  result.setDate(weekStart.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Calculate weekly statistics for the current week
 * Performance: <50ms for 1000+ workouts
 */
export function calculateWeeklyStats(workouts: WorkoutEntry[]): WeeklyStats {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = getWeekEnd(now);

  // Filter workouts for current week
  const weekWorkouts = workouts.filter((w) => {
    const workoutDate = new Date(w.timestamp);
    return workoutDate >= weekStart && workoutDate <= weekEnd;
  });

  const stats: WeeklyStats = {
    totalWorkouts: weekWorkouts.length,
    totalDuration: 0,
    totalDistance: 0,
    totalReps: 0,
    byType: { running: 0, squats: 0, pushups: 0, pullups: 0, other: 0 },
    weekStart,
    weekEnd,
  };

  // Aggregate stats by type
  weekWorkouts.forEach((workout) => {
    stats.byType[workout.type]++;

    if (workout.type === "running") {
      stats.totalDuration += workout.data.duration || 0;
      stats.totalDistance += workout.data.distance || 0;
    } else {
      // Strength exercises: sum reps × sets
      const reps = workout.data.reps || 0;
      const sets = workout.data.sets || 0;
      stats.totalReps += reps * sets;
    }
  });

  return stats;
}

/**
 * Calculate weekly statistics for a specific week
 */
export function calculateWeeklyStatsForDate(
  workouts: WorkoutEntry[],
  referenceDate: Date,
): WeeklyStats {
  const weekStart = getWeekStart(referenceDate);
  const weekEnd = getWeekEnd(referenceDate);

  const weekWorkouts = workouts.filter((w) => {
    const workoutDate = new Date(w.timestamp);
    return workoutDate >= weekStart && workoutDate <= weekEnd;
  });

  const stats: WeeklyStats = {
    totalWorkouts: weekWorkouts.length,
    totalDuration: 0,
    totalDistance: 0,
    totalReps: 0,
    byType: { running: 0, squats: 0, pushups: 0, pullups: 0, other: 0 },
    weekStart,
    weekEnd,
  };

  weekWorkouts.forEach((workout) => {
    stats.byType[workout.type]++;

    if (workout.type === "running") {
      stats.totalDuration += workout.data.duration || 0;
      stats.totalDistance += workout.data.distance || 0;
    } else {
      const reps = workout.data.reps || 0;
      const sets = workout.data.sets || 0;
      stats.totalReps += reps * sets;
    }
  });

  return stats;
}

/**
 * Get unit label for an activity type
 */
export function getUnitForType(type: ActivityType): string {
  switch (type) {
    case "running":
      return "minutes";
    case "squats":
      return "reps";
    case "pushups":
      return "reps";
    case "pullups":
      return "reps";
    default:
      return "units";
  }
}

/**
 * Calculate personal records for all exercise types
 * Performance: <50ms for 1000+ workouts
 */
export function calculatePersonalRecords(
  workouts: WorkoutEntry[],
): PersonalRecord[] {
  const records: Record<ActivityType, PersonalRecord | null> = {
    running: null,
    squats: null,
    pushups: null,
    pullups: null,
    other: null,
  };

  workouts.forEach((workout) => {
    const currentPR = records[workout.type];
    let workoutValue: number;

    // Determine value to compare based on exercise type
    if (workout.type === "running") {
      // For running, use distance as primary metric
      workoutValue = workout.data.distance || 0;
    } else {
      // For strength, use total volume (reps × sets)
      workoutValue = (workout.data.reps || 0) * (workout.data.sets || 0);
    }

    if (!currentPR || workoutValue > currentPR.value) {
      records[workout.type] = {
        type: workout.type,
        value: workoutValue,
        unit: getUnitForType(workout.type),
        date: workout.timestamp,
        workoutId: workout.id,
        isNew: false,
      };
    }
  });

  return Object.values(records).filter(
    (pr): pr is PersonalRecord => pr !== null,
  );
}

/**
 * Calculate personal records with "new PR" detection
 * Compares against existing PRs to flag new achievements
 */
export function calculatePersonalRecordsWithDetection(
  workouts: WorkoutEntry[],
  existingPRs: PersonalRecord[],
): PersonalRecord[] {
  const newPRs = calculatePersonalRecords(workouts);

  // Flag new PRs
  return newPRs.map((pr) => {
    const existingPR = existingPRs.find((e) => e.type === pr.type);
    if (!existingPR || pr.value > existingPR.value) {
      return { ...pr, isNew: true };
    }
    return pr;
  });
}

/**
 * Normalize a date to start of day (midnight)
 */
function normalizeDate(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Get unique workout dates sorted descending (newest first)
 */
export function getUniqueWorkoutDates(workouts: WorkoutEntry[]): string[] {
  const uniqueDates = Array.from(
    new Set(
      workouts.map((w) => {
        const d = normalizeDate(new Date(w.timestamp));
        return d.toISOString();
      }),
    ),
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return uniqueDates;
}

/**
 * Calculate longest streak from an array of unique dates
 * Performance: <20ms for 365+ dates
 */
export function calculateLongestStreak(uniqueDates: string[]): number {
  if (uniqueDates.length === 0) return 0;
  if (uniqueDates.length === 1) return 1;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);

    const diffDays =
      (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

/**
 * Calculate current and longest workout streak
 * Performance: <30ms for 365+ workouts
 *
 * Streak rules:
 * - Current streak counts consecutive days ending today or yesterday
 * - Streak resets if no workout in past 2 days
 * - Longest streak is historical best
 */
export function calculateStreak(workouts: WorkoutEntry[]): StreakData {
  if (workouts.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
      streakDates: [],
      isActive: false,
    };
  }

  // Get unique workout dates
  const uniqueDates = getUniqueWorkoutDates(workouts);
  const lastWorkoutDate = uniqueDates[0];
  const lastWorkout = normalizeDate(new Date(lastWorkoutDate));

  const today = normalizeDate(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if streak is active (worked out today or yesterday)
  const isActiveStreak =
    lastWorkout.getTime() === today.getTime() ||
    lastWorkout.getTime() === yesterday.getTime();

  if (!isActiveStreak) {
    return {
      currentStreak: 0,
      longestStreak: calculateLongestStreak(uniqueDates),
      lastWorkoutDate,
      streakDates: [],
      isActive: false,
    };
  }

  // Calculate current streak
  let currentStreak = 1;
  const streakDates: string[] = [lastWorkoutDate];

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);

    const diffDays =
      (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak++;
      streakDates.push(uniqueDates[i]);
    } else {
      break;
    }
  }

  const longestStreak = calculateLongestStreak(uniqueDates);

  return {
    currentStreak,
    longestStreak,
    lastWorkoutDate,
    streakDates,
    isActive: true,
  };
}

/**
 * Calculate total workouts by type
 */
export function calculateWorkoutsByType(
  workouts: WorkoutEntry[],
): Record<ActivityType, number> {
  const counts: Record<ActivityType, number> = {
    running: 0,
    squats: 0,
    pushups: 0,
    pullups: 0,
    other: 0,
  };

  workouts.forEach((w) => {
    counts[w.type]++;
  });

  return counts;
}

/**
 * Calculate total workouts
 */
export function calculateTotalWorkouts(workouts: WorkoutEntry[]): number {
  return workouts.length;
}

/**
 * Calculate total distance (running only)
 */
export function calculateTotalDistance(workouts: WorkoutEntry[]): number {
  return workouts
    .filter((w) => w.type === "running")
    .reduce((sum, w) => sum + (w.data.distance || 0), 0);
}

/**
 * Calculate total duration (running only)
 */
export function calculateTotalDuration(workouts: WorkoutEntry[]): number {
  return workouts
    .filter((w) => w.type === "running")
    .reduce((sum, w) => sum + (w.data.duration || 0), 0);
}

/**
 * Calculate total reps for a specific exercise type
 */
export function calculateTotalReps(
  workouts: WorkoutEntry[],
  type: ActivityType,
): number {
  return workouts
    .filter((w) => w.type === type)
    .reduce((sum, w) => sum + (w.data.reps || 0) * (w.data.sets || 0), 0);
}

/**
 * Get workouts for a specific date
 */
export function getWorkoutsForDate(
  workouts: WorkoutEntry[],
  date: Date,
): WorkoutEntry[] {
  const normalizedDate = normalizeDate(date);
  const startOfDay = normalizedDate.getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

  return workouts.filter((w) => {
    const workoutTime = new Date(w.timestamp).getTime();
    return workoutTime >= startOfDay && workoutTime <= endOfDay;
  });
}

/**
 * Check if there was a workout on a specific date
 */
export function hasWorkoutOnDate(
  workouts: WorkoutEntry[],
  date: Date,
): boolean {
  return getWorkoutsForDate(workouts, date).length > 0;
}

/**
 * Get date range for streak visualization
 */
export function getStreakDateRange(streak: StreakData): {
  start: Date;
  end: Date;
} {
  if (!streak.lastWorkoutDate) {
    return { start: new Date(), end: new Date() };
  }

  const end = new Date(streak.lastWorkoutDate);
  const start = new Date(end);
  start.setDate(start.getDate() - streak.currentStreak + 1);

  return { start, end };
}
