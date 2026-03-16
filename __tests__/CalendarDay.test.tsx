import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { CalendarDay } from "../src/components/CalendarDay";

describe("CalendarDay", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it("renders day number correctly", () => {
    render(
      <CalendarDay
        day={15}
        isCurrentMonth={true}
        isToday={false}
        isSelected={false}
        workoutCount={0}
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByText("15")).toBeTruthy();
  });

  it("renders empty cell for null day", () => {
    const { UNSAFE_root } = render(
      <CalendarDay
        day={null}
        isCurrentMonth={false}
        isToday={false}
        isSelected={false}
        workoutCount={0}
        onPress={mockOnPress}
      />,
    );

    expect(UNSAFE_root).toBeTruthy();
  });

  it("calls onPress when day is pressed", () => {
    render(
      <CalendarDay
        day={15}
        isCurrentMonth={true}
        isToday={false}
        isSelected={false}
        workoutCount={0}
        onPress={mockOnPress}
      />,
    );

    fireEvent.press(screen.getByText("15"));
    expect(mockOnPress).toHaveBeenCalledWith(15);
  });

  it("does not call onPress for null day", () => {
    render(
      <CalendarDay
        day={null}
        isCurrentMonth={false}
        isToday={false}
        isSelected={false}
        workoutCount={0}
        onPress={mockOnPress}
      />,
    );

    // Empty cell should not be pressable
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("shows single workout indicator", () => {
    render(
      <CalendarDay
        day={15}
        isCurrentMonth={true}
        isToday={false}
        isSelected={false}
        workoutCount={1}
        onPress={mockOnPress}
      />,
    );

    // Should have indicator element
    expect(screen.getByTestId("calendar-day")).toBeTruthy();
  });

  it("shows multiple workout indicators", () => {
    render(
      <CalendarDay
        day={15}
        isCurrentMonth={true}
        isToday={false}
        isSelected={false}
        workoutCount={3}
        onPress={mockOnPress}
      />,
    );

    expect(screen.getByTestId("calendar-day")).toBeTruthy();
  });

  it("highlights today", () => {
    const { getByTestId } = render(
      <CalendarDay
        day={15}
        isCurrentMonth={true}
        isToday={true}
        isSelected={false}
        workoutCount={0}
        onPress={mockOnPress}
      />,
    );

    expect(getByTestId("calendar-day-today")).toBeTruthy();
  });

  it("has proper accessibility label", () => {
    render(
      <CalendarDay
        day={15}
        isCurrentMonth={true}
        isToday={false}
        isSelected={false}
        workoutCount={0}
        onPress={mockOnPress}
        accessibilityLabel="March 15"
      />,
    );

    const dayElement = screen.getByTestId("calendar-day");
    expect(dayElement.props.accessibilityLabel).toBe("March 15");
  });

  it("has accessibility hint with workout count", () => {
    render(
      <CalendarDay
        day={15}
        isCurrentMonth={true}
        isToday={false}
        isSelected={false}
        workoutCount={2}
        onPress={mockOnPress}
      />,
    );

    const dayElement = screen.getByTestId("calendar-day");
    expect(dayElement.props.accessibilityHint).toContain("2 workouts");
  });

  it("disables press for other month days", () => {
    render(
      <CalendarDay
        day={1}
        isCurrentMonth={false}
        isToday={false}
        isSelected={false}
        workoutCount={0}
        onPress={mockOnPress}
      />,
    );

    const dayElement = screen.getByLabelText("Day 1");
    expect(dayElement.props.accessibilityState.disabled).toBe(true);
  });
});
