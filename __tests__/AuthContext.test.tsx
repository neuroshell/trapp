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

  describe("signIn", () => {
    it("signs in with valid email and password", async () => {
      const mockUser = {
        id: "user_123",
        email: "test@example.com",
        username: "testuser",
        displayName: "Test User",
        passwordHash: "hash_password123",
        createdAt: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes("USERS")) {
          return Promise.resolve(JSON.stringify([mockUser]));
        }
        return Promise.resolve(null);
      });

      const testFn = jest.fn();
      let signInFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signInFn = auth.signIn;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signInFn("test@example.com", "password123");
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          expect.stringContaining("AUTH"),
          expect.any(String)
        );
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.user?.email).toBe("test@example.com");
      });
    });

    it("rejects invalid email format", async () => {
      const testFn = jest.fn();
      let signInFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signInFn = auth.signIn;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signInFn("invalid-email", "password123");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.error).toBe("Please enter a valid email address");
      });
    });

    it("rejects password shorter than 8 characters", async () => {
      const testFn = jest.fn();
      let signInFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signInFn = auth.signIn;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signInFn("test@example.com", "short");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.error).toBe(
          "Password must be at least 8 characters"
        );
      });
    });

    it("shows generic error for non-existent user", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const testFn = jest.fn();
      let signInFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signInFn = auth.signIn;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signInFn("nonexistent@example.com", "password123");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.error).toBe("Invalid email or password");
      });
    });

    it("shows generic error for wrong password", async () => {
      const mockUser = {
        id: "user_123",
        email: "test@example.com",
        username: "testuser",
        displayName: "Test User",
        passwordHash: "hash_correctpassword",
        createdAt: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes("USERS")) {
          return Promise.resolve(JSON.stringify([mockUser]));
        }
        return Promise.resolve(null);
      });

      const testFn = jest.fn();
      let signInFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signInFn = auth.signIn;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      // Password must pass validation (min 8 chars + at least one number)
      await act(async () => {
        await signInFn("test@example.com", "wrongpass1");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.error).toBe("Invalid email or password");
      });
    });

    it("hashes password during sign in", async () => {
      const mockUser = {
        id: "user_123",
        email: "test@example.com",
        username: "testuser",
        displayName: "Test User",
        passwordHash: "hash_password123",
        createdAt: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes("USERS")) {
          return Promise.resolve(JSON.stringify([mockUser]));
        }
        return Promise.resolve(null);
      });

      const testFn = jest.fn();
      let signInFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signInFn = auth.signIn;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signInFn("test@example.com", "password123");
      });

      const Crypto = require("expo-crypto");
      expect(Crypto.digestStringAsync).toHaveBeenCalled();
    });

    it("normalizes email to lowercase", async () => {
      const mockUser = {
        id: "user_123",
        email: "test@example.com",
        username: "testuser",
        displayName: "Test User",
        passwordHash: "hash_password123",
        createdAt: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes("USERS")) {
          return Promise.resolve(JSON.stringify([mockUser]));
        }
        return Promise.resolve(null);
      });

      const testFn = jest.fn();
      let signInFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signInFn = auth.signIn;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signInFn("TEST@EXAMPLE.COM", "password123");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.user?.email).toBe("test@example.com");
      });
    });
  });

  describe("signUp", () => {
    it("creates new user with valid email and password", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const testFn = jest.fn();
      let signUpFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signUpFn = auth.signUp;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signUpFn("newuser@example.com", "SecurePass123");
      });

      await waitFor(() => {
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          expect.stringContaining("AUTH"),
          expect.any(String)
        );
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.user?.email).toBe("newuser@example.com");
      });
    });

    it("rejects invalid email format", async () => {
      const testFn = jest.fn();
      let signUpFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signUpFn = auth.signUp;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signUpFn("invalid-email", "password123");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.error).toBe("Please enter a valid email address");
      });
    });

    it("rejects password shorter than 8 characters", async () => {
      const testFn = jest.fn();
      let signUpFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signUpFn = auth.signUp;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signUpFn("test@example.com", "short");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.error).toBe(
          "Password must be at least 8 characters"
        );
      });
    });

    it("rejects password without numbers", async () => {
      const testFn = jest.fn();
      let signUpFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signUpFn = auth.signUp;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signUpFn("test@example.com", "abcdefgh");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.error).toBe(
          "Password should contain at least one number"
        );
      });
    });

    it("rejects duplicate email registration", async () => {
      const existingUser = {
        id: "user_123",
        email: "existing@example.com",
        username: "existinguser",
        displayName: "Existing User",
        passwordHash: "hash_password123",
        createdAt: new Date().toISOString(),
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes("USERS")) {
          return Promise.resolve(JSON.stringify([existingUser]));
        }
        return Promise.resolve(null);
      });

      const testFn = jest.fn();
      let signUpFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signUpFn = auth.signUp;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signUpFn("existing@example.com", "NewPass123");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.error).toBe("This email is already registered");
      });
    });

    it("normalizes email to lowercase", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const testFn = jest.fn();
      let signUpFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signUpFn = auth.signUp;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signUpFn("NEWUSER@EXAMPLE.COM", "SecurePass123");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.user?.email).toBe("newuser@example.com");
      });
    });

    it("generates unique user id", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const testFn = jest.fn();
      let signUpFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signUpFn = auth.signUp;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signUpFn("user1@example.com", "SecurePass123");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.user?.id).toBeDefined();
        expect(authState.user?.id).toMatch(/^user_\d+_[a-z0-9]+$/);
      });
    });

    it("sets createdAt timestamp", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const testFn = jest.fn();
      let signUpFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signUpFn = auth.signUp;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signUpFn("user1@example.com", "SecurePass123");
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.user?.createdAt).toBeDefined();
        expect(new Date(authState.user?.createdAt!).toISOString()).toBeDefined();
      });
    });
  });

  describe("signOut", () => {
    it("signs out and clears state", async () => {
      const mockAuthState = {
        user: {
          id: "user_123",
          email: "test@example.com",
          createdAt: new Date().toISOString(),
        },
        passwordHash: "hash",
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes("AUTH")) {
          return Promise.resolve(JSON.stringify(mockAuthState));
        }
        return Promise.resolve(null);
      });

      const testFn = jest.fn();
      let signOutFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signOutFn = auth.signOut;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.user?.email).toBe("test@example.com");
      });

      await act(async () => {
        await signOutFn();
      });

      await waitFor(() => {
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
          expect.stringContaining("AUTH")
        );
      });

      await waitFor(() => {
        const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
        expect(authState.user).toBeNull();
      });
    });

    it("clears error on sign out", async () => {
      const mockAuthState = {
        user: {
          id: "user_123",
          email: "test@example.com",
          createdAt: new Date().toISOString(),
        },
        passwordHash: "hash",
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key.includes("AUTH")) {
          return Promise.resolve(JSON.stringify(mockAuthState));
        }
        return Promise.resolve(null);
      });

      const testFn = jest.fn();
      let signOutFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        signOutFn = auth.signOut;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      await act(async () => {
        await signOutFn();
      });

      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.error).toBeNull();
    });
  });

  describe("clearError", () => {
    it("clears error state", async () => {
      const testFn = jest.fn();
      let clearErrorFn: any;

      const TestComponentWithCapture = () => {
        const auth = useAuth();
        clearErrorFn = auth.clearError;
        React.useEffect(() => {
          testFn(auth);
        }, [auth]);
        return null;
      };

      render(
        <AuthProvider>
          <TestComponentWithCapture />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      // Manually set an error (this would normally happen through signIn/signUp)
      // For this test, we just verify the function exists and can be called
      expect(() =>
        act(() => {
          clearErrorFn();
        })
      ).not.toThrow();
    });
  });

  describe("context API", () => {
    it("throws error when useAuth used outside AuthProvider", () => {
      const TestComponent = () => {
        useAuth();
        return null;
      };

      expect(() => render(<TestComponent />)).toThrow(
        "useAuth must be used within AuthProvider"
      );
    });

    it("provides signIn function", async () => {
      const testFn = jest.fn();
      await renderWithAuthProvider(testFn);

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(typeof authState.signIn).toBe("function");
    });

    it("provides signUp function", async () => {
      const testFn = jest.fn();
      await renderWithAuthProvider(testFn);

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(typeof authState.signUp).toBe("function");
    });

    it("provides signOut function", async () => {
      const testFn = jest.fn();
      await renderWithAuthProvider(testFn);

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(typeof authState.signOut).toBe("function");
    });

    it("provides clearError function", async () => {
      const testFn = jest.fn();
      await renderWithAuthProvider(testFn);

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(typeof authState.clearError).toBe("function");
    });

    it("provides loading state", async () => {
      const testFn = jest.fn();
      await renderWithAuthProvider(testFn);

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(typeof authState.loading).toBe("boolean");
    });

    it("provides error state", async () => {
      const testFn = jest.fn();
      await renderWithAuthProvider(testFn);

      await waitFor(() => {
        expect(testFn).toHaveBeenCalled();
      });

      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(typeof authState.error).toBe("object"); // null or string
    });
  });
});
