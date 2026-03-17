import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import React from "react";

import { CalendarScreen } from "../src/screens/CalendarScreen";

// Mock the storage module
jest.mock("../src/storage", () => ({
  getWorkouts: jest.fn().mockResolvedValue([]),
  getWorkoutsByDateRange: jest.fn().mockResolvedValue([]),
}));

// Mock useFocusEffect
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useFocusEffect: jest.fn((callback) => {
    // Don't execute callback immediately - let tests control it
  }),
}));

describe("CalendarScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders calendar title", () => {
    render(<CalendarScreen />);
    expect(screen.getByTestId("calendar-title")).toBeTruthy();
  });

  it("renders month label", () => {
    render(<CalendarScreen />);
    expect(screen.getByTestId("month-label")).toBeTruthy();
  });

  it("renders weekday headers", () => {
    render(<CalendarScreen />);
    expect(screen.getByText("Sun")).toBeTruthy();
    expect(screen.getByText("Mon")).toBeTruthy();
    expect(screen.getByText("Tue")).toBeTruthy();
    expect(screen.getByText("Wed")).toBeTruthy();
    expect(screen.getByText("Thu")).toBeTruthy();
    expect(screen.getByText("Fri")).toBeTruthy();
    expect(screen.getByText("Sat")).toBeTruthy();
  });

  it("renders today button", () => {
    render(<CalendarScreen />);
    expect(screen.getByTestId("today-button")).toBeTruthy();
  });

  it("navigates to previous month", () => {
    render(<CalendarScreen />);

    const prevButton = screen.getByTestId("prev-month-button");
    fireEvent.press(prevButton);

    // Should still have month label after navigation
    expect(screen.getByTestId("month-label")).toBeTruthy();
  });

  it("navigates to next month", () => {
    render(<CalendarScreen />);

    const nextButton = screen.getByTestId("next-month-button");
    fireEvent.press(nextButton);

    expect(screen.getByTestId("month-label")).toBeTruthy();
  });

  it("jumps to today", () => {
    render(<CalendarScreen />);

    const todayButton = screen.getByTestId("today-button");
    fireEvent.press(todayButton);

    expect(screen.getByTestId("month-label")).toBeTruthy();
  });

  it("has proper accessibility for navigation buttons", () => {
    render(<CalendarScreen />);

    const prevButton = screen.getByTestId("prev-month-button");
    const nextButton = screen.getByTestId("next-month-button");

    expect(prevButton.props.accessibilityLabel).toBe("Previous month");
    expect(nextButton.props.accessibilityLabel).toBe("Next month");
  });

  it("renders workout history section", () => {
    render(<CalendarScreen />);
    expect(screen.getByText("Workout History")).toBeTruthy();
  });

  it("shows empty state when no workouts", async () => {
    render(<CalendarScreen />);

    await waitFor(() => {
      expect(screen.getByText("No workouts yet")).toBeTruthy();
    });
  });

  it("has calendar day cells", () => {
    render(<CalendarScreen />);

    // Should have at least some day cells rendered
    const calendarDays = screen.getAllByTestId("calendar-day");
    expect(calendarDays.length).toBeGreaterThan(0);
  });

  it("highlights today", () => {
    render(<CalendarScreen />);

    // Today should be highlighted
    const todayElement = screen.getByTestId("calendar-day-today");
    expect(todayElement).toBeTruthy();
  });
});
