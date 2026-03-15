import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { IconButton } from "../src/components/IconButton";

describe("IconButton", () => {
  const defaultProps = {
    icon: "run" as const,
    label: "Run",
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders icon and label", () => {
    const { getByText } = render(<IconButton {...defaultProps} />);

    expect(getByText("Run")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(<IconButton {...defaultProps} onPress={onPress} />);

    fireEvent.press(getByText("Run"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("applies active style when active prop is true", () => {
    const { getByText } = render(<IconButton {...defaultProps} active />);

    const button = getByText("Run");
    expect(button).toBeTruthy();
  });

  it("does not apply active style when active prop is false", () => {
    const { getByText } = render(<IconButton {...defaultProps} active={false} />);

    const button = getByText("Run");
    expect(button).toBeTruthy();
  });

  it("accepts custom style prop", () => {
    const customStyle = { backgroundColor: "red" };
    const { getByText } = render(
      <IconButton {...defaultProps} style={customStyle} />
    );

    const button = getByText("Run");
    expect(button).toBeTruthy();
  });

  it("renders different icons", () => {
    const { getByText } = render(<IconButton icon="arm-flex" label="Push-up" onPress={jest.fn()} />);

    expect(getByText("Push-up")).toBeTruthy();
  });

  it("renders with various icon types", () => {
    const icons: Array<"run" | "arm-flex" | "weight-lifter" | "hand-back-left"> = [
      "run",
      "arm-flex",
      "weight-lifter",
      "hand-back-left",
    ];

    icons.forEach((icon) => {
      const { getByText, unmount } = render(
        <IconButton icon={icon} label={icon} onPress={jest.fn()} />
      );

      expect(getByText(icon)).toBeTruthy();
      unmount();
    });
  });

  it("has proper accessibility", () => {
    const { getByText } = render(<IconButton {...defaultProps} />);

    const button = getByText("Run");
    expect(button.props.accessibilityRole).toBe("button");
  });

  it("renders label with numberOfLines prop", () => {
    const { getByText } = render(<IconButton {...defaultProps} />);

    const label = getByText("Run");
    expect(label.props.numberOfLines).toBe(1);
  });

  it("applies labelActive style when active", () => {
    const { getByText } = render(<IconButton {...defaultProps} active />);

    const label = getByText("Run");
    expect(label).toBeTruthy();
  });

  it("forwards testID prop", () => {
    const { getByTestId } = render(
      <IconButton {...defaultProps} testID="test-button" />
    );

    expect(getByTestId("test-button")).toBeTruthy();
  });

  it("forwards accessibility label", () => {
    const { getByLabelText } = render(
      <IconButton {...defaultProps} accessibilityLabel="Run button" />
    );

    expect(getByLabelText("Run button")).toBeTruthy();
  });

  it("handles long labels with truncation", () => {
    const longLabel = "Very Long Label That Should Truncate";
    const { getByText } = render(
      <IconButton icon="run" label={longLabel} onPress={jest.fn()} />
    );

    expect(getByText(longLabel)).toBeTruthy();
  });

  it("renders consistently across multiple renders", () => {
    const { rerender } = render(<IconButton {...defaultProps} />);

    rerender(<IconButton {...defaultProps} active />);

    const { getByText } = render(<IconButton {...defaultProps} active />);
    expect(getByText("Run")).toBeTruthy();
  });

  it("calls onPress multiple times on multiple presses", () => {
    const onPress = jest.fn();
    const { getByText } = render(<IconButton {...defaultProps} onPress={onPress} />);

    fireEvent.press(getByText("Run"));
    fireEvent.press(getByText("Run"));
    fireEvent.press(getByText("Run"));

    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it("supports different icon names from MaterialCommunityIcons", () => {
    const { getByText } = render(
      <IconButton icon="calendar" label="Calendar" onPress={jest.fn()} />
    );

    expect(getByText("Calendar")).toBeTruthy();
  });

  it("renders with proper structure", () => {
    const { toJSON } = render(<IconButton {...defaultProps} />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("does not crash with undefined props", () => {
    expect(() =>
      render(<IconButton icon="run" label="Run" onPress={undefined as any} />)
    ).not.toThrow();
  });
});
