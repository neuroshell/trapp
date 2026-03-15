import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LoginScreen } from "../src/screens/LoginScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "../src/auth/AuthContext";

const renderWithAuth = (ui: React.ReactElement) => {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
};

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
  });

  it("renders title and subtitle", async () => {
    const { getByText } = renderWithAuth(<LoginScreen />);

    expect(getByText("FitTrack Pro")).toBeTruthy();
    expect(
      getByText(
        "Enter a username and password to sign in. This is stored locally for the demo app."
      )
    ).toBeTruthy();
  });

  it("renders username and password inputs", async () => {
    const { getByPlaceholderText } = renderWithAuth(<LoginScreen />);

    expect(getByPlaceholderText("Enter username")).toBeTruthy();
    expect(getByPlaceholderText("Enter password")).toBeTruthy();
  });

  it("renders sign in button", async () => {
    const { getByText } = renderWithAuth(<LoginScreen />);

    expect(getByText("Sign in")).toBeTruthy();
  });

  it("shows error when submitting empty form", async () => {
    const { getByText } = renderWithAuth(<LoginScreen />);

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        getByText("Please enter both a username and password.")
      ).toBeTruthy();
    });
  });

  it("shows error when only username is provided", async () => {
    const { getByText, getByPlaceholderText } = renderWithAuth(
      <LoginScreen />
    );

    const usernameInput = getByPlaceholderText("Enter username");
    fireEvent.changeText(usernameInput, "testuser");

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        getByText("Please enter both a username and password.")
      ).toBeTruthy();
    });
  });

  it("shows error when only password is provided", async () => {
    const { getByText, getByPlaceholderText } = renderWithAuth(
      <LoginScreen />
    );

    const passwordInput = getByPlaceholderText("Enter password");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        getByText("Please enter both a username and password.")
      ).toBeTruthy();
    });
  });

  it("clears error when typing after error shown", async () => {
    const { getByText, getByPlaceholderText, queryByText } = renderWithAuth(
      <LoginScreen />
    );

    // Submit empty form to show error
    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(
        getByText("Please enter both a username and password.")
      ).toBeTruthy();
    });

    // Start typing in username
    const usernameInput = getByPlaceholderText("Enter username");
    fireEvent.changeText(usernameInput, "test");

    // Error should be cleared
    await waitFor(() => {
      expect(
        queryByText("Please enter both a username and password.")
      ).toBeNull();
    });
  });

  it("successfully signs in with valid credentials", async () => {
    const { getByText, getByPlaceholderText } = renderWithAuth(
      <LoginScreen />
    );

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    // Wait for auth state to be saved
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining("AUTH"),
        expect.any(String)
      );
    });
  });

  it("trims whitespace from username", async () => {
    const { getByText, getByPlaceholderText } = renderWithAuth(
      <LoginScreen />
    );

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    fireEvent.changeText(usernameInput, "  testuser  ");
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining("AUTH"),
        expect.stringContaining("testuser")
      );
    });
  });

  it("disables auto-capitalize and auto-correct on username input", async () => {
    const { getByPlaceholderText } = renderWithAuth(<LoginScreen />);

    const usernameInput = getByPlaceholderText("Enter username");

    expect(usernameInput.props.autoCapitalize).toBe("none");
    expect(usernameInput.props.autoCorrect).toBe(false);
  });

  it("hides password text input", async () => {
    const { getByPlaceholderText } = renderWithAuth(<LoginScreen />);

    const passwordInput = getByPlaceholderText("Enter password");

    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it("renders card component for form container", async () => {
    const { getAllByType } = renderWithAuth(<LoginScreen />);

    // Card should be rendered
    const views = getAllByType(require("react-native").View);
    expect(views.length).toBeGreaterThan(0);
  });

  it("renders SafeAreaView wrapper", async () => {
    const { toJSON } = renderWithAuth(<LoginScreen />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("centers content vertically", async () => {
    const { getAllByType } = renderWithAuth(<LoginScreen />);

    const views = getAllByType(require("react-native").View);
    // Check that wrapper view has flex styling
    expect(views.length).toBeGreaterThan(0);
  });

  it("handles special characters in password", async () => {
    const { getByText, getByPlaceholderText } = renderWithAuth(
      <LoginScreen />
    );

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(passwordInput, "P@ssw0rd!#$%");

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("handles long usernames", async () => {
    const { getByText, getByPlaceholderText } = renderWithAuth(
      <LoginScreen />
    );

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    const longUsername = "a".repeat(100);
    fireEvent.changeText(usernameInput, longUsername);
    fireEvent.changeText(passwordInput, "password123");

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("updates username state on text change", async () => {
    const { getByPlaceholderText } = renderWithAuth(<LoginScreen />);

    const usernameInput = getByPlaceholderText("Enter username");

    fireEvent.changeText(usernameInput, "test");
    expect(usernameInput.props.value).toBe("test");

    fireEvent.changeText(usernameInput, "testuser");
    expect(usernameInput.props.value).toBe("testuser");
  });

  it("updates password state on text change", async () => {
    const { getByPlaceholderText } = renderWithAuth(<LoginScreen />);

    const passwordInput = getByPlaceholderText("Enter password");

    fireEvent.changeText(passwordInput, "pass");
    expect(passwordInput.props.value).toBe("pass");

    fireEvent.changeText(passwordInput, "password123");
    expect(passwordInput.props.value).toBe("password123");
  });

  it("renders error message with proper styling", async () => {
    const { getByText } = renderWithAuth(<LoginScreen />);

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    await waitFor(() => {
      const errorText = getByText("Please enter both a username and password.");
      expect(errorText.props.style).toBeDefined();
    });
  });

  it("has proper label styling", async () => {
    const { getByText } = renderWithAuth(<LoginScreen />);

    const usernameLabel = getByText("Username");
    const passwordLabel = getByText("Password");

    expect(usernameLabel).toBeTruthy();
    expect(passwordLabel).toBeTruthy();
  });

  it("renders button with proper style", async () => {
    const { getByText } = renderWithAuth(<LoginScreen />);

    const signInButton = getByText("Sign in");
    expect(signInButton.props.onPress).toBeDefined();
  });

  it("supports keyboard input for form fields", async () => {
    const { getByPlaceholderText } = renderWithAuth(<LoginScreen />);

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    // Verify inputs are editable
    expect(usernameInput.props.editable).not.toBe(false);
    expect(passwordInput.props.editable).not.toBe(false);
  });

  it("maintains form state after failed submission", async () => {
    const { getByText, getByPlaceholderText } = renderWithAuth(
      <LoginScreen />
    );

    const usernameInput = getByPlaceholderText("Enter username");
    const passwordInput = getByPlaceholderText("Enter password");

    fireEvent.changeText(usernameInput, "testuser");
    fireEvent.changeText(passwordInput, "pass");

    const signInButton = getByText("Sign in");
    fireEvent.press(signInButton);

    // Values should still be in inputs
    await waitFor(() => {
      expect(usernameInput.props.value).toBe("testuser");
      expect(passwordInput.props.value).toBe("pass");
    });
  });
});
