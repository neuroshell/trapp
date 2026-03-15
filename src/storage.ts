import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

import { AppState } from "./models";

const STORAGE_KEY = "TRAPP_TRACKER_STATE_V1";
const DEVICE_ID_KEY = "TRAPP_TRACKER_DEVICE_ID";
const AUTH_KEY = "TRAPP_TRACKER_AUTH_V1";

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

export type AuthState = {
  user?: {
    username: string;
  };
  passwordHash?: string;
};

export async function loadAuthState(): Promise<AuthState> {
  try {
    const json = await AsyncStorage.getItem(AUTH_KEY);
    if (!json) return {};
    return JSON.parse(json) as AuthState;
  } catch (error) {
    console.warn("Failed to load auth state", error);
    return {};
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
