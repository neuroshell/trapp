/**
 * Sync Hooks
 *
 * React hooks for integrating sync functionality into components.
 * Provides easy access to sync status, manual sync triggers,
 * and network status.
 */

import { useEffect, useState, useCallback, useMemo } from "react";

import { apiService, SyncStatus } from "../services/apiService";
import { syncService } from "../services/syncService";
import { useNetworkStatus } from "../utils/network";

/**
 * Hook to access sync status and operations
 *
 * @returns Sync state and control functions
 */
export function useSync() {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());

  useEffect(() => {
    // Subscribe to sync status changes
    const unsubscribe = syncService.subscribe(() => {
      setStatus(syncService.getStatus());
    });

    return unsubscribe;
  }, []);

  const syncNow = useCallback(async () => {
    try {
      const result = await syncService.syncNow();
      console.log("[useSync] Sync Now complete:", result);
      return result;
    } catch (error) {
      console.error("Manual sync failed", error);
      throw error;
    }
  }, []);

  const fullSync = useCallback(async () => {
    try {
      return await syncService.fullSync();
    } catch (error) {
      console.error("Full sync failed", error);
      throw error;
    }
  }, []);

  return useMemo(
    () => ({
      ...status,
      syncNow,
      fullSync,
      pendingOperations: status.pendingOperations,
      isSyncing: status.isSyncing,
      isOnline: status.isOnline,
      lastSyncAt: status.lastSyncAt,
      error: status.error,
    }),
    [status, syncNow, fullSync],
  );
}

/**
 * Hook to access network status
 *
 * @param onConnect - Callback when device comes online
 * @param onDisconnect - Callback when device goes offline
 * @returns Current network state
 */
export function useNetwork(onConnect?: () => void, onDisconnect?: () => void) {
  return useNetworkStatus(onConnect, onDisconnect);
}

/**
 * Hook to auto-sync on app mount
 *
 * Automatically triggers a full sync when component mounts.
 * Useful for home screen or dashboard.
 */
export function useAutoSync(enabled: boolean = true) {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const performSync = useCallback(async () => {
    if (!enabled) return;

    // Check if we have a token before attempting sync
    const token = apiService.getToken();
    if (!token) {
      // Silent fail - user is not logged in with backend
      console.log("Auto-sync skipped: No authentication token");
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const result = await syncService.fullSync();
      setLastSync(new Date());
      console.log("Auto-sync complete", result);
    } catch (err) {
      // Only set error if it's not a "not authenticated" error
      if (
        !(err instanceof Error) ||
        !err.message.includes("Not authenticated")
      ) {
        setError(err instanceof Error ? err : new Error("Sync failed"));
        console.warn("Auto-sync failed", err);
      } else {
        console.log("Auto-sync skipped: Not authenticated");
      }
    } finally {
      setSyncing(false);
    }
  }, [enabled]);

  useEffect(() => {
    performSync();
  }, [performSync]);

  return {
    syncing,
    error,
    lastSync,
    retry: performSync,
  };
}

/**
 * Hook to sync workout on creation
 *
 * Automatically syncs a workout when it's created.
 * Handles both online and offline scenarios.
 */
export function useWorkoutSync() {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const syncWorkout = useCallback(async (workout: any) => {
    setSyncing(true);
    setError(null);

    try {
      await syncService.syncWorkout(workout);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Sync failed"));
      throw err; // Re-throw for caller to handle
    } finally {
      setSyncing(false);
    }
  }, []);

  const syncWorkoutDeletion = useCallback(async (workoutId: string) => {
    try {
      await syncService.syncWorkoutDeletion(workoutId);
    } catch (err) {
      console.warn("Failed to sync workout deletion", err);
    }
  }, []);

  return {
    syncWorkout,
    syncWorkoutDeletion,
    syncing,
    error,
  };
}

/**
 * Hook to sync achievements
 */
export function useAchievementSync() {
  const [syncing, setSyncing] = useState(false);

  const syncAchievement = useCallback(async (achievement: any) => {
    setSyncing(true);
    try {
      await syncService.syncAchievement(achievement);
    } catch (error) {
      console.warn("Failed to sync achievement", error);
    } finally {
      setSyncing(false);
    }
  }, []);

  return { syncAchievement, syncing };
}

/**
 * Hook to monitor sync health
 *
 * Provides detailed sync status for debugging/monitoring
 */
export function useSyncHealth() {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = syncService.subscribe(() => {
      setStatus(syncService.getStatus());
      setPendingCount(syncService.getPendingOperations());
    });

    return unsubscribe;
  }, []);

  return useMemo(
    () => ({
      ...status,
      pendingOperations: pendingCount,
      isHealthy: status.isOnline && !status.error && !status.isSyncing,
      needsSync: pendingCount > 0,
      lastSyncAgo: status.lastSyncAt
        ? Date.now() - new Date(status.lastSyncAt).getTime()
        : null,
    }),
    [status, pendingCount],
  );
}
