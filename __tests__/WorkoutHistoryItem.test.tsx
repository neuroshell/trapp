import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { WorkoutEntry } from "../src/models";
import { WorkoutHistoryItem } from "../src/components/WorkoutHistoryItem";

describe("WorkoutHistoryItem", () => {
  const mockWorkout: WorkoutEntry = {
    id: "test-workout-1",
    userId: "test-user",
    type: "running",
    timestamp: new Date("2026-03-15T10:30:00.000Z").toISOString(),
    data: {
      distance: 5.0,
      duration: 30,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnPress = jest.fn();
  const mockOnLongPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
    mockOnLongPress.mockClear();
  });

  it("renders workout type correctly", () => {
    render(
      <WorkoutHistoryItem
        workout={mockWorkout}
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByText("Running")).toBeTruthy();
  });

  it("renders workout summary", () => {
    render(
      <WorkoutHistoryItem
        workout={mockWorkout}
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByTestId("workout-summary")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    render(
      <WorkoutHistoryItem
        workout={mockWorkout}
        onPress={mockOnPress}
      />,
    );

    fireEvent.press(screen.getByTestId("workout-history-item"));
    expect(mockOnPress).toHaveBeenCalledWith(mockWorkout);
  });

  it("calls onLongPress when long pressed", () => {
    render(
      <WorkoutHistoryItem
        workout={mockWorkout}
        onLongPress={mockOnLongPress}
      />,
    );

    fireEvent(screen.getByTestId("workout-history-item"), "onLongPress");
    expect(mockOnLongPress).toHaveBeenCalledWith(mockWorkout);
  });

  it("displays workout icon", () => {
    render(
      <WorkoutHistoryItem
        workout={mockWorkout}
        onPress={mockOnPress}
      />,
    );

    // Icon container should be present with accessibility label
    const iconContainer = screen.getByLabelText("running icon");
    expect(iconContainer).toBeTruthy();
  });

  it("has proper accessibility label", () => {
    render(
      <WorkoutHistoryItem
        workout={mockWorkout}
        onPress={mockOnPress}
      />,
    );

    const item = screen.getByTestId("workout-history-item");
    expect(item.props.accessibilityLabel).toBeTruthy();
  });

  it("has accessibility hint", () => {
    render(
      <WorkoutHistoryItem
        workout={mockWorkout}
        onPress={mockOnPress}
      />,
    );

    const item = screen.getByTestId("workout-history-item");
    expect(item.props.accessibilityHint).toContain("Double tap");
  });

  it("renders strength workout correctly", () => {
    const strengthWorkout: WorkoutEntry = {
      ...mockWorkout,
      type: "squats",
      data: {
        reps: 20,
        sets: 3,
        weight: 50,
      },
    };

    render(
      <WorkoutHistoryItem
        workout={strengthWorkout}
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByText("Squats")).toBeTruthy();
  });

  it("renders workout with notes", () => {
    const workoutWithNotes: WorkoutEntry = {
      ...mockWorkout,
      data: {
        ...mockWorkout.data,
        notes: "Great workout session!",
      },
    };

    render(
      <WorkoutHistoryItem
        workout={workoutWithNotes}
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByTestId("workout-notes")).toBeTruthy();
  });

  it("displays date correctly for today", () => {
    const todayWorkout: WorkoutEntry = {
      ...mockWorkout,
      timestamp: new Date().toISOString(),
    };

    render(
      <WorkoutHistoryItem
        workout={todayWorkout}
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByText("Today")).toBeTruthy();
  });

  it("displays date correctly for yesterday", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayWorkout: WorkoutEntry = {
      ...mockWorkout,
      timestamp: yesterday.toISOString(),
    };

    render(
      <WorkoutHistoryItem
        workout={yesterdayWorkout}
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByText("Yesterday")).toBeTruthy();
  });
});
