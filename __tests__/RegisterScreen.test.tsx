import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { act } from "react-test-renderer";
import { RegisterScreen } from "../src/screens/RegisterScreen";
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

// Helper to wait for async operations
const waitForAsync = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
};

describe("RegisterScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(null);
  });

  it("renders registration form with all required fields", () => {
    const { getByLabelText, getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    expect(getByLabelText("Email address input")).toBeTruthy();
    expect(getByLabelText("Password input")).toBeTruthy();
    expect(getByLabelText("Confirm password input")).toBeTruthy();
    expect(getByText("Email")).toBeTruthy();
    expect(getByText("Password")).toBeTruthy();
    expect(getByText("Confirm Password")).toBeTruthy();
    expect(getByText(/Create Account/, { selector: "Text" })).toBeTruthy();
  });

  it("renders terms acceptance checkbox", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    expect(getByLabelText("Accept terms and conditions")).toBeTruthy();
  });

  it("renders login link", () => {
    const { getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    expect(getByText("Sign In")).toBeTruthy();
  });

  it("calls onNavigateToLogin when login link is pressed", () => {
    const onNavigateToLogin = jest.fn();
    const { getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={onNavigateToLogin} />
    );

    const loginLink = getByText("Sign In");
    fireEvent.press(loginLink);

    expect(onNavigateToLogin).toHaveBeenCalled();
  });

  it("displays email validation error for invalid email", async () => {
    const { getByLabelText, getByText, getByRole } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmInput, "password123");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    const registerButton = getByRole("button", { name: /Create Account/i });
    fireEvent.press(registerButton);

    await waitForAsync();
    expect(
      getByText("Please enter a valid email address")
    ).toBeTruthy();
  });

  it("displays password length error for short password", async () => {
    const { getByLabelText, getByText, getByRole } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "short");
    fireEvent.changeText(confirmInput, "short");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    const registerButton = getByRole("button", { name: /Create Account/i });
    fireEvent.press(registerButton);

    await waitForAsync();
    expect(
      getByText("Password must be at least 8 characters")
    ).toBeTruthy();
  });

  it("displays password number requirement error", async () => {
    const { getByLabelText, getByText, getByRole } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "abcdefgh");
    fireEvent.changeText(confirmInput, "abcdefgh");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    const registerButton = getByRole("button", { name: /Create Account/i });
    fireEvent.press(registerButton);

    await waitForAsync();
    expect(
      getByText("Password should contain at least one number")
    ).toBeTruthy();
  });

  it("displays password mismatch error", async () => {
    const { getByLabelText, getByText, getByRole } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmInput, "password456");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    const registerButton = getByRole("button", { name: /Create Account/i });
    fireEvent.press(registerButton);

    await waitForAsync();
    expect(getByText("Passwords do not match")).toBeTruthy();
  });

  it("displays terms acceptance error when not checked", async () => {
    const { getByLabelText, getAllByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmInput, "password123");

    // Don't accept terms - get the button (second occurrence of "Create Account")
    const createAccountButtons = getAllByText("Create Account");
    const registerButton = createAccountButtons[1]; // Second one is the button
    fireEvent.press(registerButton);

    await waitForAsync();
    expect(
      getByLabelText("You must accept the terms to continue")
    ).toBeTruthy();
  });

  it("submits form with valid data", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText, getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    fireEvent.changeText(emailInput, "newuser@example.com");
    fireEvent.changeText(passwordInput, "SecurePass123");
    fireEvent.changeText(confirmInput, "SecurePass123");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    const registerButton = getByText("Create Account");
    fireEvent.press(registerButton);

    await waitForAsync();
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining("AUTH"),
      expect.any(String)
    );
  });

  it("shows password strength indicator", async () => {
    const { getByLabelText, getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const passwordInput = getByLabelText("Password input");

    // Weak password
    fireEvent.changeText(passwordInput, "abc");
    await waitForAsync();
    expect(getByText("Weak")).toBeTruthy();

    // Fair password
    fireEvent.changeText(passwordInput, "abcdef1");
    await waitForAsync();
    expect(getByText("Fair")).toBeTruthy();

    // Strong password
    fireEvent.changeText(passwordInput, "SecurePass123");
    await waitForAsync();
    expect(getByText("Strong")).toBeTruthy();
  });

  it("shows loading state during registration", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { getByText, getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    fireEvent.changeText(emailInput, "newuser@example.com");
    fireEvent.changeText(passwordInput, "SecurePass123");
    fireEvent.changeText(confirmInput, "SecurePass123");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    const registerButton = getByText("Create Account");
    fireEvent.press(registerButton);

    await waitForAsync();
    // Button should be disabled during loading
    expect(registerButton.props.disabled).toBe(true);
  });

  it("has accessible error messages with alert role", async () => {
    const { getByLabelText, getByRole, getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    fireEvent.changeText(emailInput, "invalid");

    const passwordInput = getByLabelText("Password input");
    fireEvent.changeText(passwordInput, "password123");

    const confirmInput = getByLabelText("Confirm password input");
    fireEvent.changeText(confirmInput, "password123");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    const registerButton = getByText("Create Account");
    fireEvent.press(registerButton);

    await waitForAsync();
    const errorText = getByRole("alert");
    expect(errorText).toBeTruthy();
  });

  it("clears field errors when user starts typing", async () => {
    const { getByLabelText, getByText, queryByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    fireEvent.changeText(emailInput, "invalid");

    const passwordInput = getByLabelText("Password input");
    fireEvent.changeText(passwordInput, "password123");

    const confirmInput = getByLabelText("Confirm password input");
    fireEvent.changeText(confirmInput, "password123");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    // Trigger validation
    const registerButton = getByText("Create Account");
    fireEvent.press(registerButton);

    await waitForAsync();
    // Clear error by typing valid input
    fireEvent.changeText(emailInput, "test@example.com");

    await waitForAsync();
    // Error should be cleared
    expect(queryByText("Please enter a valid email address")).toBeNull();
  });

  it("has proper accessibility labels on all inputs", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    expect(getByLabelText("Email address input")).toBeTruthy();
    expect(getByLabelText("Password input")).toBeTruthy();
    expect(getByLabelText("Confirm password input")).toBeTruthy();
  });

  it("has proper accessibility hints on inputs", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    expect(emailInput.props.accessibilityHint).toBe("Enter your email address");
    expect(passwordInput.props.accessibilityHint).toBe(
      "Enter your password, minimum 8 characters"
    );
    expect(confirmInput.props.accessibilityHint).toBe(
      "Re-enter your password to confirm"
    );
  });

  it("uses email-address keyboard type for email input", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    expect(emailInput.props.keyboardType).toBe("email-address");
  });

  it("uses secureTextEntry for password inputs", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    expect(passwordInput.props.secureTextEntry).toBe(true);
    expect(confirmInput.props.secureTextEntry).toBe(true);
  });

  it("has minimum 48px height for inputs", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");

    expect(emailInput.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ minHeight: 48 }),
      ])
    );
  });

  it("has checkbox with proper accessibility state", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const checkbox = getByLabelText("Accept terms and conditions");
    expect(checkbox.props.accessibilityRole).toBe("checkbox");
    expect(checkbox.props.accessibilityState).toEqual({ checked: false });
  });

  it("toggles checkbox when pressed", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const checkbox = getByLabelText("Accept terms and conditions");

    // Initial state
    expect(checkbox.props.accessibilityState.checked).toBe(false);

    // Press to check
    fireEvent.press(checkbox);
    expect(checkbox.props.accessibilityState.checked).toBe(true);

    // Press to uncheck
    fireEvent.press(checkbox);
    expect(checkbox.props.accessibilityState.checked).toBe(false);
  });

  it("displays duplicate email error", async () => {
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

    const { getByLabelText, getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");
    const confirmInput = getByLabelText("Confirm password input");

    fireEvent.changeText(emailInput, "existing@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.changeText(confirmInput, "password123");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    const registerButton = getByText("Create Account");
    fireEvent.press(registerButton);

    await waitForAsync();
    expect(getByText("This email is already registered")).toBeTruthy();
  });

  it("has proper touch target for register button", () => {
    const { getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const registerButton = getByText("Create Account");

    expect(registerButton.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ minHeight: 48 }),
      ])
    );
  });

  it("auto-capitalizes none for email input", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    expect(emailInput.props.autoCapitalize).toBe("none");
  });

  it("disables auto-correct for email input", () => {
    const { getByLabelText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    expect(emailInput.props.autoCorrect).toBe(false);
  });

  it("renders support text", () => {
    const { getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    expect(
      getByText(/Create your account to start tracking/i)
    ).toBeTruthy();
  });

  it("renders title", () => {
    const { getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    expect(getByText(/Create Account/)).toBeTruthy();
  });

  it("has terms link with proper styling", () => {
    const { getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    expect(getByText("Terms of Service")).toBeTruthy();
    expect(getByText("Privacy Policy")).toBeTruthy();
  });

  it("validates confirm password is required", async () => {
    const { getByLabelText, getByText } = renderWithAuthProvider(
      <RegisterScreen onNavigateToLogin={jest.fn()} />
    );

    const emailInput = getByLabelText("Email address input");
    const passwordInput = getByLabelText("Password input");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");

    // Accept terms
    const checkbox = getByLabelText("Accept terms and conditions");
    fireEvent.press(checkbox);

    const registerButton = getByText("Create Account");
    fireEvent.press(registerButton);

    await waitForAsync();
    expect(getByText("Please confirm your password")).toBeTruthy();
  });
});
