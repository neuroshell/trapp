global.IS_REACT_ACT_ENVIRONMENT = true;

import React from "react";
import { act, render, waitFor } from "@testing-library/react-native";
import {
  AuthProvider,
  useAuth,
  validateEmail,
  validatePassword,
} from "../src/auth/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock expo-crypto
jest.mock("expo-crypto", () => ({
  digestStringAsync: jest.fn((algorithm, text) => {
    // Simple mock hash - just return a predictable value
    return Promise.resolve(`hash_${text}`);
  }),
  CryptoDigestAlgorithm: {
    SHA256: "SHA256",
  },
}));

const TestComponent = ({ testFn }: { testFn: (auth: any) => void }) => {
  const auth = useAuth();
  React.useEffect(() => {
    testFn(auth);
  }, [auth, testFn]);
  return null;
};

const renderWithAuthProvider = (testFn: (auth: any) => void) => {
  return render(
    <AuthProvider>
      <TestComponent testFn={testFn} />
    </AuthProvider>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(null);
  });

  describe("validation functions", () => {
    describe("validateEmail", () => {
      it("returns true for valid emails", () => {
        expect(validateEmail("test@example.com")).toBe(true);
        expect(validateEmail("user.name@domain.org")).toBe(true);
        expect(validateEmail("test+tag@example.co.uk")).toBe(true);
      });

      it("returns false for invalid emails", () => {
        expect(validateEmail("invalid")).toBe(false);
        expect(validateEmail("invalid@")).toBe(false);
        expect(validateEmail("@example.com")).toBe(false);
        expect(validateEmail("test@")).toBe(false);
        expect(validateEmail("")).toBe(false);
      });
    });

    describe("validatePassword", () => {
      it("rejects passwords shorter than 8 characters", () => {
        expect(validatePassword("short")).toEqual({
          valid: false,
          message: "Password must be at least 8 characters",
        });
        expect(validatePassword("1234567")).toEqual({
          valid: false,
          message: "Password must be at least 8 characters",
        });
      });

      it("rejects passwords without numbers", () => {
        expect(validatePassword("abcdefgh")).toEqual({
          valid: false,
          message: "Password should contain at least one number",
        });
      });

      it("accepts valid passwords", () => {
        expect(validatePassword("password123")).toEqual({ valid: true });
        expect(validatePassword("SecurePass1")).toEqual({ valid: true });
      });
    });
  });
});
