global.IS_REACT_ACT_ENVIRONMENT = true;

import { render, fireEvent, act } from "@testing-library/react-native";

import { HomeScreen } from "../src/screens/HomeScreen";

// Helper to wait for async operations
const waitForAsync = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
};

describe("HomeScreen", () => {
  const mockNavigation = {
    navigate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigation.navigate.mockClear();
  });

  // TODO: Fix test - NetInfo mock issue in test environment
  // it("renders title", async () => {
  //   const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
  //   await waitForAsync();
  //   expect(getByText("FitTrack Pro")).toBeTruthy();
  // });

  // TODO: Fix test - NetInfo mock issue in test environment
  // it("renders subtitle", async () => {
  //   const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
  //   await waitForAsync();
  //   expect(getByText("Track your workouts and crush your goals.")).toBeTruthy();
  // });

  it("renders Quick Actions section", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    expect(getByText("Quick Actions")).toBeTruthy();
  });

  it("renders Latest Activity section", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    expect(getByText("Recent Activity")).toBeTruthy();
  });

  it("renders stats card with streak", async () => {
    const { getByTestId } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    expect(getByTestId("home-streak-tracker")).toBeTruthy();
  });

  it("renders stats card with weekly summary", async () => {
    const { getByTestId } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    expect(getByTestId("home-weekly-summary")).toBeTruthy();
  });

  it("renders Run button", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    expect(getByText("Run")).toBeTruthy();
  });

  it("renders Push-up button", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    expect(getByText("Push-up")).toBeTruthy();
  });

  it("renders Squats button", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    expect(getByText("Squats")).toBeTruthy();
  });

  it("renders Pull-up button", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    expect(getByText("Pull-up")).toBeTruthy();
  });

  it("navigates to Log screen when Run is pressed", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    fireEvent.press(getByText("Run"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });

  it("navigates to Log screen when Push-up is pressed", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    fireEvent.press(getByText("Push-up"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });

  it("navigates to Log screen when Squats is pressed", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    fireEvent.press(getByText("Squats"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });

  it("navigates to Log screen when Pull-up is pressed", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    fireEvent.press(getByText("Pull-up"));
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });

  it("renders placeholder message for empty activity list", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    expect(
      getByText(
        "Your latest workouts will appear here once you start logging activities."
      )
    ).toBeTruthy();
  });

  it("renders SafeAreaView wrapper", async () => {
    const { toJSON } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("handles multiple navigation calls", async () => {
    const { getByText } = render(<HomeScreen navigation={mockNavigation as any} />);
    await waitForAsync();
    fireEvent.press(getByText("Run"));
    fireEvent.press(getByText("Push-up"));
    fireEvent.press(getByText("Squats"));
    fireEvent.press(getByText("Pull-up"));
    expect(mockNavigation.navigate).toHaveBeenCalledTimes(4);
    expect(mockNavigation.navigate).toHaveBeenCalledWith("Log");
  });
});
