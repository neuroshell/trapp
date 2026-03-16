import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

import {
  ActivityType,
  AppState,
  AuthState,
  User,
  WorkoutEntry,
} from "./models";

const STORAGE_KEY = "TRAPP_TRACKER_STATE_V1";
const DEVICE_ID_KEY = "TRAPP_TRACKER_DEVICE_ID";
const AUTH_KEY = "TRAPP_TRACKER_AUTH_V1";
const USERS_KEY = "TRAPP_TRACKER_USERS_V1";
const WORKOUTS_KEY = "TRAPP_TRACKER_WORKOUTS_V1";

export async function loadAppState(): Promise<AppState> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return { entries: [] };
    const parsed = JSON.parse(json) as AppState;
    return parsed;
  } catch (error) {
    console.warn("Failed to load app state", error);
    return { entries: [] };
  }
}

export async function saveAppState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save app state", error);
  }
}

export async function clearAppState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear app state", error);
  }
}

export async function getDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;

    const generated = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    await AsyncStorage.setItem(DEVICE_ID_KEY, generated);
    return generated;
  } catch (error) {
    console.warn("Failed to get device id", error);
    return "unknown";
  }
}

// User storage for managing multiple users
export interface StoredUser extends User {
  passwordHash: string;
}

export async function loadUsers(): Promise<StoredUser[]> {
  try {
    const json = await AsyncStorage.getItem(USERS_KEY);
    if (!json) return [];
    return JSON.parse(json) as StoredUser[];
  } catch (error) {
    console.warn("Failed to load users", error);
    return [];
  }
}

export async function saveUser(user: StoredUser): Promise<void> {
  try {
    const users = await loadUsers();
    const existingIndex = users.findIndex((u) => u.email === user.email);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn("Failed to save user", error);
  }
}

export async function findUserByEmail(
  email: string,
): Promise<StoredUser | undefined> {
  const users = await loadUsers();
  return users.find((u) => u.email === email);
}

export async function loadAuthState(): Promise<AuthState> {
  try {
    const json = await AsyncStorage.getItem(AUTH_KEY);
    if (!json) return { user: null };
    return JSON.parse(json) as AuthState;
  } catch (error) {
    console.warn("Failed to load auth state", error);
    return { user: null };
  }
}

export async function saveAuthState(state: AuthState): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save auth state", error);
  }
}

export async function clearAuthState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
  } catch (error) {
    console.warn("Failed to clear auth state", error);
  }
}

export function useAppStorage() {
  const clearAll = React.useCallback(async () => {
    await clearAppState();
  }, []);

  return { clearAll };
}

// Workout storage functions for Task 002
export async function loadWorkouts(): Promise<WorkoutEntry[]> {
  try {
    const json = await AsyncStorage.getItem(WORKOUTS_KEY);
    if (!json) return [];
    return JSON.parse(json) as WorkoutEntry[];
  } catch (error) {
    console.warn("Failed to load workouts", error);
    return [];
  }
}

export async function saveWorkout(workout: WorkoutEntry): Promise<void> {
  try {
    const workouts = await loadWorkouts();
    workouts.push(workout);
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.warn("Failed to save workout", error);
    throw error;
  }
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  try {
    const workouts = await loadWorkouts();
    const filtered = workouts.filter((w) => w.id !== workoutId);
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.warn("Failed to delete workout", error);
    throw error;
  }
}

export async function getWorkouts(): Promise<WorkoutEntry[]> {
  return loadWorkouts();
}

export async function getLastWorkoutValues(
  type: ActivityType,
): Promise<Partial<WorkoutEntry["data"]> | null> {
  try {
    const workouts = await loadWorkouts();
    const userWorkouts = workouts.filter((w) => w.type === type);

    if (userWorkouts.length === 0) {
      return getDefaultValues(type);
    }

    // Return most recent workout's data
    const latest = userWorkouts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0];

    return latest.data;
  } catch (error) {
    console.warn("Failed to get last workout values", error);
    return getDefaultValues(type);
  }
}

export function getDefaultValues(
  type: ActivityType,
): Partial<WorkoutEntry["data"]> {
  switch (type) {
    case "running":
      return { distance: 5.0, duration: 30 };
    case "squats":
      return { reps: 20, sets: 3 };
    case "pushups":
      return { reps: 15, sets: 3 };
    case "pullups":
      return { reps: 10, sets: 3 };
    default:
      return {};
  }
}

export async function updateWorkout(
  workoutId: string,
  updates: Partial<WorkoutEntry>,
): Promise<void> {
  try {
    const workouts = await loadWorkouts();
    const index = workouts.findIndex((w) => w.id === workoutId);
    if (index === -1) {
      throw new Error("Workout not found");
    }
    workouts[index] = {
      ...workouts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (error) {
    console.warn("Failed to update workout", error);
    throw error;
  }
}

export async function clearWorkouts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(WORKOUTS_KEY);
  } catch (error) {
    console.warn("Failed to clear workouts", error);
  }
}

/**
 * Get workouts within a date range (inclusive)
 * @param startDate - ISO date string for start of range
 * @param endDate - ISO date string for end of range
 * @returns Array of workouts within the specified date range
 */
export async function getWorkoutsByDateRange(
  startDate: string,
  endDate: string,
): Promise<WorkoutEntry[]> {
  try {
    const workouts = await loadWorkouts();
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.timestamp);
      return workoutDate >= start && workoutDate <= end;
    });
  } catch (error) {
    console.warn("Failed to get workouts by date range", error);
    return [];
  }
}

/**
 * Get all workouts grouped by date for history list display
 * @returns Array of workout entries sorted by date (newest first)
 */
export async function getWorkoutsForHistory(): Promise<WorkoutEntry[]> {
  try {
    const workouts = await loadWorkouts();
    // Sort by date descending (newest first)
    return workouts.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  } catch (error) {
    console.warn("Failed to get workouts for history", error);
    return [];
  }
}
