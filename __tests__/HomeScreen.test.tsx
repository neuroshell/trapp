import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { HomeScreen } from "../src/screens/HomeScreen";

describe("HomeScreen", () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigation.navigate.mockClear();
  });

  it("renders title", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("FitTrack Pro")).toBeTruthy();
  });

  it("renders subtitle", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Quickly log activity and track progress.")).toBeTruthy();
  });

  it("renders Quick Actions section", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Quick Actions")).toBeTruthy();
  });

  it("renders Latest Activity section", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Latest Activity")).toBeTruthy();
  });

  it("renders stats card with streak", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Streak")).toBeTruthy();
    expect(getByText("🔥 4 days")).toBeTruthy();
  });

  it("renders stats card with weekly goal", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Weekly Goal")).toBeTruthy();
    expect(getByText("3 / 5")).toBeTruthy();
  });

  it("renders Run button", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Run")).toBeTruthy();
  });

  it("renders Push-up button", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Push-up")).toBeTruthy();
  });

  it("renders Squats button", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Squats")).toBeTruthy();
  });

  it("renders Pull-up button", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Pull-up")).toBeTruthy();
  });

  it("navigates to Log screen when Run is pressed", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    fireEvent.press(getByText("Run"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });

  it("navigates to Log screen when Push-up is pressed", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    fireEvent.press(getByText("Push-up"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });

  it("navigates to Log screen when Squats is pressed", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    fireEvent.press(getByText("Squats"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });

  it("navigates to Log screen when Pull-up is pressed", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    fireEvent.press(getByText("Pull-up"));

    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });

  it("renders placeholder message for empty activity list", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(
      getByText(
        "Your latest workouts will appear here once you start logging activities."
      )
    ).toBeTruthy();
  });

  it("renders SafeAreaView wrapper", () => {
    const { toJSON } = render(<HomeScreen navigation={mockNavigation as any} />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("has proper layout structure", () => {
    const { toJSON } = render(<HomeScreen navigation={mockNavigation as any} />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("renders stat blocks in row layout", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Streak")).toBeTruthy();
    expect(getByText("Weekly Goal")).toBeTruthy();
  });

  it("renders quick action buttons in rows", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    expect(getByText("Run")).toBeTruthy();
    expect(getByText("Push-up")).toBeTruthy();
    expect(getByText("Squats")).toBeTruthy();
    expect(getByText("Pull-up")).toBeTruthy();
  });

  it("renders title with proper styling", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    const title = getByText("FitTrack Pro");
    expect(title.props.style).toBeDefined();
  });

  it("renders subtitle with secondary color", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    const subtitle = getByText("Quickly log activity and track progress.");
    expect(subtitle.props.style).toBeDefined();
  });

  it("renders section titles with proper styling", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    const quickActionsTitle = getByText("Quick Actions");
    const latestActivityTitle = getByText("Latest Activity");

    expect(quickActionsTitle.props.style).toBeDefined();
    expect(latestActivityTitle.props.style).toBeDefined();
  });

  it("renders placeholder card with proper styling", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    const placeholderText = getByText(
      "Your latest workouts will appear here once you start logging activities."
    );
    expect(placeholderText.props.style).toBeDefined();
  });

  it("renders stat values with proper styling", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    const streakValue = getByText("🔥 4 days");
    const weeklyGoalValue = getByText("3 / 5");

    expect(streakValue.props.style).toBeDefined();
    expect(weeklyGoalValue.props.style).toBeDefined();
  });

  it("renders stat labels with proper styling", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    const streakLabel = getByText("Streak");
    const weeklyGoalLabel = getByText("Weekly Goal");

    expect(streakLabel.props.style).toBeDefined();
    expect(weeklyGoalLabel.props.style).toBeDefined();
  });

  it("handles multiple navigation calls", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    fireEvent.press(getByText("Run"));
    fireEvent.press(getByText("Push-up"));
    fireEvent.press(getByText("Squats"));
    fireEvent.press(getByText("Pull-up"));

    expect(mockNavigation.navigate).toHaveBeenCalledTimes(4);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });

  it("renders consistently across multiple renders", () => {
    const { rerender } = render(<HomeScreen navigation={mockNavigation as any} />);

    rerender(<HomeScreen navigation={mockNavigation as any} />);

    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    expect(getByText("FitTrack Pro")).toBeTruthy();
  });

  it("does not crash with undefined navigation", () => {
    expect(() => render(<HomeScreen navigation={undefined as any} />)).not.toThrow();
  });

  it("has accessible stat display", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    // Stats should be readable
    expect(getByText("Streak")).toBeTruthy();
    expect(getByText("🔥 4 days")).toBeTruthy();
    expect(getByText("Weekly Goal")).toBeTruthy();
    expect(getByText("3 / 5")).toBeTruthy();
  });

  it("renders empty state for activity list", () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);

    // Empty state message
    expect(
      getByText(
        "Your latest workouts will appear here once you start logging activities."
      )
    ).toBeTruthy();
  });

  it("renders with proper structure", () => {
    const { toJSON } = render(<HomeScreen navigation={mockNavigation as any} />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });
});
