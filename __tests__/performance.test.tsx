import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { LogScreen } from "../src/screens/LogScreen";

// Mock storage functions
jest.mock("../src/storage", () => ({
  ...jest.requireActual("../src/storage"),
  getWorkouts: jest.fn(),
  saveWorkout: jest.fn(),
  deleteWorkout: jest.fn(),
  getLastWorkoutValues: jest.fn(),
  getDeviceId: jest.fn(),
}));

import {
  deleteWorkout,
  getDeviceId,
  getLastWorkoutValues,
  getWorkouts,
  saveWorkout,
} from "../src/storage";

const mockGetWorkouts = getWorkouts as jest.Mock;
const mockSaveWorkout = saveWorkout as jest.Mock;
const mockGetLastWorkoutValues = getLastWorkoutValues as jest.Mock;
const mockGetDeviceId = getDeviceId as jest.Mock;

describe("Performance Tests - Quick Log", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetWorkouts.mockResolvedValue([]);
    mockSaveWorkout.mockImplementation(
      () =>
        new Promise((resolve) => {
          // Simulate realistic storage write time (< 500ms)
          setTimeout(resolve, 100);
        }),
    );
    mockGetLastWorkoutValues.mockResolvedValue(null);
    mockGetDeviceId.mockResolvedValue("test-device-id");
  });

  /**
   * CRITICAL PERFORMANCE TEST
   * Success metric: Quick log must complete in under 10 seconds
   * This includes: form load + data entry + save + confirmation
   */
  it(
    "should complete quick log flow in under 10 seconds (CRITICAL)",
    async () => {
      const startTime = Date.now();

      // Render screen
      const { rerender } = render(<LogScreen />);

      // Wait for form to load
      await waitFor(() => screen.getByTestId("distance-input"), {
        timeout: 2000,
      });
      const formLoadTime = Date.now();

      // Fill form with defaults (simulating user using pre-filled values)
      const distanceInput = screen.getByTestId("distance-input");
      const durationInput = screen.getByTestId("duration-input");

      fireEvent.changeText(distanceInput, "5.0");
      fireEvent.changeText(durationInput, "30");

      const fillTime = Date.now();

      // Press save
      const saveButton = screen.getByTestId("save-workout-button");
      fireEvent.press(saveButton);

      // Wait for save to complete
      await waitFor(() => {
        expect(mockSaveWorkout).toHaveBeenCalled();
      }, { timeout: 2000 });

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      console.log(`
        Performance Metrics:
        - Form load time: ${formLoadTime - startTime}ms
        - Form fill time: ${fillTime - formLoadTime}ms
        - Save time: ${endTime - fillTime}ms
        - TOTAL TIME: ${totalTime}ms
      `);

      // CRITICAL ASSERTION: Must be under 10 seconds
      expect(totalTime).toBeLessThan(10000);
    },
    15000, // Jest timeout: 15 seconds
  );

  it(
    "should save workout to storage in under 500ms",
    async () => {
      const startTime = Date.now();

      render(<LogScreen />);

      await waitFor(() => screen.getByTestId("distance-input"));

      // Fill form
      fireEvent.changeText(screen.getByTestId("distance-input"), "5.0");
      fireEvent.changeText(screen.getByTestId("duration-input"), "30");

      const beforeSave = Date.now();

      // Save
      fireEvent.press(screen.getByTestId("save-workout-button"));

      await waitFor(() => {
        expect(mockSaveWorkout).toHaveBeenCalled();
      });

      const saveTime = Date.now() - beforeSave;

      console.log(`Storage write time: ${saveTime}ms`);

      // Storage write should be under 500ms
      expect(saveTime).toBeLessThan(500);
    },
    5000,
  );

  it("should maintain UI responsiveness during save", async () => {
    render(<LogScreen />);

    await waitFor(() => screen.getByTestId("distance-input"));

    // Fill form
    fireEvent.changeText(screen.getByTestId("distance-input"), "5.0");
    fireEvent.changeText(screen.getByTestId("duration-input"), "30");

    // Press save
    const saveButton = screen.getByTestId("save-workout-button");
    fireEvent.press(saveButton);

    // Button should show loading state but remain responsive
    expect(saveButton.props.disabled).toBeFalsy();

    // Should be able to interact with other elements during save
    const typeButton = screen.getByTestId("type-squats");
    expect(typeButton).toBeTruthy();
  });

  it(
    "should complete strength workout log in under 10 seconds",
    async () => {
      const startTime = Date.now();

      render(<LogScreen />);

      await waitFor(() => screen.getByTestId("distance-input"));

      // Switch to strength
      fireEvent.press(screen.getByTestId("type-squats"));

      await waitFor(() => screen.getByTestId("reps-input"));

      // Fill form
      fireEvent.changeText(screen.getByTestId("reps-input"), "20");
      fireEvent.changeText(screen.getByTestId("sets-input"), "3");

      // Save
      fireEvent.press(screen.getByTestId("save-workout-button"));

      await waitFor(() => {
        expect(mockSaveWorkout).toHaveBeenCalled();
      });

      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(10000);
    },
    15000,
  );
});
