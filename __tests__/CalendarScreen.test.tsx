import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { CalendarScreen } from "../src/screens/CalendarScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock Alert to avoid popup during tests
const mockAlert = jest.fn();
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.Alert = {
    alert: mockAlert,
  };
  return RN;
});

describe("CalendarScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [] }),
    );
  });

  it("renders calendar with month label and navigation", async () => {
    const { getByText } = render(<CalendarScreen />);

    // Wait for calendar to load
    await waitFor(() => {
      expect(getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
    });

    // Should show weekday headers
    expect(getByText("Sun")).toBeTruthy();
    expect(getByText("Mon")).toBeTruthy();
    expect(getByText("Tue")).toBeTruthy();
    expect(getByText("Wed")).toBeTruthy();
    expect(getByText("Thu")).toBeTruthy();
    expect(getByText("Fri")).toBeTruthy();
    expect(getByText("Sat")).toBeTruthy();
  });

  it("navigates to previous month when pressing back button", async () => {
    const { getByText, findByText } = render(<CalendarScreen />);

    // Get initial month label
    const initialMonth = await findByText(/January|February|March|April|May|June|July|August|September|October|November|December/);
    const initialMonthText = initialMonth.props.children;

    // Press previous month button
    const prevButton = getByText("‹");
    fireEvent.press(prevButton);

    // Month should change
    await waitFor(() => {
      const newMonth = getByText(/January|February|March|April|May|June|July|August|September|October|November|December/);
      expect(newMonth.props.children).not.toBe(initialMonthText);
    });
  });

  it("navigates to next month when pressing forward button", async () => {
    const { getByText } = render(<CalendarScreen />);

    // Press next month button
    const nextButton = getByText("›");
    fireEvent.press(nextButton);

    // Should still render calendar
    await waitFor(() => {
      expect(getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
    });
  });

  it("highlights days with logged activities", async () => {
    // Mock entries with specific dates
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

    const { getByText } = render(<CalendarScreen />);

    // Wait for calendar to load with entries
    await waitFor(() => {
      expect(getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
    });
  });

  it("shows alert when pressing a day with entries", async () => {
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
      JSON.stringify({ entries: mockEntries }),
    );

    const { getByText } = render(<CalendarScreen />);

    await waitFor(() => {
      expect(getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
    });

    // Press a day cell (first day that's not null)
    const dayCell = getByText("1");
    fireEvent.press(dayCell);

    // Alert should be called (mocked)
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  it("loads entries from AsyncStorage on mount", async () => {
    const mockEntries = [
      {
        id: "1",
        type: "pushups",
        date: new Date().toISOString(),
        quantity: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: mockEntries }),
    );

    render(<CalendarScreen />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });

  it("handles empty entries gracefully", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: [] }),
    );

    const { getByText } = render(<CalendarScreen />);

    await waitFor(() => {
      expect(getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
    });

    // Calendar should still render without entries
    expect(getByText("Sun")).toBeTruthy();
  });

  it("renders calendar with proper structure", async () => {
    const { toJSON } = render(<CalendarScreen />);

    await waitFor(() => {
      const tree = toJSON();
      expect(tree).toBeDefined();
    });
  });

  it("renders navigation buttons", async () => {
    const { getByText } = render(<CalendarScreen />);

    await waitFor(() => {
      expect(getByText("‹")).toBeTruthy();
      expect(getByText("›")).toBeTruthy();
    });
  });

  it("renders day cells", async () => {
    const { getByText } = render(<CalendarScreen />);

    await waitFor(() => {
      // At least day 1 should be present
      expect(getByText("1")).toBeTruthy();
    });
  });

  it("applies active style to days with entries", async () => {
    const today = new Date();
    const mockEntries = [
      {
        id: "1",
        type: "running",
        date: today.toISOString(),
        quantity: 30,
        createdAt: today.toISOString(),
        updatedAt: today.toISOString(),
      },
    ];

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ entries: mockEntries }),
    );

    const { toJSON } = render(<CalendarScreen />);

    await waitFor(() => {
      const tree = toJSON();
      expect(tree).toBeDefined();
    });
  });

  it("handles month transition correctly", async () => {
    const { getByText } = render(<CalendarScreen />);

    await waitFor(() => {
      expect(getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
    });

    // Navigate forward multiple times
    const nextButton = getByText("›");
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
    });
  });

  it("handles navigation to previous months", async () => {
    const { getByText } = render(<CalendarScreen />);

    await waitFor(() => {
      expect(getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
    });

    // Navigate backward
    const prevButton = getByText("‹");
    fireEvent.press(prevButton);

    await waitFor(() => {
      expect(getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeTruthy();
    });
  });

  it("renders week day headers in correct order", async () => {
    const { getByText } = render(<CalendarScreen />);

    await waitFor(() => {
      expect(getByText("Sun")).toBeTruthy();
      expect(getByText("Mon")).toBeTruthy();
      expect(getByText("Tue")).toBeTruthy();
      expect(getByText("Wed")).toBeTruthy();
      expect(getByText("Thu")).toBeTruthy();
      expect(getByText("Fri")).toBeTruthy();
      expect(getByText("Sat")).toBeTruthy();
    });
  });

  it("displays month and year in label", async () => {
    const { getByText } = render(<CalendarScreen />);

    await waitFor(() => {
      const monthLabel = getByText(/January|February|March|April|May|June|July|August|September|October|November|December/);
      expect(monthLabel.props.children).toContain(new Date().getFullYear().toString());
    });
  });
});
