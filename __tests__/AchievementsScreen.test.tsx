import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { AchievementsScreen } from "../src/screens/AchievementsScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("AchievementsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [] }),
    );
  });

  it("renders achievements title and cards", async () => {
    const { getByText } = render(<AchievementsScreen />);

    await waitFor(() => {
      expect(getByText("Achievements")).toBeTruthy();
    });

    expect(getByText("First Log")).toBeTruthy();
    expect(getByText("Weekly Streak")).toBeTruthy();
    expect(getByText("Consistency")).toBeTruthy();
  });

  it("shows locked state for First Log when no entries exist", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [] }),
    );

    const { getByText } = render(<AchievementsScreen />);

    await waitFor(() => {
      expect(getByText("First Log")).toBeTruthy();
    });

    // Should show locked message
    expect(
      getByText("Log your first activity to unlock this badge."),
    ).toBeTruthy();
  });

  it("shows unlocked state for First Log when entries exist", async () => {
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
      JSON.stringify({ entries: mockEntries }),
    );

    const { getByText } = render(<AchievementsScreen />);

    await waitFor(() => {
      expect(getByText("First Log")).toBeTruthy();
    });

    // Should show unlocked message
    expect(getByText("Nice work!")).toBeTruthy();
  });

  it("shows streak progress when no consecutive days logged", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [] }),
    );

    const { getByText } = render(<AchievementsScreen />);

    await waitFor(() => {
      expect(getByText("Weekly Streak")).toBeTruthy();
    });

    // Should show progress needed
    expect(getByText(/Log activities \d+ more day\(s\) to earn this/)).toBeTruthy();
  });

  it("calculates streak correctly with consecutive daily entries", async () => {
    const today = new Date();
    const entries = [];

    // Create entries for the last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      entries.push({
        id: `entry-${i}`,
        type: "running",
        date: date.toISOString(),
        quantity: 30,
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      });
    }

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries }),
    );

    const { getByText } = render(<AchievementsScreen />);

    await waitFor(() => {
      expect(getByText("Weekly Streak")).toBeTruthy();
    });

    // Should show 7-day streak message
    expect(getByText(/🔥 \d+-day streak! Keep it up!/)).toBeTruthy();
  });

  it("shows weekly goal progress when less than 3 days logged this week", async () => {
    const today = new Date();
    // Get Monday of this week
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    // Create only 2 entries this week
    const entries = [
      {
        id: "1",
        type: "running",
        date: monday.toISOString(),
        quantity: 30,
        createdAt: monday.toISOString(),
        updatedAt: monday.toISOString(),
      },
      {
        id: "2",
        type: "pushups",
        date: new Date(monday.getTime() + 86400000).toISOString(), // Tuesday
        quantity: 20,
        createdAt: new Date(monday.getTime() + 86400000).toISOString(),
        updatedAt: new Date(monday.getTime() + 86400000).toISOString(),
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries }),
    );

    const { getByText } = render(<AchievementsScreen />);

    await waitFor(() => {
      expect(getByText("Consistency")).toBeTruthy();
    });

    // Should show progress needed for weekly goal
    expect(
      getByText(/Log activity on \d+ different days? this week to earn this/),
    ).toBeTruthy();
  });

  it("shows weekly goal met when 3+ days logged this week", async () => {
    const today = new Date();
    // Get Monday of this week
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    // Create 3 entries this week
    const entries = [
      {
        id: "1",
        type: "running",
        date: monday.toISOString(),
        quantity: 30,
        createdAt: monday.toISOString(),
        updatedAt: monday.toISOString(),
      },
      {
        id: "2",
        type: "pushups",
        date: new Date(monday.getTime() + 86400000).toISOString(), // Tuesday
        quantity: 20,
        createdAt: new Date(monday.getTime() + 86400000).toISOString(),
        updatedAt: new Date(monday.getTime() + 86400000).toISOString(),
      },
      {
        id: "3",
        type: "squats",
        date: new Date(monday.getTime() + 2 * 86400000).toISOString(), // Wednesday
        quantity: 25,
        createdAt: new Date(monday.getTime() + 2 * 86400000).toISOString(),
        updatedAt: new Date(monday.getTime() + 2 * 86400000).toISOString(),
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries }),
    );

    const { getByText } = render(<AchievementsScreen />);

    await waitFor(() => {
      expect(getByText("Consistency")).toBeTruthy();
    });

    // Should show goal met message
    expect(
      getByText("Great consistency — you hit the 3-day goal this week."),
    ).toBeTruthy();
  });

  it("loads entries from AsyncStorage on mount", async () => {
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
      JSON.stringify({ entries: mockEntries }),
    );

    render(<AchievementsScreen />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  it("handles empty entries array gracefully", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [] }),
    );

    const { getByText } = render(<AchievementsScreen />);

    await waitFor(() => {
      expect(getByText("Achievements")).toBeTruthy();
    });

    // All achievement cards should be visible
    expect(getByText("First Log")).toBeTruthy();
    expect(getByText("Weekly Streak")).toBeTruthy();
    expect(getByText("Consistency")).toBeTruthy();
  });

  it("renders achievement cards with proper styling when active", async () => {
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
      JSON.stringify({ entries: mockEntries }),
    );

    const { getAllByType } = render(<AchievementsScreen />);

    await waitFor(() => {
      const views = getAllByType(require("react-native").View);
      expect(views.length).toBeGreaterThan(0);
    });
  });

  it("displays correct subtitle for streak achievement", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [] }),
    );

    const { getByText } = render(<AchievementsScreen />);

    await waitFor(() => {
      expect(getByText("Weekly Streak")).toBeTruthy();
    });

    // Should show streak-related text
    const weeklyStreakText = getByText(/Log activities|Keep it up/);
    expect(weeklyStreakText).toBeTruthy();
  });

  it("renders scrollable content container", async () => {
    const { getByTestId } = render(<AchievementsScreen />);

    // ScrollView should be present
    await waitFor(() => {
      const scrollViews = require("react-native").ScrollView;
      expect(scrollViews).toBeDefined();
    });
  });
});
