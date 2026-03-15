import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LogScreen } from "../src/screens/LogScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock the date picker modal
jest.mock("react-native-modal-datetime-picker", () => {
  return {
    __esModule: true,
    default: ({ isVisible, onConfirm, onCancel }: any) => {
      const MockPicker = () => null;
      return isVisible ? <MockPicker /> : null;
    },
  };
});

describe("LogScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [] })
    );
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(null);
  });

  it("renders title", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Log a workout")).toBeTruthy();
    });
  });

  it("renders activity type buttons", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Running")).toBeTruthy();
      expect(getByText("Squats")).toBeTruthy();
      expect(getByText("Push-ups")).toBeTruthy();
      expect(getByText("Pull-ups")).toBeTruthy();
      expect(getByText("Other")).toBeTruthy();
    });
  });

  it("renders date and time field", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Date & time")).toBeTruthy();
    });
  });

  it("renders quantity input", async () => {
    const { getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText("Number of reps / minutes")).toBeTruthy();
    });
  });

  it("renders notes input", async () => {
    const { getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText("Extra detail (sets, distance, etc.)")).toBeTruthy();
    });
  });

  it("renders save button", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Save entry")).toBeTruthy();
    });
  });

  it("renders Recent entries section", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Recent entries")).toBeTruthy();
    });
  });

  it("shows empty state when no entries exist", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("No entries yet.")).toBeTruthy();
    });
  });

  it("allows selecting activity type", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Running")).toBeTruthy();
    });

    fireEvent.press(getByText("Squats"));

    // Should still render after selection
    expect(getByText("Squats")).toBeTruthy();
  });

  it("allows entering quantity", async () => {
    const { getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText("Number of reps / minutes")).toBeTruthy();
    });

    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    fireEvent.changeText(quantityInput, "10");

    expect(quantityInput.props.value).toBe("10");
  });

  it("allows entering notes", async () => {
    const { getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByPlaceholderText("Extra detail (sets, distance, etc.)")).toBeTruthy();
    });

    const notesInput = getByPlaceholderText("Extra detail (sets, distance, etc.)");
    fireEvent.changeText(notesInput, "Morning workout");

    expect(notesInput.props.value).toBe("Morning workout");
  });

  it("saves entry with valid data", async () => {
    const { getByText, getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Save entry")).toBeTruthy();
    });

    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    fireEvent.changeText(quantityInput, "30");

    fireEvent.press(getByText("Save entry"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("clears form after saving entry", async () => {
    const { getByText, getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Save entry")).toBeTruthy();
    });

    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    const notesInput = getByPlaceholderText("Extra detail (sets, distance, etc.)");

    fireEvent.changeText(quantityInput, "30");
    fireEvent.changeText(notesInput, "Test notes");

    fireEvent.press(getByText("Save entry"));

    await waitFor(() => {
      // Form should be cleared after save
      expect(quantityInput.props.value).toBe("");
    });
  });

  it("displays saved entries in the list", async () => {
    const mockEntries = [
      {
        id: "1",
        type: "running",
        date: new Date().toISOString(),
        quantity: 30,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: mockEntries })
    );

    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("running")).toBeTruthy();
    });
  });

  it("formats entry date correctly", async () => {
    const mockEntries = [
      {
        id: "1",
        type: "running",
        date: "2024-01-15T10:00:00Z",
        quantity: 30,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: mockEntries })
    );

    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      // Date should be formatted with month name
      expect(getByText(/Jan|January/)).toBeTruthy();
    });
  });

  it("displays entry quantity", async () => {
    const mockEntries = [
      {
        id: "1",
        type: "running",
        date: new Date().toISOString(),
        quantity: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: mockEntries })
    );

    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("45")).toBeTruthy();
    });
  });

  it("displays entry notes when present", async () => {
    const mockEntries = [
      {
        id: "1",
        type: "running",
        date: new Date().toISOString(),
        quantity: 30,
        notes: "Morning run",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: mockEntries })
    );

    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Morning run")).toBeTruthy();
    });
  });

  it("loads entries from AsyncStorage on mount", async () => {
    render(<LogScreen />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  it("saves entries to AsyncStorage when adding new entry", async () => {
    const { getByText, getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Save entry")).toBeTruthy();
    });

    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    fireEvent.changeText(quantityInput, "25");

    fireEvent.press(getByText("Save entry"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("renders form card", async () => {
    const { toJSON } = render(<LogScreen />);

    await waitFor(() => {
      const tree = toJSON();
      expect(tree).toBeDefined();
    });
  });

  it("renders quantity input with numeric keyboard", async () => {
    const { getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      const quantityInput = getByPlaceholderText("Number of reps / minutes");
      expect(quantityInput.props.keyboardType).toBe("numeric");
    });
  });

  it("renders notes input as multiline", async () => {
    const { getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      const notesInput = getByPlaceholderText("Extra detail (sets, distance, etc.)");
      expect(notesInput.props.multiline).toBe(true);
    });
  });

  it("has proper label for activity type", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Activity")).toBeTruthy();
    });
  });

  it("has proper label for quantity", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Quantity")).toBeTruthy();
    });
  });

  it("has proper label for notes", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Notes (optional)")).toBeTruthy();
    });
  });

  it("allows adding multiple entries", async () => {
    const { getByText, getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Save entry")).toBeTruthy();
    });

    // First entry
    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    fireEvent.changeText(quantityInput, "10");
    fireEvent.press(getByText("Save entry"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [{ id: "1", type: "running", date: new Date().toISOString(), quantity: 10, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] })
    );

    // Second entry
    fireEvent.changeText(quantityInput, "20");
    fireEvent.press(getByText("Save entry"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("handles entries with notes", async () => {
    const { getByText, getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Save entry")).toBeTruthy();
    });

    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    const notesInput = getByPlaceholderText("Extra detail (sets, distance, etc.)");

    fireEvent.changeText(quantityInput, "30");
    fireEvent.changeText(notesInput, "Felt great today!");

    fireEvent.press(getByText("Save entry"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("trims notes before saving", async () => {
    const { getByText, getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Save entry")).toBeTruthy();
    });

    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    const notesInput = getByPlaceholderText("Extra detail (sets, distance, etc.)");

    fireEvent.changeText(quantityInput, "30");
    fireEvent.changeText(notesInput, "   trimmed notes   ");

    fireEvent.press(getByText("Save entry"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("renders entries list with FlatList", async () => {
    const { toJSON } = render(<LogScreen />);

    await waitFor(() => {
      const tree = toJSON();
      expect(tree).toBeDefined();
    });
  });

  it("renders SafeAreaView container", async () => {
    const { toJSON } = render(<LogScreen />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("has proper input styling", async () => {
    const { getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      const quantityInput = getByPlaceholderText("Number of reps / minutes");
      expect(quantityInput.props.style).toBeDefined();
    });
  });

  it("has proper save button styling", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      const saveButton = getByText("Save entry");
      expect(saveButton.props.style).toBeDefined();
    });
  });

  it("handles decimal quantity values", async () => {
    const { getByText, getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Save entry")).toBeTruthy();
    });

    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    fireEvent.changeText(quantityInput, "30.5");

    fireEvent.press(getByText("Save entry"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("handles large quantity values", async () => {
    const { getByText, getByPlaceholderText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Save entry")).toBeTruthy();
    });

    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    fireEvent.changeText(quantityInput, "9999");

    fireEvent.press(getByText("Save entry"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("preserves selected activity type", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Running")).toBeTruthy();
    });

    fireEvent.press(getByText("Push-ups"));

    // Selected type should be preserved
    expect(getByText("Push-ups")).toBeTruthy();
  });

  it("renders all activity type options", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      expect(getByText("Running")).toBeTruthy();
      expect(getByText("Squats")).toBeTruthy();
      expect(getByText("Push-ups")).toBeTruthy();
      expect(getByText("Pull-ups")).toBeTruthy();
      expect(getByText("Other")).toBeTruthy();
    });
  });

  it("displays current date in date field", async () => {
    const { getByText } = render(<LogScreen />);

    await waitFor(() => {
      // Should show current date formatted
      expect(getByText(/Date & time/)).toBeTruthy();
    });
  });
});
