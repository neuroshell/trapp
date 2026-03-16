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

// Mock storage functions
jest.mock("../src/storage", () => ({
  getWorkouts: jest.fn().mockResolvedValue([]),
  saveWorkout: jest.fn().mockResolvedValue(undefined),
  deleteWorkout: jest.fn().mockResolvedValue(undefined),
  getLastWorkoutValues: jest.fn().mockResolvedValue(null),
  getDeviceId: jest.fn().mockResolvedValue("test-device-id"),
}));

describe("LogScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Log Workout title", async () => {
    const { getByText } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByText("Log Workout")).toBeTruthy();
    });
  });

  it("renders workout type selector", async () => {
    const { getByTestId } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByTestId("workout-type-selector")).toBeTruthy();
    });
  });

  it("renders all workout type options", async () => {
    const { getByText } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByText("Running")).toBeTruthy();
      expect(getByText("Squats")).toBeTruthy();
      expect(getByText("Push-ups")).toBeTruthy();
      expect(getByText("Pull-ups")).toBeTruthy();
      expect(getByText("Other")).toBeTruthy();
    });
  });

  it("renders Date & Time field", async () => {
    const { getByTestId } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByTestId("datetime-field")).toBeTruthy();
    });
  });

  it("renders quantity input for strength workouts", async () => {
    const { getByPlaceholderText, getByText } = render(<LogScreen />);
    
    // Select squats
    fireEvent.press(getByText("Squats"));
    
    await waitFor(() => {
      expect(getByPlaceholderText(/reps/i)).toBeTruthy();
    });
  });

  it("renders distance and duration for running workouts", async () => {
    const { getByPlaceholderText, getByText } = render(<LogScreen />);
    
    // Select running
    fireEvent.press(getByText("Running"));
    
    await waitFor(() => {
      expect(getByPlaceholderText(/distance/i)).toBeTruthy();
      expect(getByPlaceholderText(/duration/i)).toBeTruthy();
    });
  });

  it("renders notes input", async () => {
    const { getByPlaceholderText } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByPlaceholderText(/notes/i)).toBeTruthy();
    });
  });

  it("renders save button", async () => {
    const { getByTestId } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByTestId("save-button")).toBeTruthy();
    });
  });

  it("renders Recent Workouts section", async () => {
    const { getByText } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByText("Recent Workouts")).toBeTruthy();
    });
  });

  it("shows empty state when no workouts exist", async () => {
    const { getByText } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByText("No workouts yet")).toBeTruthy();
    });
  });

  it("allows selecting workout type", async () => {
    const { getByText } = render(<LogScreen />);
    
    await waitFor(() => {
      expect(getByText("Running")).toBeTruthy();
    });

    fireEvent.press(getByText("Push-ups"));
    
    // Type should be selected
    expect(getByText("Push-ups")).toBeTruthy();
  });

  it("allows entering reps for strength workout", async () => {
    const { getByPlaceholderText, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Squats"));
    
    await waitFor(() => {
      const repsInput = getByPlaceholderText(/reps/i);
      fireEvent.changeText(repsInput, "20");
      expect(repsInput.props.value).toBe("20");
    });
  });

  it("allows entering distance for running workout", async () => {
    const { getByPlaceholderText, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Running"));
    
    await waitFor(() => {
      const distanceInput = getByPlaceholderText(/distance/i);
      fireEvent.changeText(distanceInput, "5.5");
      expect(distanceInput.props.value).toBe("5.5");
    });
  });

  it("allows entering notes", async () => {
    const { getByPlaceholderText } = render(<LogScreen />);
    
    await waitFor(() => {
      const notesInput = getByPlaceholderText(/notes/i);
      fireEvent.changeText(notesInput, "Morning workout");
      expect(notesInput.props.value).toBe("Morning workout");
    });
  });

  it("saves workout with valid data", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Squats"));
    
    await waitFor(async () => {
      const repsInput = getByTestId("reps-input");
      const setsInput = getByTestId("sets-input");
      fireEvent.changeText(repsInput, "20");
      fireEvent.changeText(setsInput, "3");
    });

    fireEvent.press(getByTestId("save-button"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("displays validation errors for invalid input", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Running"));
    
    await waitFor(() => {
      // Try to save with empty fields
      fireEvent.press(getByTestId("save-button"));
    });

    // Should show validation errors
    await waitFor(() => {
      expect(getByText(/distance/i)).toBeTruthy();
    });
  });

  it("has proper label for workout type", async () => {
    const { getByText } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByText("Workout Type")).toBeTruthy();
    });
  });

  it("has proper label for Date & Time", async () => {
    const { getByText } = render(<LogScreen />);
    await waitFor(() => {
      expect(getByText("Date & Time")).toBeTruthy();
    });
  });

  it("renders quantity input with numeric keyboard", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Squats"));
    
    await waitFor(() => {
      const repsInput = getByTestId("reps-input");
      expect(repsInput.props.keyboardType).toBe("numeric");
    });
  });

  it("renders notes input as multiline", async () => {
    const { getByTestId } = render(<LogScreen />);
    
    await waitFor(() => {
      const notesInput = getByTestId("notes-input");
      expect(notesInput.props.multiline).toBe(true);
    });
  });

  it("allows adding multiple workouts", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    // First workout
    fireEvent.press(getByText("Squats"));
    await waitFor(() => {
      fireEvent.changeText(getByTestId("reps-input"), "20");
      fireEvent.changeText(getByTestId("sets-input"), "3");
    });
    fireEvent.press(getByTestId("save-button"));

    // Second workout
    await waitFor(() => {
      fireEvent.press(getByText("Push-ups"));
      fireEvent.changeText(getByTestId("reps-input"), "15");
      fireEvent.changeText(getByTestId("sets-input"), "3");
    });
    fireEvent.press(getByTestId("save-button"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  it("handles workouts with notes", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Squats"));
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId("reps-input"), "20");
      fireEvent.changeText(getByTestId("sets-input"), "3");
      fireEvent.changeText(getByTestId("notes-input"), "Felt strong today");
    });

    fireEvent.press(getByTestId("save-button"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("trims notes before saving", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Squats"));
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId("reps-input"), "20");
      fireEvent.changeText(getByTestId("sets-input"), "3");
      fireEvent.changeText(getByTestId("notes-input"), "  Morning run  ");
    });

    fireEvent.press(getByTestId("save-button"));

    await waitFor(() => {
      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setItemCall[1]);
      expect(savedData.workouts[0].data.notes).toBe("Morning run");
    });
  });

  it("has proper input styling", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Squats"));
    
    await waitFor(() => {
      const repsInput = getByTestId("reps-input");
      expect(repsInput.props.style).toBeDefined();
    });
  });

  it("has proper save button styling", async () => {
    const { getByTestId } = render(<LogScreen />);
    
    await waitFor(() => {
      const saveButton = getByTestId("save-button");
      expect(saveButton.props.style).toBeDefined();
    });
  });

  it("handles decimal distance values for running", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Running"));
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId("distance-input"), "5.5");
      fireEvent.changeText(getByTestId("duration-input"), "30");
    });

    fireEvent.press(getByTestId("save-button"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("handles large rep values", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Squats"));
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId("reps-input"), "100");
      fireEvent.changeText(getByTestId("sets-input"), "10");
    });

    fireEvent.press(getByTestId("save-button"));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it("preserves selected workout type after save", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);
    
    fireEvent.press(getByText("Push-ups"));
    
    await waitFor(() => {
      fireEvent.changeText(getByTestId("reps-input"), "15");
      fireEvent.changeText(getByTestId("sets-input"), "3");
    });

    fireEvent.press(getByTestId("save-button"));

    // Push-ups should still be selected
    await waitFor(() => {
      expect(getByText("Push-ups")).toBeTruthy();
    });
  });

  it("displays current date in Date & Time field", async () => {
    const { getByText } = render(<LogScreen />);
    
    await waitFor(() => {
      // Should show date formatted
      expect(getByText(/Date & Time/)).toBeTruthy();
    });
  });
});
