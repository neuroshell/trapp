import React, { useContext } from "react";
import { render, waitFor } from "@testing-library/react-native";
import { AuthProvider, useAuth, AuthContext } from "../src/auth/AuthContext";
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
  });

  it("provides initial auth state with loading true", async () => {
    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      expect(testFn).toHaveBeenCalled();
    });

    const authState = testFn.mock.calls[0][0];
    expect(authState.loading).toBe(true);
  });

  it("provides user as undefined when not signed in", async () => {
    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      expect(testFn).toHaveBeenCalled();
    });

    const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
    expect(authState.user).toBeUndefined();
  });

  it("provides passwordHash as undefined when not signed in", async () => {
    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      expect(testFn).toHaveBeenCalled();
    });

    const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
    expect(authState.passwordHash).toBeUndefined();
  });

  it("sets loading to false after initialization", async () => {
    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.loading).toBe(false);
    });
  });

  it("loads auth state from AsyncStorage on mount", async () => {
    const mockAuthState = {
      user: { username: "testuser" },
      passwordHash: "stored_hash",
    };

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(JSON.stringify(mockAuthState));
      }
      return Promise.resolve(null);
    });

    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
    expect(authState.user?.username).toBe("testuser");
    expect(authState.passwordHash).toBe("stored_hash");
  });

  it("signs in with username and password", async () => {
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

    await signInFn("newuser", "password123");

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining("AUTH"),
        expect.any(String)
      );
    });
  });

  it("hashes password during sign in", async () => {
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

    await signInFn("user", "mypassword");

    // Verify crypto was called
    const Crypto = require("expo-crypto");
    expect(Crypto.digestStringAsync).toHaveBeenCalled();
  });

  it("saves auth state to AsyncStorage after sign in", async () => {
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

    await signInFn("testuser", "password123");

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining("AUTH"),
        expect.stringContaining("testuser")
      );
    });
  });

  it("updates user state after sign in", async () => {
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

    await signInFn("newuser", "password");

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.user?.username).toBe("newuser");
    });
  });

  it("signs out and clears state", async () => {
    // Start with signed in state
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "hash",
          })
        );
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
      expect(authState.user?.username).toBe("testuser");
    });

    await signOutFn();

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        expect.stringContaining("AUTH")
      );
    });
  });

  it("clears AsyncStorage on sign out", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "hash",
          })
        );
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

    await signOutFn();

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  it("clears user state after sign out", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "hash",
          })
        );
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
      expect(authState.user?.username).toBe("testuser");
    });

    await signOutFn();

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.user).toBeUndefined();
    });
  });

  it("clears passwordHash after sign out", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "hash",
          })
        );
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

    await signOutFn();

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.passwordHash).toBeUndefined();
    });
  });

  it("throws error when useAuth used outside AuthProvider", () => {
    const TestComponent = () => {
      useAuth();
      return null;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within AuthProvider"
    );
  });

  it("handles empty auth state from AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.loading).toBe(false);
      expect(authState.user).toBeUndefined();
    });
  });

  it("handles invalid auth state from AsyncStorage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ invalid: "state" })
    );

    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.loading).toBe(false);
      expect(authState.user).toBeUndefined();
    });
  });

  it("trims username during sign in", async () => {
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

    await signInFn("  testuser  ", "password");

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.user?.username).toBe("testuser");
    });
  });

  it("provides signIn function", async () => {
    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      expect(testFn).toHaveBeenCalled();
    });

    const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
    expect(typeof authState.signIn).toBe("function");
  });

  it("provides signOut function", async () => {
    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      expect(testFn).toHaveBeenCalled();
    });

    const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
    expect(typeof authState.signOut).toBe("function");
  });

  it("provides loading state", async () => {
    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      expect(testFn).toHaveBeenCalled();
    });

    const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
    expect(typeof authState.loading).toBe("boolean");
  });

  it("provides user object with username", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "hash",
          })
        );
      }
      return Promise.resolve(null);
    });

    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.user?.username).toBe("testuser");
    });
  });

  it("provides passwordHash for sync functionality", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "stored_hash_123",
          })
        );
      }
      return Promise.resolve(null);
    });

    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.passwordHash).toBe("stored_hash_123");
    });
  });

  it("memoizes context value properly", async () => {
    const testFn = jest.fn();
    renderWithAuthProvider(testFn);

    await waitFor(() => {
      expect(testFn).toHaveBeenCalledTimes(2); // Initial + after loading
    });
  });

  it("handles sign in with empty password", async () => {
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

    await signInFn("user", "");

    // Should still attempt to sign in (validation is UI layer responsibility)
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("handles sign in with special characters in password", async () => {
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

    await signInFn("user", "P@ssw0rd!#$%");

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("persists auth state across component re-renders", async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "persisteduser" },
            passwordHash: "hash",
          })
        );
      }
      return Promise.resolve(null);
    });

    const testFn = jest.fn();
    const { rerender } = render(
      <AuthProvider>
        <TestComponent testFn={testFn} />
      </AuthProvider>
    );

    rerender(
      <AuthProvider>
        <TestComponent testFn={testFn} />
      </AuthProvider>
    );

    await waitFor(() => {
      const authState = testFn.mock.calls[testFn.mock.calls.length - 1][0];
      expect(authState.user?.username).toBe("persisteduser");
    });
  });
});
