export type ActivityType =
  | "running"
  | "squats"
  | "pushups"
  | "pullups"
  | "other";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  date: string; // ISO date string
  quantity: number; // reps, minutes, etc.
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  entries: ActivityEntry[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  passwordHash?: string;
}

// Extended workout models for Task 002
export interface WorkoutEntry {
  id: string;
  userId: string;
  type: ActivityType;
  timestamp: string; // ISO 8601
  data: {
    distance?: number; // km, for running
    duration?: number; // minutes, for running
    reps?: number; // for strength exercises
    sets?: number; // for strength exercises
    weight?: number; // kg, optional for strength
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuickLogPreset {
  type: ActivityType;
  defaultValues: Partial<WorkoutEntry["data"]>;
}

// Validation result types
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

// Running form data
export interface RunningFormData {
  distance: string;
  duration: string;
}

// Strength form data
export interface StrengthFormData {
  reps: string;
  sets: string;
  weight?: string;
}
