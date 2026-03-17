import { RunningFormData, StrengthFormData, ValidationResult } from "./models";

/**
 * Validates running form inputs
 * @param data - Form data with distance and duration
 * @returns ValidationResult with valid status and errors map
 */
export function validateRunningForm(data: RunningFormData): ValidationResult {
  const errors: Record<string, string> = {};
  const distance = parseFloat(data.distance);
  const duration = parseFloat(data.duration);

  // Distance validation: required, > 0, max 100km
  if (!data.distance || data.distance.trim() === "") {
    errors.distance = "Please enter a distance";
  } else if (isNaN(distance) || distance <= 0 || distance > 100) {
    errors.distance = "Please enter a valid distance (0-100 km)";
  }

  // Duration validation: required, > 0, max 1440min (24 hours)
  if (!data.duration || data.duration.trim() === "") {
    errors.duration = "Please enter a duration";
  } else if (isNaN(duration) || duration <= 0 || duration > 1440) {
    errors.duration = "Please enter a valid duration (0-1440 min)";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates strength form inputs
 * @param data - Form data with reps, sets, and optional weight
 * @returns ValidationResult with valid status and errors map
 */
export function validateStrengthForm(data: StrengthFormData): ValidationResult {
  const errors: Record<string, string> = {};
  const reps = parseInt(data.reps, 10);
  const sets = parseInt(data.sets, 10);
  const weight = data.weight ? parseFloat(data.weight) : 0;

  // Reps validation: required, > 0, max 1000
  if (!data.reps || data.reps.trim() === "") {
    errors.reps = "Please enter reps";
  } else if (isNaN(reps) || reps <= 0 || reps > 1000) {
    errors.reps = "Please enter valid reps (1-1000)";
  }

  // Sets validation: required, > 0, max 100
  if (!data.sets || data.sets.trim() === "") {
    errors.sets = "Please enter sets";
  } else if (isNaN(sets) || sets <= 0 || sets > 100) {
    errors.sets = "Please enter valid sets (1-100)";
  }

  // Weight validation: optional, but if provided must be 0-500kg
  if (data.weight && data.weight.trim() !== "") {
    if (isNaN(weight) || weight < 0 || weight > 500) {
      errors.weight = "Please enter a valid weight (0-500 kg)";
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates timestamp to ensure it's not in the future
 * @param timestamp - ISO date string to validate
 * @returns ValidationResult with warning if in future
 */
export function validateTimestamp(timestamp: string): ValidationResult {
  const errors: Record<string, string> = {};
  const workoutDate = new Date(timestamp);
  const now = new Date();

  // Allow 5 minutes buffer for clock differences
  if (workoutDate.getTime() > now.getTime() + 5 * 60 * 1000) {
    errors.timestamp = "Workout date cannot be in the future";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Calculates pace for running workouts
 * @param distanceKm - Distance in kilometers
 * @param durationMin - Duration in minutes
 * @returns Pace in minutes per kilometer (e.g., 6.0 = 6:00 min/km)
 */
export function calculatePace(distanceKm: number, durationMin: number): number {
  if (distanceKm <= 0 || durationMin <= 0) {
    return 0;
  }
  return durationMin / distanceKm;
}

/**
 * Formats pace as MM:SS min/km string
 * @param pace - Pace in minutes per kilometer
 * @returns Formatted pace string (e.g., "6:00 min/km")
 */
export function formatPace(pace: number): string {
  if (pace <= 0) {
    return "--:-- min/km";
  }

  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  const secondsStr = seconds < 10 ? `0${seconds}` : `${seconds}`;

  return `${minutes}:${secondsStr} min/km`;
}

/**
 * Checks if a value is an outlier (unusually high for a workout)
 * @param type - Workout type
 * @param value - Value to check
 * @returns True if value is an outlier
 */
export function isOutlier(type: string, value: number): boolean {
  const thresholds: Record<string, number> = {
    distance: 50, // 50km run is unusual
    duration: 180, // 3 hour workout is unusual
    reps: 500, // 500 reps is unusual
    sets: 50, // 50 sets is unusual
    weight: 200, // 200kg is unusual
  };

  const threshold = thresholds[type];
  return threshold ? value > threshold : false;
}
