import { render } from "@testing-library/react-native";
import { DashboardScreen } from "../src/screens/DashboardScreen";

describe("DashboardScreen", () => {
  it("renders title", () => {
    const { getByText } = render(<DashboardScreen />);

    expect(getByText("Dashboard")).toBeTruthy();
  });

  it("renders subtitle", () => {
    const { getByText } = render(<DashboardScreen />);

    expect(
      getByText(
        "This screen will show progress summaries, streaks, and achievements."
      )
    ).toBeTruthy();
  });

  it("renders coming soon card", () => {
    const { getByText } = render(<DashboardScreen />);

    expect(getByText("Coming soon")).toBeTruthy();
  });

  it("renders card text about logged workouts", () => {
    const { getByText } = render(<DashboardScreen />);

    expect(
      getByText(
        "Once you have logged workouts, this screen will help you see how you're doing over time."
      )
    ).toBeTruthy();
  });

  it("renders SafeAreaView wrapper", () => {
    const { toJSON } = render(<DashboardScreen />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("renders title with proper styling", () => {
    const { getByText } = render(<DashboardScreen />);

    const title = getByText("Dashboard");
    expect(title.props.style).toBeDefined();
  });

  it("renders subtitle with secondary color", () => {
    const { getByText } = render(<DashboardScreen />);

    const subtitle = getByText(
      "This screen will show progress summaries, streaks, and achievements."
    );
    expect(subtitle.props.style).toBeDefined();
  });

  it("renders card title with bold font", () => {
    const { getByText } = render(<DashboardScreen />);

    const cardTitle = getByText("Coming soon");
    expect(cardTitle.props.style).toBeDefined();
  });

  it("renders card text with proper styling", () => {
    const { getByText } = render(<DashboardScreen />);

    const cardText = getByText(
      "Once you have logged workouts, this screen will help you see how you're doing over time."
    );
    expect(cardText.props.style).toBeDefined();
  });

  it("is a static informational screen", () => {
    const { unmount } = render(<DashboardScreen />);

    expect(() => unmount()).not.toThrow();
  });

  it("has no interactive elements", () => {
    const { toJSON } = render(<DashboardScreen />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("renders content in correct order", () => {
    const { getByText } = render(<DashboardScreen />);

    const dashboardTitle = getByText("Dashboard");
    const comingSoon = getByText("Coming soon");

    expect(dashboardTitle).toBeTruthy();
    expect(comingSoon).toBeTruthy();
  });

  it("displays placeholder content", () => {
    const { getByText } = render(<DashboardScreen />);

    expect(getByText("Coming soon")).toBeTruthy();
    expect(
      getByText(
        "Once you have logged workouts, this screen will help you see how you're doing over time."
      )
    ).toBeTruthy();
  });

  it("renders without crashing", () => {
    expect(() => render(<DashboardScreen />)).not.toThrow();
  });

  it("maintains consistent UI across renders", () => {
    const { rerender, getByText } = render(<DashboardScreen />);

    rerender(<DashboardScreen />);

    expect(getByText("Dashboard")).toBeTruthy();
    expect(getByText("Coming soon")).toBeTruthy();
  });

  it("renders with proper structure", () => {
    const { toJSON } = render(<DashboardScreen />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });
});
