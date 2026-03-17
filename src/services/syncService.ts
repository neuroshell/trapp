/**
 * Sync Service
 *
 * Implements offline-first synchronization between local AsyncStorage
 * and backend server. Features:
 *
 * - Optimistic updates (UI updates immediately)
 * - Queue management for offline operations
 * - Automatic retry with exponential backoff
 * - Conflict resolution (last-write-wins)
 * - Incremental sync for efficiency
 * - Network-aware synchronization
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

import { WorkoutEntry } from "../models";
import { loadWorkouts } from "../storage";
import {
  apiService,
  SyncQueueItem,
  SyncOperationType,
  SyncStatus,
} from "./apiService";
import { Achievement } from "../utils/achievements";
import { isOnline } from "../utils/network";

// Storage keys
const SYNC_QUEUE_KEY = "TRAPP_TRACKER_SYNC_QUEUE_V1";
const SYNC_STATUS_KEY = "TRAPP_TRACKER_SYNC_STATUS_V1";
const LAST_SYNC_KEY = "TRAPP_TRACKER_LAST_SYNC_V1";

// Sync configuration
const MAX_RETRY_COUNT = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 60000; // 1 minute
const SYNC_DEBOUNCE_MS = 2000; // Wait 2 seconds after last operation before syncing

/**
 * Sync Service Class
 *
 * Manages all synchronization operations between local storage
 * and backend server.
 */
class SyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isSyncing: boolean = false;
  private syncDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<() => void> = new Set();
  private status: SyncStatus = {
    isOnline: true,
    isSyncing: false,
    pendingOperations: 0,
  };

  constructor() {
    this.loadQueue();
    this.loadStatus();
  }

  // ==================== INITIALIZATION ====================

  /**
   * Initialize sync service
   * Called on app startup to check for pending sync operations
   */
  async initialize(): Promise<void> {
    await this.loadQueue();
    await this.loadStatus();

    // Check if we're online
    const online = await isOnline();
    this.updateStatus({ isOnline: online });

    // If online and have pending operations, trigger sync
    if (online && this.syncQueue.length > 0) {
      this.triggerSync();
    }
  }

  /**
   * Load sync queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      if (json) {
        this.syncQueue = JSON.parse(json);
      }
    } catch (error) {
      console.warn("Failed to load sync queue", error);
      this.syncQueue = [];
    }
  }

  /**
   * Save sync queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        SYNC_QUEUE_KEY,
        JSON.stringify(this.syncQueue),
      );
      this.updateStatus({ pendingOperations: this.syncQueue.length });
    } catch (error) {
      console.warn("Failed to save sync queue", error);
    }
  }

  /**
   * Load sync status from storage
   */
  private async loadStatus(): Promise<void> {
    try {
      const json = await AsyncStorage.getItem(SYNC_STATUS_KEY);
      if (json) {
        const stored = JSON.parse(json);
        this.status = { ...this.status, ...stored };
      }
    } catch (error) {
      console.warn("Failed to load sync status", error);
    }
  }

  /**
   * Save sync status to storage
   */
  private async saveStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(this.status));
    } catch (error) {
      console.warn("Failed to save sync status", error);
    }
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Update sync status
   */
  private updateStatus(updates: Partial<SyncStatus>): void {
    this.status = { ...this.status, ...updates };
    this.saveStatus();
    this.notifyListeners();
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.status };
  }

  /**
   * Subscribe to sync status changes
   */
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback());
  }

  // ==================== QUEUE MANAGEMENT ====================

  /**
   * Add operation to sync queue
   */
  private async queueOperation(
    type: SyncOperationType,
    payload: any,
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    this.syncQueue.push(item);
    await this.saveQueue();
    this.triggerSync();

    return item;
  }

  /**
   * Remove operation from queue
   */
  private async removeQueueItem(itemId: string): Promise<void> {
    this.syncQueue = this.syncQueue.filter((item) => item.id !== itemId);
    await this.saveQueue();
  }

  /**
   * Get queue length
   */
  getPendingOperations(): number {
    return this.syncQueue.length;
  }

  // ==================== SYNC OPERATIONS ====================

  /**
   * Trigger sync (debounced)
   */
  private triggerSync(): void {
    // Clear existing timer
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }

    // Set new timer
    this.syncDebounceTimer = setTimeout(() => {
      this.executeSync();
    }, SYNC_DEBOUNCE_MS);
  }

  /**
   * Execute sync immediately
   * Uploads pending items and downloads recent changes from backend
   */
  async syncNow(): Promise<{ downloaded: number; uploaded: number }> {
    // Check if we have authentication token
    const token = apiService.getToken();
    if (!token) {
      throw new Error(
        "Not authenticated. Please sign in with backend to sync.",
      );
    }

    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
      this.syncDebounceTimer = null;
    }

    return await this.executeQuickSync();
  }

  /**
   * Quick sync: upload pending items and download recent changes
   */
  private async executeQuickSync(): Promise<{
    downloaded: number;
    uploaded: number;
  }> {
    this.isSyncing = true;
    this.updateStatus({ isSyncing: true, error: undefined });

    let downloaded = 0;
    let uploaded = 0;

    try {
      const online = await isOnline();
      if (!online) {
        throw new Error("Device is offline");
      }

      // Step 1: Download recent changes from backend
      const lastSyncJson = await AsyncStorage.getItem(LAST_SYNC_KEY);
      const lastSyncAt = lastSyncJson || undefined;
      console.log(
        "[SyncService] Downloading recent changes since:",
        lastSyncAt,
      );
      const downloadResponse = await apiService.downloadData(lastSyncAt);
      console.log(
        "[SyncService] Downloaded workouts:",
        downloadResponse.data.workouts?.length || 0,
      );

      if (downloadResponse.data.workouts) {
        downloaded = downloadResponse.data.workouts.length;
        // Merge with local workouts
        const localWorkouts = await loadWorkouts();
        const workoutMap = new Map<string, WorkoutEntry>();

        localWorkouts.forEach((w) => workoutMap.set(w.id, w));
        downloadResponse.data.workouts.forEach((remote: WorkoutEntry) => {
          const local = workoutMap.get(remote.id);
          if (
            !local ||
            new Date(remote.updatedAt) > new Date(local.updatedAt)
          ) {
            workoutMap.set(remote.id, remote);
          }
        });

        await AsyncStorage.setItem(
          "TRAPP_TRACKER_WORKOUTS_V1",
          JSON.stringify(Array.from(workoutMap.values())),
        );
      }

      // Step 2: Upload pending items
      if (this.syncQueue.length > 0) {
        console.log(
          "[SyncService] Uploading",
          this.syncQueue.length,
          "pending items",
        );
        uploaded = await this.processQueue();
      }

      // Update last sync time
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      this.updateStatus({
        lastSyncAt: new Date().toISOString(),
        isSyncing: false,
      });

      console.log("[SyncService] Quick sync complete:", {
        downloaded,
        uploaded,
      });
      return { downloaded, uploaded };
    } catch (error) {
      this.updateStatus({
        isSyncing: false,
        error: error instanceof Error ? error.message : "Sync failed",
      });
      throw error;
    }
  }

  /**
   * Main sync execution logic
   * @param forceSync - If true, sync even if queue is empty (to download from backend)
   */
  private async executeSync(forceSync: boolean = false): Promise<void> {
    // Prevent concurrent syncs
    if (this.isSyncing) {
      return;
    }

    // Check if online
    const online = await isOnline();
    if (!online) {
      this.updateStatus({ isOnline: false });
      return;
    }

    // Check if queue is empty (skip if not forcing sync)
    if (this.syncQueue.length === 0 && !forceSync) {
      console.log("[SyncService] Queue empty, skipping sync");
      return;
    }

    this.isSyncing = true;
    this.updateStatus({ isSyncing: true, error: undefined });

    try {
      // Process queue items one by one
      const failedItems: SyncQueueItem[] = [];

      for (const item of this.syncQueue) {
        const success = await this.processQueueItem(item);
        if (!success) {
          failedItems.push(item);
        }
      }

      // Keep failed items in queue for retry
      if (failedItems.length > 0) {
        this.syncQueue = failedItems;
        await this.saveQueue();
      } else {
        this.syncQueue = [];
        await this.saveQueue();
      }

      // Update last sync time
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      this.updateStatus({
        lastSyncAt: new Date().toISOString(),
        isSyncing: false,
        pendingOperations: this.syncQueue.length,
      });
    } catch (error) {
      console.error("Sync failed", error);
      this.updateStatus({
        isSyncing: false,
        error: error instanceof Error ? error.message : "Sync failed",
      });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process all queue items and return count of uploaded items
   */
  private async processQueue(): Promise<number> {
    let uploaded = 0;
    const failedItems: SyncQueueItem[] = [];

    for (const item of this.syncQueue) {
      const success = await this.processQueueItem(item);
      if (success) {
        uploaded++;
      } else {
        failedItems.push(item);
      }
    }

    // Keep failed items in queue for retry
    this.syncQueue = failedItems;
    await this.saveQueue();

    return uploaded;
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: SyncQueueItem): Promise<boolean> {
    try {
      switch (item.type) {
        case "CREATE_WORKOUT":
        case "UPDATE_WORKOUT":
          await apiService.syncWorkout(item.payload);
          break;
        case "DELETE_WORKOUT":
          await apiService.deleteWorkout(item.payload.workoutId);
          break;
        case "SYNC_ACHIEVEMENT":
          await apiService.syncAchievement(item.payload);
          break;
        default:
          console.warn("Unknown sync operation type", item.type);
          return false;
      }

      return true;
    } catch {
      // Handle retry logic
      item.retryCount++;

      if (item.retryCount >= MAX_RETRY_COUNT) {
        console.error(
          `Sync operation failed after ${MAX_RETRY_COUNT} retries`,
          item,
        );
        return false; // Remove from queue
      }

      // Exponential backoff
      const delay = Math.min(
        INITIAL_RETRY_DELAY * Math.pow(2, item.retryCount),
        MAX_RETRY_DELAY,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the operation
      return this.processQueueItem(item);
    }
  }

  // ==================== WORKOUT SYNC ====================

  /**
   * Sync workout to backend
   *
   * If online: sync immediately
   * If offline: queue for later sync
   */
  async syncWorkout(workout: WorkoutEntry): Promise<void> {
    const online = await isOnline();

    console.log("[SyncService] syncWorkout called - online:", online);

    if (online) {
      try {
        console.log("[SyncService] Syncing workout immediately:", workout.id);
        const response = await apiService.syncWorkout(workout);
        // Use backend's timestamp from response or current time
        const backendTimestamp =
          (response as any).timestamp || new Date().toISOString();
        await AsyncStorage.setItem(LAST_SYNC_KEY, backendTimestamp);
        console.log(
          "[SyncService] Workout synced, lastSyncAt updated to:",
          backendTimestamp,
        );
      } catch (error) {
        console.warn(
          "[SyncService] Immediate sync failed, queuing workout",
          error,
        );
        // If sync fails, queue it
        await this.queueOperation("CREATE_WORKOUT", workout);
      }
    } else {
      console.log("[SyncService] Offline, queuing workout");
      // Queue for later
      await this.queueOperation("CREATE_WORKOUT", workout);
    }
  }

  /**
   * Sync workout deletion
   */
  async syncWorkoutDeletion(workoutId: string): Promise<void> {
    const online = await isOnline();

    if (online) {
      try {
        await apiService.deleteWorkout(workoutId);
      } catch {
        // If sync fails, queue it
        await this.queueOperation("DELETE_WORKOUT", { workoutId });
      }
    } else {
      // Queue for later
      await this.queueOperation("DELETE_WORKOUT", { workoutId });
    }
  }

  // ==================== ACHIEVEMENT SYNC ====================

  /**
   * Sync achievement to backend
   */
  async syncAchievement(achievement: Achievement): Promise<void> {
    const online = await isOnline();

    if (online) {
      try {
        await apiService.syncAchievement(achievement);
      } catch {
        await this.queueOperation("SYNC_ACHIEVEMENT", achievement);
      }
    } else {
      await this.queueOperation("SYNC_ACHIEVEMENT", achievement);
    }
  }

  // ==================== BULK SYNC ====================

  /**
   * Full sync: download ALL data from backend and merge with local
   *
   * Does NOT use incremental sync - downloads everything
   */
  async fullSync(): Promise<{
    downloaded: number;
    uploaded: number;
    conflicts: number;
  }> {
    this.updateStatus({ isSyncing: true, error: undefined });

    try {
      const online = await isOnline();
      if (!online) {
        throw new Error("Device is offline");
      }

      // Check if we have authentication token
      const token = apiService.getToken();
      if (!token) {
        throw new Error(
          "Not authenticated. Please sign in to sync with backend.",
        );
      }

      let downloaded = 0;
      let uploaded = 0;
      let conflicts = 0;

      // Download ALL data from backend (no since parameter = full sync)
      console.log(
        "[SyncService] Performing FULL sync - downloading all data...",
      );
      const downloadResponse = await apiService.downloadData(undefined);
      console.log(
        "[SyncService] Downloaded workouts:",
        downloadResponse.data.workouts?.length || 0,
      );

      if (downloadResponse.data.workouts) {
        downloaded = downloadResponse.data.workouts.length;
        // Merge downloaded workouts with local
        const localWorkouts = await loadWorkouts();
        const workoutMap = new Map<string, WorkoutEntry>();

        // Add local workouts first
        localWorkouts.forEach((w) => workoutMap.set(w.id, w));

        // Merge remote workouts (last-write-wins)
        downloadResponse.data.workouts.forEach((remote: WorkoutEntry) => {
          const local = workoutMap.get(remote.id);

          if (!local) {
            // New workout from server
            workoutMap.set(remote.id, remote);
            downloaded++;
          } else {
            // Conflict: use most recent
            const localTime = new Date(local.updatedAt).getTime();
            const remoteTime = new Date(remote.updatedAt).getTime();

            if (remoteTime > localTime) {
              workoutMap.set(remote.id, remote);
              conflicts++;
            }
          }
        });

        // Save merged workouts
        const mergedWorkouts = Array.from(workoutMap.values());
        await AsyncStorage.setItem(
          "TRAPP_TRACKER_WORKOUTS_V1",
          JSON.stringify(mergedWorkouts),
        );
      }

      // Upload pending local changes
      const pendingWorkouts = this.syncQueue
        .filter(
          (item) =>
            item.type === "CREATE_WORKOUT" || item.type === "UPDATE_WORKOUT",
        )
        .map((item) => item.payload);

      if (pendingWorkouts.length > 0) {
        const uploadResponse = await apiService.uploadData({
          workouts: pendingWorkouts,
        });
        uploaded = pendingWorkouts.length;
        conflicts = uploadResponse.conflicts || 0;

        // Clear uploaded items from queue
        this.syncQueue = this.syncQueue.filter(
          (item) =>
            item.type !== "CREATE_WORKOUT" && item.type !== "UPDATE_WORKOUT",
        );
        await this.saveQueue();
      }

      // Update last sync time
      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());

      this.updateStatus({
        isSyncing: false,
        lastSyncAt: new Date().toISOString(),
        pendingOperations: this.syncQueue.length,
      });

      return { downloaded, uploaded, conflicts };
    } catch (error) {
      console.error("Full sync failed", error);
      this.updateStatus({
        isSyncing: false,
        error: error instanceof Error ? error.message : "Sync failed",
      });
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Set authentication token
   * Called after successful login/registration
   */
  setAuthToken(token: string): void {
    apiService.setToken(token);
  }

  /**
   * Clear authentication token
   * Called on logout
   */
  clearAuthToken(): void {
    apiService.setToken(null);
  }

  /**
   * Verify authentication token
   */
  async verifyAuthToken(): Promise<boolean> {
    return apiService.verifyToken();
  }

  // ==================== NETWORK STATUS ====================

  /**
   * Set online status
   */
  setOnline(online: boolean): void {
    this.updateStatus({ isOnline: online });

    // If we just came online, trigger sync
    if (online && this.syncQueue.length > 0) {
      this.triggerSync();
    }
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Export for testing
export { SyncService };
