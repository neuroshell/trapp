import * as Crypto from "expo-crypto";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { User } from "../models";
import { apiService } from "../services/apiService";
import { syncService } from "../services/syncService";
import {
  loadAuthState,
  saveAuthState,
  clearAuthState,
  findUserByEmail,
  saveUser,
} from "../storage";

export type AuthUser = User;

type AuthContextValue = {
  user: AuthUser | null;
  passwordHash?: string;
  token?: string;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  useBackendAuth: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters",
    };
  }
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: "Password should contain at least one number",
    };
  }
  return { valid: true };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [passwordHash, setPasswordHash] = useState<string | undefined>(
    undefined,
  );
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useBackendAuth, setUseBackendAuth] = useState(false);

  const safeSetState = <T,>(
    setter: React.Dispatch<React.SetStateAction<T>>,
    value: T,
  ) => {
    // In tests, wrap state updates in act() to avoid warnings from async updates.
    if (process.env.NODE_ENV === "test") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { act } = require("react-test-renderer");
        act(() => setter(value as React.SetStateAction<T>));
        return;
      } catch {
        // Ignore if act isn't available
      }
    }
    setter(value as React.SetStateAction<T>);
  };

  useEffect(() => {
    (async () => {
      try {
        const loaded = await loadAuthState();
        if (loaded.user) {
          safeSetState(setUser, loaded.user);
          safeSetState(setPasswordHash, loaded.passwordHash);

          // Restore token if available
          const storedToken = (loaded as any).token;
          if (storedToken) {
            safeSetState(setToken, storedToken);
            apiService.setToken(storedToken);
            setUseBackendAuth(true);

            // Initialize sync service with token
            syncService.setAuthToken(storedToken);

            // Verify token is still valid
            const valid = await apiService.verifyToken();
            if (!valid) {
              // Token expired, clear auth
              safeSetState(setUser, null);
              safeSetState(setPasswordHash, undefined);
              safeSetState(setToken, undefined);
              await clearAuthState();
              apiService.setToken(null);
              setUseBackendAuth(false);
            }
          }
        } else {
          safeSetState(setUser, null);
          safeSetState(setPasswordHash, undefined);
          safeSetState(setToken, undefined);
        }
      } catch (err) {
        console.warn("Failed to load auth state", err);
        safeSetState(setUser, null);
        safeSetState(setPasswordHash, undefined);
        safeSetState(setToken, undefined);
      } finally {
        safeSetState(setLoading, false);
      }
    })();
  }, []);

  const hash = async (text: string) =>
    await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);

  const signIn = async (email: string, password: string) => {
    safeSetState(setError, null);

    // Validate email format
    if (!validateEmail(email)) {
      safeSetState(setError, "Please enter a valid email address");
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      safeSetState(setError, passwordValidation.message || "Invalid password");
      return;
    }

    try {
      // Try backend authentication first
      const response = await apiService.login(email, password);

      if (response.success && response.token) {
        // Backend auth successful
        safeSetState(setUser, response.user);
        safeSetState(setToken, response.token);
        setUseBackendAuth(true);

        // Store token in auth state
        await saveAuthState({
          user: response.user,
          passwordHash: undefined,
          token: response.token,
        } as any);

        // Initialize sync service
        syncService.setAuthToken(response.token);
        syncService.initialize();

        return;
      }
    } catch (backendError) {
      console.warn(
        "Backend auth failed, falling back to local auth",
        backendError,
      );
      // Fall back to local auth
    }

    // Local authentication (fallback)
    const passwordHash = await hash(password);
    const storedUser = await findUserByEmail(email.trim().toLowerCase());

    if (!storedUser) {
      // Generic error for security (don't reveal if email exists)
      safeSetState(setError, "Invalid email or password");
      return;
    }

    if (storedUser.passwordHash !== passwordHash) {
      safeSetState(setError, "Invalid email or password");
      return;
    }

    const authUser: AuthUser = {
      id: storedUser.id,
      email: storedUser.email,
      username: storedUser.username,
      displayName: storedUser.displayName,
      createdAt: storedUser.createdAt,
    };

    safeSetState(setUser, authUser);
    safeSetState(setPasswordHash, passwordHash);
    setUseBackendAuth(false);
    await saveAuthState({ user: authUser, passwordHash });
  };

  const signUp = async (email: string, password: string) => {
    setError(null);

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      safeSetState(setError, passwordValidation.message || "Invalid password");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Try backend registration first
      const response = await apiService.register(normalizedEmail, password);

      if (response.success && response.token) {
        // Backend registration successful
        safeSetState(setUser, response.user);
        safeSetState(setToken, response.token);
        setUseBackendAuth(true);

        // Store token in auth state
        await saveAuthState({
          user: response.user,
          passwordHash: undefined,
          token: response.token,
        } as any);

        // Initialize sync service
        syncService.setAuthToken(response.token);
        syncService.initialize();

        return;
      }
    } catch (backendError) {
      console.warn(
        "Backend registration failed, falling back to local registration",
        backendError,
      );
      // Fall back to local registration
    }

    // Check if user exists locally
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      safeSetState(setError, "This email is already registered");
      return;
    }

    // Local registration (fallback)
    const passwordHash = await hash(password);
    const newUser: AuthUser = {
      id: `user_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      email: normalizedEmail,
      username: normalizedEmail,
      displayName: undefined,
      createdAt: new Date().toISOString(),
    };

    await saveUser({ ...newUser, passwordHash });
    safeSetState(setUser, newUser);
    safeSetState(setPasswordHash, passwordHash);
    setUseBackendAuth(false);
    await saveAuthState({ user: newUser, passwordHash });
  };

  const signOut = async () => {
    safeSetState(setUser, null);
    safeSetState(setPasswordHash, undefined);
    safeSetState(setToken, undefined);
    safeSetState(setError, null);
    setUseBackendAuth(false);

    // Clear API token
    apiService.setToken(null);

    // Clear sync service token
    syncService.clearAuthToken();

    await clearAuthState();
  };

  const clearError = () => {
    safeSetState(setError, null);
  };

  const value = useMemo(
    () => ({
      user,
      passwordHash,
      token,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      clearError,
      isAuthenticated: !!user,
      useBackendAuth,
    }),
    [user, passwordHash, token, loading, error, useBackendAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
