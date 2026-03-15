import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as Crypto from "expo-crypto";
import { loadAuthState, saveAuthState, clearAuthState } from "../storage";

export type AuthUser = {
  username: string;
};

type AuthState = {
  user?: AuthUser;
  passwordHash?: string; // stored for demo purposes only
};

type AuthContextValue = {
  user?: AuthUser;
  passwordHash?: string;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loaded = await loadAuthState();
      // Ensure stored auth state includes the minimum required fields.
      if (loaded?.user?.username && loaded?.passwordHash) {
        setState(loaded);
      } else {
        setState({});
      }
      setLoading(false);
    })();
  }, []);

  const hash = async (text: string) =>
    await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);

  const signIn = async (username: string, password: string) => {
    const passwordHash = await hash(password);

    const authState: AuthState = {
      user: { username },
      passwordHash,
    };

    setState(authState);
    await saveAuthState(authState);
  };

  const signOut = async () => {
    setState({});
    await clearAuthState();
  };

  const value = useMemo(
    () => ({ user: state.user, passwordHash: state.passwordHash, loading, signIn, signOut }),
    [state.user, state.passwordHash, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
