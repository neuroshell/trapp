import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LoginScreen } from "../src/screens/LoginScreen";
import { AuthProvider } from "../src/auth/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock expo-crypto
jest.mock("expo-crypto", () => ({
  digestStringAsync: jest.fn((algorithm, text) =>
    Promise.resolve(`hash_${text}`)
  ),
  CryptoDigestAlgorithm: {
    SHA256: "SHA256",
  },
}));

const renderWithAuthProvider = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(null);
  });

  it("renders login form with email and password fields", () => {
    const { getByLabelText, getByText } = renderWithAuthProvider(
      <LoginScreen />
    );

    expect(getByLabelText("Email address input")).toBeTruthy();
    expect(getByLabelText("Password input")).toBeTruthy();
    expect(getByText("Email")).toBeTruthy();
    expect(getByText("Password")).toBeTruthy();
    expect(getByText("FitTrack Pro")).toBeTruthy();
  });

  it("renders sign in button", () => {
    const { getByText } = renderWithAuthProvider(<LoginScreen />);

    expect(getByText("Sign In")).toBeTruthy();
  });

  it("displays email validation error for invalid email", async () => {
    const { getByLabelText, getByText } = renderWithAuthProvider(
      <LoginScreen />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");

    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        getByText("Please enter a valid email address")
      ).toBeTruthy();
    });
  });

  it("displays email required error when empty", async () => {
    const { getByLabelText, getByText } = renderWithAuthProvider(
      <LoginScreen />
    );

    const passwordInput = getByLabelText("Password input");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText("Email is required")).toBeTruthy();
    });
  });

  it("displays password required error when empty", async () => {
    const { getByLabelText, getByText } = renderWithAuthProvider(
      <LoginScreen />
    );

    const emailInput = getByLabelText("Email address input");
    fireEvent.changeText(emailInput, "test@example.com");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText("Password is required")).toBeTruthy();
    });
  });

  it("submits form with valid credentials", async () => {
    const mockUser = {
      id: "user_123",
      email: "test@example.com",
      passwordHash: "hash_password123",
      createdAt: new Date().toISOString(),
    };

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("USERS")) {
        return Promise.resolve(JSON.stringify([mockUser]));
      }
      return Promise.resolve(null);
    });

    const { getByLabelText, getByText } = renderWithAuthProvider(
      <LoginScreen />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining("AUTH"),
        expect.any(String)
      );
    });
  });

  it("shows loading state during sign in", async () => {
    const mockUser = {
      id: "user_123",
      email: "test@example.com",
      passwordHash: "hash_password123",
      createdAt: new Date().toISOString(),
    };

    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("USERS")) {
        return Promise.resolve(JSON.stringify([mockUser]));
      }
      return Promise.resolve(null);
    });

    const { getByLabelText, getByText } = renderWithAuthProvider(
      <LoginScreen />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    // Button should be disabled during loading
    expect(signInButton.props.disabled).toBe(true);
  });

  it("has accessible error messages with alert role", async () => {
    const { getByLabelText, getByRole, getByText } = renderWithAuthProvider(
      <LoginScreen />
    );

    const emailInput = getByLabelText("Email address input");
    fireEvent.changeText(emailInput, "invalid");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      const errorText = getByRole("alert");
      expect(errorText).toBeTruthy();
    });
  });

  it("clears error when user starts typing", async () => {
    const { getByLabelText, queryByText } = renderWithAuthProvider(
      <LoginScreen />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");

    // Trigger validation
    fireEvent.changeText(emailInput, "invalid");
    fireEvent.changeText(passwordInput, "short");

    // Clear error by typing valid input
    fireEvent.changeText(emailInput, "test@example.com");

    // Error should be cleared
    await waitFor(() => {
      expect(queryByText("Please enter a valid email address")).toBeNull();
    });
  });

  it("has proper accessibility labels on inputs", () => {
    const { getByLabelText } = renderWithAuthProvider(<LoginScreen />);

    expect(getByLabelText("Email address input")).toBeTruthy();
    expect(getByLabelText("Password input")).toBeTruthy();
  });

  it("has proper accessibility hints on inputs", () => {
    const { getByLabelText } = renderWithAuthProvider(<LoginScreen />);

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");

    expect(emailInput.props.accessibilityHint).toBe("Enter your email address");
    expect(passwordInput.props.accessibilityHint).toBe("Enter your password");
  });

  it("uses email-address keyboard type for email input", () => {
    const { getByLabelText } = renderWithAuthProvider(<LoginScreen />);

    const emailInput = getByLabelText("Email address input");
    expect(emailInput.props.keyboardType).toBe("email-address");
  });

  it("uses secureTextEntry for password input", () => {
    const { getByLabelText } = renderWithAuthProvider(<LoginScreen />);

    const passwordInput = getByLabelText("Password input");
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it("has minimum 48px height for inputs", () => {
    const { getByLabelText } = renderWithAuthProvider(<LoginScreen />);

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");

    // Check that minHeight is set in styles
    expect(emailInput.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ minHeight: 48 }),
      ])
    );
  });

  it("renders register link when onNavigateToRegister is provided", () => {
    const onNavigateToRegister = jest.fn();
    const { getByText } = renderWithAuthProvider(
      <LoginScreen onNavigateToRegister={onNavigateToRegister} />
    );

    expect(getByText("Create Account")).toBeTruthy();
  });

  it("calls onNavigateToRegister when register link is pressed", () => {
    const onNavigateToRegister = jest.fn();
    const { getByText } = renderWithAuthProvider(
      <LoginScreen onNavigateToRegister={onNavigateToRegister} />
    );

    const registerLink = getByText("Create Account");
    fireEvent.press(registerLink);

    expect(onNavigateToRegister).toHaveBeenCalled();
  });

  it("has accessibility role link on register button", () => {
    const onNavigateToRegister = jest.fn();
    const { UNSAFE_getByType } = renderWithAuthProvider(
      <LoginScreen onNavigateToRegister={onNavigateToRegister} />
    );

    // Find TouchableOpacity with accessibilityRole="link"
    // This is a bit hacky but necessary for testing
    const { getAllByRole } = renderWithAuthProvider(
      <LoginScreen onNavigateToRegister={onNavigateToRegister} />
    );

    const links = getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("displays generic error for invalid credentials", async () => {
    // No user in storage
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByLabelText, getByText } = renderWithAuthProvider(
      <LoginScreen />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign In");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(getByText("Invalid email or password")).toBeTruthy();
    });
  });

  it("has proper touch target for sign in button", () => {
    const { getByText } = renderWithAuthProvider(<LoginScreen />);

    const signInButton = getByText("Sign In");

    // Check minHeight in style
    expect(signInButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ minHeight: 48 }),
      ])
    );
  });

  it("auto-capitalizes none for email input", () => {
    const { getByLabelText } = renderWithAuthProvider(<LoginScreen />);

    const emailInput = getByLabelText("Email address input");
    expect(emailInput.props.autoCapitalize).toBe("none");
  });

  it("disables auto-correct for email input", () => {
    const { getByLabelText } = renderWithAuthProvider(<LoginScreen />);

    const emailInput = getByLabelText("Email address input");
    expect(emailInput.props.autoCorrect).toBe(false);
  });

  it("renders support text", () => {
    const { getByText } = renderWithAuthProvider(<LoginScreen />);

    expect(
      getByText(/Enter your email and password to sign in/i)
    ).toBeTruthy();
  });
});
