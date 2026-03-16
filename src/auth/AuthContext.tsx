import * as Crypto from "expo-crypto";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { User } from "../models";
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
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const loaded = await loadAuthState();
        if (loaded.user) {
          setUser(loaded.user);
          setPasswordHash(loaded.passwordHash);
        } else {
          setUser(null);
          setPasswordHash(undefined);
        }
      } catch (err) {
        console.warn("Failed to load auth state", err);
        setUser(null);
        setPasswordHash(undefined);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const hash = async (text: string) =>
    await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);

  const signIn = async (email: string, password: string) => {
    setError(null);

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message || "Invalid password");
      return;
    }

    const passwordHash = await hash(password);
    const storedUser = await findUserByEmail(email.trim().toLowerCase());

    if (!storedUser) {
      // Generic error for security (don't reveal if email exists)
      setError("Invalid email or password");
      return;
    }

    if (storedUser.passwordHash !== passwordHash) {
      setError("Invalid email or password");
      return;
    }

    const authUser: AuthUser = {
      id: storedUser.id,
      email: storedUser.email,
      username: storedUser.username,
      displayName: storedUser.displayName,
      createdAt: storedUser.createdAt,
    };

    setUser(authUser);
    setPasswordHash(passwordHash);
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
      setError(passwordValidation.message || "Invalid password");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      setError("This email is already registered");
      return;
    }

    const passwordHash = await hash(password);
    const newUser: AuthUser = {
      id: `user_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      email: normalizedEmail,
      username: normalizedEmail,
      displayName: undefined,
      createdAt: new Date().toISOString(),
    };

    await saveUser({ ...newUser, passwordHash });
    setUser(newUser);
    setPasswordHash(passwordHash);
    await saveAuthState({ user: newUser, passwordHash });
  };

  const signOut = async () => {
    setUser(null);
    setError(null);
    await clearAuthState();
  };

  const clearError = () => {
    setError(null);
  };

  const value = useMemo(
    () => ({
      user,
      passwordHash,
      loading,
      error,
      signIn,
      signUp,
      signOut,
      clearError,
    }),
    [user, passwordHash, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
