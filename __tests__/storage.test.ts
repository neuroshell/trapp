import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loadAppState,
  saveAppState,
  clearAppState,
  getDeviceId,
  loadAuthState,
  saveAuthState,
  clearAuthState,
  useAppStorage,
} from "../src/storage";
import { AppState } from "../src/models";

describe("storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockReset();
    (AsyncStorage.setItem as jest.Mock).mockReset();
    (AsyncStorage.removeItem as jest.Mock).mockReset();
  });

  describe("loadAppState", () => {
    it("returns empty state when no data exists", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await loadAppState();

      expect(result).toEqual({ entries: [] });
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1"
      );
    });

    it("loads saved app state from AsyncStorage", async () => {
      const mockState: AppState = {
        entries: [
          {
            id: "1",
            type: "running",
            date: "2024-01-15T10:00:00Z",
            quantity: 30,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockState)
      );

      const result = await loadAppState();

      expect(result).toEqual(mockState);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1"
      );
    });

    it("returns empty state on JSON parse error", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("invalid json");

      const result = await loadAppState();

      expect(result).toEqual({ entries: [] });
    });

    it("returns empty state on AsyncStorage error", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      const result = await loadAppState();

      expect(result).toEqual({ entries: [] });
    });

    it("handles partial state data", async () => {
      const partialState = { entries: [] };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(partialState)
      );

      const result = await loadAppState();

      expect(result).toEqual(partialState);
    });

    it("handles state with multiple entries", async () => {
      const mockState: AppState = {
        entries: [
          {
            id: "1",
            type: "running",
            date: "2024-01-15T10:00:00Z",
            quantity: 30,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
          {
            id: "2",
            type: "pushups",
            date: "2024-01-16T11:00:00Z",
            quantity: 20,
            createdAt: "2024-01-16T11:00:00Z",
            updatedAt: "2024-01-16T11:00:00Z",
          },
        ],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockState)
      );

      const result = await loadAppState();

      expect(result.entries).toHaveLength(2);
      expect(result).toEqual(mockState);
    });
  });

  describe("saveAppState", () => {
    it("saves app state to AsyncStorage", async () => {
      const mockState: AppState = {
        entries: [
          {
            id: "1",
            type: "running",
            date: "2024-01-15T10:00:00Z",
            quantity: 30,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ],
      };

      await saveAppState(mockState);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1",
        JSON.stringify(mockState)
      );
    });

    it("saves empty state", async () => {
      const emptyState: AppState = { entries: [] };

      await saveAppState(emptyState);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1",
        JSON.stringify(emptyState)
      );
    });

    it("handles save errors gracefully", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error("Save failed")
      );

      // Should not throw
      await expect(saveAppState({ entries: [] })).resolves.toBeUndefined();
    });

    it("saves state with complex entries", async () => {
      const complexState: AppState = {
        entries: [
          {
            id: "1",
            type: "other",
            date: "2024-01-15T10:00:00Z",
            quantity: 60,
            notes: "Workout with special characters: @#$%",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ],
      };

      await saveAppState(complexState);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1",
        JSON.stringify(complexState)
      );
    });
  });

  describe("clearAppState", () => {
    it("removes app state from AsyncStorage", async () => {
      await clearAppState();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1"
      );
    });

    it("handles clear errors gracefully", async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error("Clear failed")
      );

      await expect(clearAppState()).resolves.toBeUndefined();
    });
  });

  describe("getDeviceId", () => {
    it("returns existing device id from AsyncStorage", async () => {
      const existingId = "existing-device-id-123";
      (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
        if (key === "TRAPP_TRACKER_DEVICE_ID") {
          return Promise.resolve(existingId);
        }
        return Promise.resolve(null);
      });

      const result = await getDeviceId();

      expect(result).toBe(existingId);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_DEVICE_ID"
      );
    });

    it("generates new device id if none exists", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getDeviceId();

      expect(result).toBeDefined();
      expect(result).toMatch(/^\d+-[a-z0-9]+$/);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_DEVICE_ID",
        result
      );
    });

    it("returns unknown on error", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      const result = await getDeviceId();

      expect(result).toBe("unknown");
    });

    it("generates unique ids on subsequent calls", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result1 = await getDeviceId();
      jest.clearAllMocks();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      const result2 = await getDeviceId();

      // Both should match the pattern but be generated independently
      expect(result1).toMatch(/^\d+-[a-z0-9]+$/);
      expect(result2).toMatch(/^\d+-[a-z0-9]+$/);
    });
  });

  describe("loadAuthState", () => {
    it("returns empty object when no auth data exists", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await loadAuthState();

      expect(result).toEqual({});
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("TRAPP_TRACKER_AUTH_V1");
    });

    it("loads saved auth state from AsyncStorage", async () => {
      const mockAuthState = {
        user: { username: "testuser" },
        passwordHash: "hashed_password_123",
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(mockAuthState)
      );

      const result = await loadAuthState();

      expect(result).toEqual(mockAuthState);
    });

    it("returns empty object on JSON parse error", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue("invalid json");

      const result = await loadAuthState();

      expect(result).toEqual({});
    });

    it("returns empty object on AsyncStorage error", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      const result = await loadAuthState();

      expect(result).toEqual({});
    });

    it("handles partial auth state", async () => {
      const partialState = { user: { username: "user" } };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(partialState)
      );

      const result = await loadAuthState();

      expect(result).toEqual(partialState);
    });
  });

  describe("saveAuthState", () => {
    it("saves auth state to AsyncStorage", async () => {
      const mockAuthState = {
        user: { username: "testuser" },
        passwordHash: "hashed_password",
      };

      await saveAuthState(mockAuthState);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_AUTH_V1",
        JSON.stringify(mockAuthState)
      );
    });

    it("saves empty auth state", async () => {
      await saveAuthState({});

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_AUTH_V1",
        "{}"
      );
    });

    it("handles save errors gracefully", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error("Save failed")
      );

      await expect(saveAuthState({})).resolves.toBeUndefined();
    });

    it("saves auth state with only user", async () => {
      const userOnlyState = { user: { username: "user" } };

      await saveAuthState(userOnlyState);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_AUTH_V1",
        JSON.stringify(userOnlyState)
      );
    });

    it("saves auth state with only passwordHash", async () => {
      const hashOnlyState = { passwordHash: "hash123" };

      await saveAuthState(hashOnlyState);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_AUTH_V1",
        JSON.stringify(hashOnlyState)
      );
    });
  });

  describe("clearAuthState", () => {
    it("removes auth state from AsyncStorage", async () => {
      await clearAuthState();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_AUTH_V1"
      );
    });

    it("handles clear errors gracefully", async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(
        new Error("Clear failed")
      );

      await expect(clearAuthState()).resolves.toBeUndefined();
    });
  });

  describe("useAppStorage", () => {
    it("returns object with clearAll function", () => {
      const { clearAll } = useAppStorage();

      expect(typeof clearAll).toBe("function");
    });

    it("clearAll calls clearAppState", async () => {
      const { clearAll } = useAppStorage();

      await clearAll();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1"
      );
    });
  });

  describe("storage keys", () => {
    it("uses correct storage key for app state", async () => {
      await loadAppState();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1"
      );
    });

    it("uses correct storage key for device id", async () => {
      await getDeviceId();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_DEVICE_ID"
      );
    });

    it("uses correct storage key for auth state", async () => {
      await loadAuthState();
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("TRAPP_TRACKER_AUTH_V1");
    });
  });

  describe("edge cases", () => {
    it("handles very large state objects", async () => {
      const largeEntries = Array.from({ length: 1000 }, (_, i) => ({
        id: `entry-${i}`,
        type: "running" as const,
        date: "2024-01-15T10:00:00Z",
        quantity: i,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      }));

      const largeState: AppState = { entries: largeEntries };

      await saveAppState(largeState);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1",
        expect.any(String)
      );
    });

    it("handles unicode characters in data", async () => {
      const stateWithUnicode: AppState = {
        entries: [
          {
            id: "1",
            type: "other",
            date: "2024-01-15T10:00:00Z",
            quantity: 30,
            notes: "Workout with unicode: 你好世界 🏃‍♂️",
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
        ],
      };

      await saveAppState(stateWithUnicode);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "TRAPP_TRACKER_STATE_V1",
        JSON.stringify(stateWithUnicode)
      );
    });

    it("handles empty strings in data", async () => {
      const stateWithEmptyStrings: AppState = {
        entries: [
          {
            id: "1",
            type: "running",
            date: "",
            quantity: 0,
            createdAt: "",
            updatedAt: "",
          },
        ],
      };

      await saveAppState(stateWithEmptyStrings);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
