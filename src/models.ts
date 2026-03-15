export type ActivityType = "running" | "squats" | "pushups" | "pullups" | "other";

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
