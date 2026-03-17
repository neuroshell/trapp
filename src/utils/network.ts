/**
 * Network Detection Utility
 *
 * Detects network connectivity changes and provides
 * online/offline status for offline-first architecture.
 */

import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export interface NetworkState {
  isOnline: boolean;
  isConnected: boolean;
  networkType?: string;
}

/**
 * Check current network status
 */
export async function getNetworkState(): Promise<NetworkState> {
  try {
    const state = await NetInfo.fetch();
    return {
      isOnline: state.isConnected ?? false,
      isConnected: state.isConnected ?? false,
      networkType: state.type ?? "unknown",
    };
  } catch {
    // If we can't check, assume offline
    return {
      isOnline: false,
      isConnected: false,
      networkType: "unknown",
    };
  }
}

/**
 * Check if device is currently online
 */
export async function isOnline(): Promise<boolean> {
  const state = await getNetworkState();
  return state.isOnline;
}

/**
 * React hook for network status
 *
 * Provides real-time network status updates
 * and can trigger callbacks on connectivity changes.
 */
export function useNetworkStatus(
  onConnect?: () => void,
  onDisconnect?: () => void,
): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: true,
    isConnected: true,
    networkType: "unknown",
  });

  useEffect(() => {
    // Get initial state
    getNetworkState().then(setNetworkState);

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      const wasOnline = networkState.isOnline;
      const isNowOnline = state.isConnected ?? false;

      const newState: NetworkState = {
        isOnline: isNowOnline,
        isConnected: isNowOnline,
        networkType: state.type ?? "unknown",
      };

      setNetworkState(newState);

      // Trigger callbacks on state change
      if (!wasOnline && isNowOnline && onConnect) {
        onConnect();
      } else if (wasOnline && !isNowOnline && onDisconnect) {
        onDisconnect();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return networkState;
}

/**
 * Wait for network to become available
 *
 * @param timeout - Maximum time to wait in ms (default: 30 seconds)
 * @returns Promise that resolves when online or rejects on timeout
 */
export async function waitForNetwork(timeout: number = 30000): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const online = await isOnline();
    if (online) {
      return;
    }
    // Wait 1 second before checking again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Network timeout: device remained offline");
}

/**
 * Execute a function when network is available
 *
 * @param fn - Function to execute
 * @param timeout - Maximum time to wait for network
 * @returns Result of function execution
 */
export async function executeWhenOnline<T>(
  fn: () => Promise<T>,
  timeout?: number,
): Promise<T> {
  await waitForNetwork(timeout);
  return fn();
}
