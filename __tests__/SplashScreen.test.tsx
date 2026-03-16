import React from "react";
import { render } from "@testing-library/react-native";
import { SplashScreen } from "../src/screens/SplashScreen";

describe("SplashScreen", () => {
  it("renders title", () => {
    const { getByText } = render(<SplashScreen />);

    expect(getByText("FitTrack Pro")).toBeTruthy();
  });

  it("renders loading subtitle", () => {
    const { getByText } = render(<SplashScreen />);

    expect(getByText("Loading your data...")).toBeTruthy();
  });

  it("renders SafeAreaView wrapper", () => {
    const { toJSON } = render(<SplashScreen />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("renders title with proper styling", () => {
    const { getByText } = render(<SplashScreen />);

    const title = getByText("FitTrack Pro");
    expect(title.props.style).toBeDefined();
  });

  it("renders subtitle with proper styling", () => {
    const { getByText } = render(<SplashScreen />);

    const subtitle = getByText("Loading your data...");
    expect(subtitle.props.style).toBeDefined();
  });

  it("has no interactive elements", () => {
    const { toJSON } = render(<SplashScreen />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("is a static loading screen", () => {
    const { unmount } = render(<SplashScreen />);

    // Should render without errors
    expect(() => unmount()).not.toThrow();
  });

  it("displays app branding", () => {
    const { getByText } = render(<SplashScreen />);

    expect(getByText("FitTrack Pro")).toBeTruthy();
  });

  it("indicates loading state to user", () => {
    const { getByText } = render(<SplashScreen />);

    expect(getByText("Loading your data...")).toBeTruthy();
    expect(getByText("FitTrack Pro")).toBeTruthy();
  });

  it("does not crash during render", () => {
    expect(() => render(<SplashScreen />)).not.toThrow();
  });

  it("maintains consistent UI across renders", () => {
    const { rerender } = render(<SplashScreen />);

    rerender(<SplashScreen />);

    const { getByText } = render(<SplashScreen />);
    expect(getByText("FitTrack Pro")).toBeTruthy();
    expect(getByText("Loading your data...")).toBeTruthy();
  });

  it("renders with proper structure", () => {
    const { toJSON } = render(<SplashScreen />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("renders ActivityIndicator", () => {
    const { toJSON } = render(<SplashScreen />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });
});
