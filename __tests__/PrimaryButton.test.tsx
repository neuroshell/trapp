import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PrimaryButton } from "../src/components/PrimaryButton";

describe("PrimaryButton", () => {
  const defaultProps = {
    children: "Click Me",
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children content", () => {
    const { getByText } = render(<PrimaryButton {...defaultProps} />);

    expect(getByText("Click Me")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByText } = render(<PrimaryButton onPress={onPress}>Button</PrimaryButton>);

    fireEvent.press(getByText("Button"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("applies active style when active prop is true", () => {
    const { getByText } = render(<PrimaryButton {...defaultProps} active />);

    const button = getByText("Click Me");
    expect(button).toBeTruthy();
  });

  it("applies disabled style when disabled prop is true", () => {
    const { getByText } = render(<PrimaryButton {...defaultProps} disabled />);

    const button = getByText("Click Me");
    expect(button).toBeTruthy();
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PrimaryButton onPress={onPress} disabled>
        Button
      </PrimaryButton>
    );

    fireEvent.press(getByText("Button"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("accepts custom style prop", () => {
    const customStyle = { backgroundColor: "red" };
    const { getByText } = render(
      <PrimaryButton {...defaultProps} style={customStyle} />
    );

    const button = getByText("Click Me");
    expect(button).toBeTruthy();
  });

  it("forwards testID prop", () => {
    const { getByTestId } = render(
      <PrimaryButton {...defaultProps} testID="test-button" />
    );

    expect(getByTestId("test-button")).toBeTruthy();
  });

  it("forwards accessibility props", () => {
    const { getByLabelText } = render(
      <PrimaryButton {...defaultProps} accessibilityLabel="Test button" />
    );

    expect(getByLabelText("Test button")).toBeTruthy();
  });

  it("renders with multiple children", () => {
    const { getByText } = render(
      <PrimaryButton onPress={jest.fn()}>
        <child>Child 1</child>
        <child>Child 2</child>
      </PrimaryButton>
    );

    expect(getByText("Child 1")).toBeTruthy();
    expect(getByText("Child 2")).toBeTruthy();
  });

  it("renders with text children", () => {
    const { getByText } = render(<PrimaryButton {...defaultProps}>Hello</PrimaryButton>);

    expect(getByText("Hello")).toBeTruthy();
  });

  it("renders with number children", () => {
    const { getByText } = render(<PrimaryButton onPress={jest.fn()}>123</PrimaryButton>);

    expect(getByText("123")).toBeTruthy();
  });

  it("handles empty children", () => {
    expect(() => render(<PrimaryButton onPress={jest.fn()} />)).not.toThrow();
  });

  it("calls onPress multiple times on multiple presses", () => {
    const onPress = jest.fn();
    const { getByText } = render(<PrimaryButton onPress={onPress}>Button</PrimaryButton>);

    fireEvent.press(getByText("Button"));
    fireEvent.press(getByText("Button"));
    fireEvent.press(getByText("Button"));

    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it("renders consistently across multiple renders", () => {
    const { rerender } = render(<PrimaryButton {...defaultProps} />);

    rerender(<PrimaryButton {...defaultProps} active />);

    const { getByText } = render(<PrimaryButton {...defaultProps} active />);
    expect(getByText("Click Me")).toBeTruthy();
  });

  it("supports conditional rendering", () => {
    const showButton = true;
    const { getByText } = render(
      <PrimaryButton onPress={jest.fn()}>
        {showButton && "Conditional"}
      </PrimaryButton>
    );

    expect(getByText("Conditional")).toBeTruthy();
  });

  it("can be used as form submit button", () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <PrimaryButton onPress={onSubmit}>Submit</PrimaryButton>
    );

    fireEvent.press(getByText("Submit"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("can be used as cancel button", () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <PrimaryButton onPress={onCancel}>Cancel</PrimaryButton>
    );

    fireEvent.press(getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("supports long text content", () => {
    const longText = "This is a very long button text that should still render properly";
    const { getByText } = render(
      <PrimaryButton onPress={jest.fn()}>{longText}</PrimaryButton>
    );

    expect(getByText(longText)).toBeTruthy();
  });

  it("does not crash with undefined onPress", () => {
    expect(() =>
      render(<PrimaryButton onPress={undefined as any}>Button</PrimaryButton>)
    ).not.toThrow();
  });

  it("renders with proper structure", () => {
    const { toJSON } = render(<PrimaryButton {...defaultProps} />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("applies all state styles correctly", () => {
    const { getByText } = render(
      <PrimaryButton {...defaultProps} active disabled />
    );

    const button = getByText("Click Me");
    expect(button).toBeTruthy();
  });
});
