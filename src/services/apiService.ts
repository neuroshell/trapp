/**
 * Backend API Service Layer
 *
 * Handles all HTTP communication with the backend server.
 * Supports JWT authentication, request/response transformation,
 * and graceful error handling.
 */

import { WorkoutEntry, User } from "../models";
import { Achievement } from "../utils/achievements";

// Backend API configuration
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

// Sync queue item types
export type SyncOperationType =
  | "CREATE_WORKOUT"
  | "UPDATE_WORKOUT"
  | "DELETE_WORKOUT"
  | "SYNC_ACHIEVEMENT";

export interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  payload: any;
  createdAt: string;
  retryCount: number;
  lastAttemptAt?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: string;
  pendingOperations: number;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface SyncResponse {
  success: boolean;
  conflicts?: number;
  resolved?: string[];
  timestamp: string;
}

export interface DownloadResponse {
  success: boolean;
  data: {
    workouts: WorkoutEntry[];
    achievements: Achievement[];
    profile: any;
  };
  timestamp: string;
}

/**
 * API Service Class
 *
 * Manages HTTP requests to backend with:
 * - JWT token authentication
 * - Automatic retry on failure
 * - Request/response transformation
 * - Error handling and logging
 */
class ApiService {
  private token: string | null = null;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_BASE_URL;
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Build headers for API requests
   */
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (includeAuth && this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
      console.log("[ApiService] Authorization header set:", `Bearer ${this.token.substring(0, 30)}...`);
    } else {
      console.log("[ApiService] No Authorization header - includeAuth:", includeAuth, "hasToken:", !!this.token);
    }

    return headers;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: this.getHeaders(includeAuth),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || data.error || "Request failed",
          response.status,
          data,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network error or other fetch failure
      throw new ApiError(
        error instanceof Error ? error.message : "Network error",
        0,
        null,
      );
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Register new user
   */
  async register(
    email: string,
    password: string,
    username?: string,
  ): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, username }),
      },
      false,
    ); // No auth needed for registration

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      false,
    ); // No auth needed for login

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Verify token validity
   */
  async verifyToken(): Promise<boolean> {
    try {
      await this.request(
        "/auth/verify",
        {
          method: "POST",
        },
        true,
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Logout (clear token)
   */
  logout(): void {
    this.setToken(null);
  }

  // ==================== SYNC OPERATIONS ====================

  /**
   * Download user data from backend
   */
  async downloadData(since?: string): Promise<DownloadResponse> {
    const endpoint = since
      ? `/sync?since=${encodeURIComponent(since)}`
      : "/sync";
    return await this.request<DownloadResponse>(endpoint, {
      method: "GET",
    });
  }

  /**
   * Upload data to backend (bulk sync)
   */
  async uploadData(data: {
    workouts?: WorkoutEntry[];
    achievements?: Achievement[];
    profile?: any;
  }): Promise<SyncResponse> {
    return await this.request<SyncResponse>("/sync", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Sync single workout (optimized for quick log)
   */
  async syncWorkout(
    workout: WorkoutEntry,
  ): Promise<{ success: boolean; workout: WorkoutEntry }> {
    return await this.request("/sync/workout", {
      method: "POST",
      body: JSON.stringify(workout),
    });
  }

  /**
   * Update existing workout
   */
  async updateWorkout(
    workoutId: string,
    workout: WorkoutEntry,
  ): Promise<{ success: boolean; workout: WorkoutEntry }> {
    return await this.request(`/sync/workout/${workoutId}`, {
      method: "PUT",
      body: JSON.stringify(workout),
    });
  }

  /**
   * Delete workout
   */
  async deleteWorkout(
    workoutId: string,
  ): Promise<{ success: boolean; deletedId: string }> {
    return await this.request(`/sync/workout/${workoutId}`, {
      method: "DELETE",
    });
  }

  /**
   * Sync achievement
   */
  async syncAchievement(
    achievement: Achievement,
  ): Promise<{ success: boolean; achievement: Achievement }> {
    return await this.request("/sync/achievement", {
      method: "POST",
      body: JSON.stringify(achievement),
    });
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Check backend server health
   */
  async healthCheck(): Promise<{ healthy: boolean; timestamp: string }> {
    try {
      const response: any = await this.request(
        "/health",
        {
          method: "GET",
        },
        false,
      ); // No auth needed
      return { healthy: response.success, timestamp: response.timestamp };
    } catch {
      throw new ApiError("Backend unavailable", 0, null);
    }
  }
}

/**
 * API Error Class
 *
 * Extends Error with HTTP status and response data
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }

  /**
   * Check if error is authentication-related
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is network-related
   */
  isNetworkError(): boolean {
    return this.status === 0;
  }

  /**
   * Check if error is server-related
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export for testing
export { ApiService };
