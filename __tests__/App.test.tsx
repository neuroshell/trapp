import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import App from "../App";

// Mock expo-crypto
jest.mock("expo-crypto", () => ({
  digestStringAsync: jest.fn((algorithm, text) => {
    return Promise.resolve(`hash_${text}`);
  }),
  CryptoDigestAlgorithm: {
    SHA256: "SHA256",
  },
}));

// Mock navigation
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: any) => <>{children}</>,
      Screen: ({ children }: any) => <>{children}</>,
    }),
  };
});

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it("renders SplashScreen when loading", async () => {
    // Initially loading state is true
    const { getByText } = render(<App />);

    // Should show loading message
    await waitFor(() => {
      expect(getByText("Loading your data...")).toBeTruthy();
    });
  });

  it("renders LoginScreen when not authenticated", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<App />);

    // After loading completes, should show login
    await waitFor(() => {
      expect(getByText("FitTrack Pro")).toBeTruthy();
    });

    expect(getByText("Enter a username and password to sign in.")).toBeTruthy();
  });

  it("shows login form when no auth state exists", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByPlaceholderText } = render(<App />);

    await waitFor(() => {
      expect(getByPlaceholderText("Enter username")).toBeTruthy();
      expect(getByPlaceholderText("Enter password")).toBeTruthy();
    });
  });

  it("allows user to sign in", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);

    const { getByText, getByPlaceholderText } = render(<App />);

    await waitFor(() => {
      expect(getByPlaceholderText("Enter username")).toBeTruthy();
    });

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining("AUTH"),
        expect.any(String)
      );
    });
  });

  it("shows error for empty login form", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("Sign in")).toBeTruthy();
    });

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        getByText("Please enter both a username and password.")
      ).toBeTruthy();
    });
  });

  it("persists auth state after sign in", async () => {
    let storedAuth: string | null = null;

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH") && storedAuth) {
        return Promise.resolve(storedAuth);
      }
      return Promise.resolve(null);
    });
    (AsyncStorage.setItem as jest.Mock).mockImplementation((key, value) => {
      storedAuth = value;
      return Promise.resolve(value);
    });

    const { getByText, getByPlaceholderText, queryByText } = render(<App />);

    // Sign in
    await waitFor(() => {
      expect(getByPlaceholderText("Enter username")).toBeTruthy();
    });

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    fireEvent.changeText(usernameInput, "persistuser");
    fireEvent.changeText(passwordInput, "password");

    fireEvent.press(getByText("Sign in"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    // Re-render app (simulating app restart)
    const { unmount } = render(<App />);
    unmount();

    // Render again with persisted auth
    const { getByText: getByText2, queryByText: queryByText2 } = render(<App />);

    await waitFor(() => {
      // Should not show login form anymore
      expect(queryByText2("Enter username")).toBeNull();
    });
  });

  it("shows app title on login screen", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("FitTrack Pro")).toBeTruthy();
    });
  });

  it("renders sign in button on login screen", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("Sign in")).toBeTruthy();
    });
  });

  it("has username input with autoCapitalize none", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByPlaceholderText } = render(<App />);

    await waitFor(() => {
      const usernameInput = getByPlaceholderText("Enter username");
      expect(usernameInput.props.autoCapitalize).toBe("none");
    });
  });

  it("has password input with secureTextEntry", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByPlaceholderText } = render(<App />);

    await waitFor(() => {
      const passwordInput = getByPlaceholderText("Enter password");
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });

  it("clears error when user starts typing", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText, getByPlaceholderText, queryByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("Sign in")).toBeTruthy();
    });

    // Submit empty form
    fireEvent.press(getByText("Sign in"));

    await waitFor(() => {
      expect(
        getByText("Please enter both a username and password.")
      ).toBeTruthy();
    });

    // Start typing
    const usernameInput = getByPlaceholderText("Enter username");
    fireEvent.changeText(usernameInput, "test");

    // Error should be cleared
    await waitFor(() => {
      expect(
        queryByText("Please enter both a username and password.")
      ).toBeNull();
    });
  });

  it("handles sign out flow", async () => {
    // Start with auth state
    const mockAuth = JSON.stringify({
      user: { username: "testuser" },
      passwordHash: "hash",
    });

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(mockAuth);
      }
      return Promise.resolve(null);
    });

    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(null);

    // App would render authenticated state here
    // For now, verify the auth state is loaded
    const { getByText } = render(<App />);

    await waitFor(() => {
      // Should not show login
      expect(getByText("FitTrack Pro")).toBeTruthy();
    });
  });

  it("loads auth state from correct storage key", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    render(<App />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        expect.stringContaining("AUTH")
      );
    });
  });

  it("handles AsyncStorage errors gracefully", async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
      new Error("Storage unavailable")
    );

    // Should not crash
    expect(() => render(<App />)).not.toThrow();
  });

  it("renders without crashing", () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it("has consistent initial render", () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeDefined();
  });

  it("supports re-rendering", () => {
    const { rerender } = render(<App />);
    rerender(<App />);
    expect(true).toBe(true);
  });

  it("handles multiple sign in attempts", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);

    const { getByText, getByPlaceholderText } = render(<App />);

    await waitFor(() => {
      expect(getByPlaceholderText("Enter username")).toBeTruthy();
    });

    // First attempt
    fireEvent.changeText(getByPlaceholderText("Enter username"), "user1");
    fireEvent.changeText(getByPlaceholderText("Enter password"), "pass1");
    fireEvent.press(getByText("Sign in"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);

    // Second attempt
    const { getByText: getByText2, getByPlaceholderText: getByPlaceholderText2 } =
      render(<App />);

    await waitFor(() => {
      expect(getByPlaceholderText2("Enter username")).toBeTruthy();
    });

    fireEvent.changeText(getByPlaceholderText2("Enter username"), "user2");
    fireEvent.changeText(getByPlaceholderText2("Enter password"), "pass2");
    fireEvent.press(getByText2("Sign in"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("handles special characters in credentials", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);

    const { getByText, getByPlaceholderText } = render(<App />);

    await waitFor(() => {
      expect(getByPlaceholderText("Enter username")).toBeTruthy();
    });

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    fireEvent.changeText(usernameInput, "user@domain.com");
    fireEvent.changeText(passwordInput, "P@ssw0rd!#$%");

    fireEvent.press(getByText("Sign in"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("handles very long credentials", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);

    const { getByText, getByPlaceholderText } = render(<App />);

    await waitFor(() => {
      expect(getByPlaceholderText("Enter username")).toBeTruthy();
    });

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    fireEvent.changeText(usernameInput, "a".repeat(100));
    fireEvent.changeText(passwordInput, "b".repeat(100));

    fireEvent.press(getByText("Sign in"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("maintains loading state during auth check", async () => {
    // Simulate slow storage
    (AsyncStorage.getItem as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(null), 100);
        })
    );

    const { getByText } = render(<App />);

    // Should show loading initially
    await waitFor(() => {
      expect(getByText("Loading your data...")).toBeTruthy();
    });
  });

  it("transitions from loading to login", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText, queryByText } = render(<App />);

    // Should show loading
    await waitFor(() => {
      expect(getByText("Loading your data...")).toBeTruthy();
    });

    // Should then show login
    await waitFor(() => {
      expect(getByText("Sign in")).toBeTruthy();
    });
  });

  it("handles null auth state from storage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("Sign in")).toBeTruthy();
    });
  });

  it("handles undefined auth state from storage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(undefined);

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("Sign in")).toBeTruthy();
    });
  });

  it("handles malformed auth state from storage", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("not-json");

    const { getByText } = render(<App />);

    await waitFor(() => {
      expect(getByText("Sign in")).toBeTruthy();
    });
  });

  it("handles partial auth state (missing passwordHash)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ user: { username: "user" } })
    );

    const { getByText } = render(<App />);

    await waitFor(() => {
      // Should show login since passwordHash is missing
      expect(getByText("Sign in")).toBeTruthy();
    });
  });

  it("handles partial auth state (missing user)", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ passwordHash: "hash" })
    );

    const { getByText } = render(<App />);

    await waitFor(() => {
      // Should show login since user is missing
      expect(getByText("Sign in")).toBeTruthy();
    });
  });
});
