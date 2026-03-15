import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { SettingsScreen } from "../src/screens/SettingsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider } from "../src/auth/AuthContext";

// Mock Alert and Share
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.Alert = {
    alert: jest.fn((title, message, buttons) => {
      if (buttons) {
        // Call cancel callback by default
        buttons[0]?.onPress?.();
      }
    }),
  };
  RN.Share = {
    share: jest.fn(() => Promise.resolve()),
  };
  return RN;
});

// Mock fetch for sync tests
global.fetch = jest.fn();

const renderWithAuth = (ui: React.ReactElement, authState = {}) => {
  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  );
};

describe("SettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [] }),
    );
    (fetch as jest.Mock).mockClear();
  });

  it("renders settings title and sections", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Settings")).toBeTruthy();
    });

    expect(getByText("Account")).toBeTruthy();
    expect(getByText("Data")).toBeTruthy();
    expect(getByText("About")).toBeTruthy();
  });

  it("shows not signed in message when no user", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Settings")).toBeTruthy();
    });

    expect(getByText("Not signed in.")).toBeTruthy();
  });

  it("shows signed in user when authenticated", async () => {
    // Mock auth state in AsyncStorage
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "abc123",
          })
        );
      }
      return Promise.resolve(JSON.stringify({ entries: [] }));
    });

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Signed in as testuser")).toBeTruthy();
    });

    expect(getByText("Sign out")).toBeTruthy();
  });

  it("shows reset data link", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Settings")).toBeTruthy();
    });

    expect(getByText("Reset data")).toBeTruthy();
  });

  it("shows export data link", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Settings")).toBeTruthy();
    });

    expect(getByText("Export data")).toBeTruthy();
  });

  it("shows sync to server link", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Settings")).toBeTruthy();
    });

    expect(getByText("Sync to server")).toBeTruthy();
  });

  it("shows download remote data link", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Settings")).toBeTruthy();
    });

    expect(getByText("Download remote data")).toBeTruthy();
  });

  it("shows version link", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Settings")).toBeTruthy();
    });

    expect(getByText("Version 1.0.0")).toBeTruthy();
  });

  it("shows alert when resetting data and confirms", async () => {
    const mockAlert = require("react-native").Alert.alert;
    mockAlert.mockImplementation((title, message, buttons) => {
      if (buttons && buttons[1]) {
        // Call reset callback
        buttons[1].onPress();
      }
    });

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Reset data")).toBeTruthy();
    });

    const resetLink = getByText("Reset data");
    fireEvent.press(resetLink);

    // Alert should be called
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Reset data",
        expect.stringContaining("delete all logged entries"),
        expect.any(Array)
      );
    });
  });

  it("exports data when pressing export link", async () => {
    const mockShare = require("react-native").Share.share;
    mockShare.mockResolvedValue({});

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Export data")).toBeTruthy();
    });

    const exportLink = getByText("Export data");
    fireEvent.press(exportLink);

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: "FitTrack export",
        message: expect.any(String),
      });
    });
  });

  it("shows error alert when export fails", async () => {
    const mockShare = require("react-native").Share.share;
    mockShare.mockRejectedValue(new Error("Share failed"));

    const mockAlert = require("react-native").Alert.alert;

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Export data")).toBeTruthy();
    });

    const exportLink = getByText("Export data");
    fireEvent.press(exportLink);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Export failed",
        "Unable to share data."
      );
    });
  });

  it("shows sign in required alert when syncing without auth", async () => {
    const mockAlert = require("react-native").Alert.alert;

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Sync to server")).toBeTruthy();
    });

    const syncLink = getByText("Sync to server");
    fireEvent.press(syncLink);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Sign in required",
        "Please sign in before syncing.",
        expect.any(Array)
      );
    });
  });

  it("shows sign in required alert when fetching without auth", async () => {
    const mockAlert = require("react-native").Alert.alert;

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Download remote data")).toBeTruthy();
    });

    const fetchLink = getByText("Download remote data");
    fireEvent.press(fetchLink);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Sign in required",
        "Please sign in before fetching remote data.",
        expect.any(Array)
      );
    });
  });

  it("syncs data to server when authenticated", async () => {
    // Mock auth state
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "abc123",
          })
        );
      }
      return Promise.resolve(JSON.stringify({ entries: [] }));
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Signed in as testuser")).toBeTruthy();
    });

    const syncLink = getByText("Sync to server");
    fireEvent.press(syncLink);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/sync"),
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );
    });
  });

  it("shows sync error when server returns error", async () => {
    // Mock auth state
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "abc123",
          })
        );
      }
      return Promise.resolve(JSON.stringify({ entries: [] }));
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    const mockAlert = require("react-native").Alert.alert;

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Signed in as testuser")).toBeTruthy();
    });

    const syncLink = getByText("Sync to server");
    fireEvent.press(syncLink);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Sync failed",
        expect.stringContaining("Server error")
      );
    });
  });

  it("fetches remote data when authenticated", async () => {
    // Mock auth state
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "abc123",
          })
        );
      }
      return Promise.resolve(JSON.stringify({ entries: [] }));
    });

    const mockPayload = {
      entries: [
        {
          id: "1",
          type: "running",
          date: new Date().toISOString(),
          quantity: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ device: { payload: mockPayload } }),
    });

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Signed in as testuser")).toBeTruthy();
    });

    const fetchLink = getByText("Download remote data");
    fireEvent.press(fetchLink);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/sync?deviceId="),
        expect.any(Object)
      );
    });
  });

  it("shows no data alert when fetching returns empty", async () => {
    // Mock auth state
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "abc123",
          })
        );
      }
      return Promise.resolve(JSON.stringify({ entries: [] }));
    });

    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const mockAlert = require("react-native").Alert.alert;

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Signed in as testuser")).toBeTruthy();
    });

    const fetchLink = getByText("Download remote data");
    fireEvent.press(fetchLink);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "No data",
        "No data found for this device."
      );
    });
  });

  it("shows version alert when pressing version link", async () => {
    const mockAlert = require("react-native").Alert.alert;

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Version 1.0.0")).toBeTruthy();
    });

    const versionLink = getByText("Version 1.0.0");
    fireEvent.press(versionLink);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith("Version", "1.0.0");
    });
  });

  it("displays sync status during sync operation", async () => {
    // Mock auth state
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key.includes("AUTH")) {
        return Promise.resolve(
          JSON.stringify({
            user: { username: "testuser" },
            passwordHash: "abc123",
          })
        );
      }
      return Promise.resolve(JSON.stringify({ entries: [] }));
    });

    // Mock fetch to take some time
    (fetch as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }, 100);
      });
    });

    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Signed in as testuser")).toBeTruthy();
    });

    const syncLink = getByText("Sync to server");
    fireEvent.press(syncLink);

    // Should show syncing status
    await waitFor(() => {
      expect(getByText("Syncing...")).toBeTruthy();
    }, { timeout: 5000 });
  });

  it("loads app state from AsyncStorage on mount", async () => {
    renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  it("renders account card with proper content", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Account")).toBeTruthy();
    });

    expect(getByText("Not signed in.")).toBeTruthy();
  });

  it("renders data card with all data actions", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Data")).toBeTruthy();
    });

    expect(
      getByText("Reset all logged activities and start fresh.")
    ).toBeTruthy();
    expect(getByText("Reset data")).toBeTruthy();
    expect(getByText("Export data")).toBeTruthy();
    expect(getByText("Sync to server")).toBeTruthy();
    expect(getByText("Download remote data")).toBeTruthy();
  });

  it("renders about card with description", async () => {
    const { getByText } = renderWithAuth(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("About")).toBeTruthy();
    });

    expect(
      getByText("A simple workout logger built with Expo + React Native.")
    ).toBeTruthy();
  });
});
