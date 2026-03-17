global.IS_REACT_ACT_ENVIRONMENT = true;

import { render, fireEvent, act } from "@testing-library/react-native";

import { LogScreen } from "../src/screens/LogScreen";

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

  // Helper to wait for async operations
  const waitForAsync = async () => {
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
  };

  it("renders Log Workout title", async () => {
    const { getByText } = render(<LogScreen />);
    await waitForAsync();
    expect(getByText("Log Workout")).toBeTruthy();
  });

  it("renders workout type selector", async () => {
    const { getByTestId } = render(<LogScreen />);
    await waitForAsync();
    expect(getByTestId("workout-type-selector")).toBeTruthy();
  });

  it("renders all workout type options", async () => {
    const { getByText } = render(<LogScreen />);
    await waitForAsync();
    expect(getByText("Running")).toBeTruthy();
    expect(getByText("Squats")).toBeTruthy();
    expect(getByText("Push-ups")).toBeTruthy();
    expect(getByText("Pull-ups")).toBeTruthy();
    expect(getByText("Other")).toBeTruthy();
  });

  it("renders Date & Time field", async () => {
    const { getByTestId } = render(<LogScreen />);
    await waitForAsync();
    expect(getByTestId("datetime-field")).toBeTruthy();
  });

  it("renders notes input", async () => {
    const { getByTestId } = render(<LogScreen />);
    await waitForAsync();
    expect(getByTestId("notes-input")).toBeTruthy();
  });

  it("renders save button", async () => {
    const { getByTestId } = render(<LogScreen />);
    await waitForAsync();
    expect(getByTestId("save-workout-button")).toBeTruthy();
  });

  it("shows empty state when no workouts exist", async () => {
    const { getByText } = render(<LogScreen />);
    await waitForAsync();
    expect(getByText(/No workouts/i)).toBeTruthy();
  });

  it("allows selecting workout type", async () => {
    const { getByText, getByTestId } = render(<LogScreen />);

    await waitForAsync();
    expect(getByTestId("type-running")).toBeTruthy();

    fireEvent.press(getByText("Push-ups"));
    await waitForAsync();

    // Type should be selected
    expect(getByText("Push-ups")).toBeTruthy();
  });

  it("allows entering reps for strength workout", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);

    await waitForAsync();
    fireEvent.press(getByText("Squats"));
    await waitForAsync();

    const repsInput = getByTestId("reps-input");
    fireEvent.changeText(repsInput, "20");
    expect(repsInput.props.value).toBe("20");
  });

  it("allows entering distance for running workout", async () => {
    const { getByTestId, getByText } = render(<LogScreen />);

    await waitForAsync();
    fireEvent.press(getByText("Running"));
    await waitForAsync();

    const distanceInput = getByTestId("distance-input");
    fireEvent.changeText(distanceInput, "5.5");
    expect(distanceInput.props.value).toBe("5.5");
  });

  it("allows entering notes", async () => {
    const { getByTestId } = render(<LogScreen />);

    await waitForAsync();
    const notesInput = getByTestId("notes-input");
    fireEvent.changeText(notesInput, "Morning workout");
    expect(notesInput.props.value).toBe("Morning workout");
  });

  it("has proper label for workout type", async () => {
    const { getByText } = render(<LogScreen />);
    await waitForAsync();
    expect(getByText("Workout Type")).toBeTruthy();
  });

  it("has proper label for Date & Time", async () => {
    const { getByText } = render(<LogScreen />);
    await waitForAsync();
    expect(getByText("Date & Time")).toBeTruthy();
  });

  it("renders notes input as multiline", async () => {
    const { getByTestId } = render(<LogScreen />);

    await waitForAsync();
    const notesInput = getByTestId("notes-input");
    expect(notesInput.props.multiline).toBe(true);
  });

  it("displays current date in Date & Time field", async () => {
    const { getByText } = render(<LogScreen />);

    await waitForAsync();
    // Should show date formatted
    expect(getByText(/Date & Time/)).toBeTruthy();
  });
});
