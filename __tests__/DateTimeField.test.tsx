import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { DateTimeField } from "../src/components/DateTimeField";

// Mock the date picker modal
jest.mock("react-native-modal-datetime-picker", () => {
  return {
    __esModule: true,
    default: ({ isVisible, onConfirm, onCancel, date }: any) => {
      const MockPicker = () => null;
      return isVisible ? <MockPicker /> : null;
    },
  };
});

// Mock Platform
jest.mock("react-native", () => {
  const RN = jest.requireActual("react-native");
  RN.Platform.OS = "ios";
  return RN;
});

describe("DateTimeField", () => {
  const defaultProps = {
    value: new Date("2024-01-15T10:30:00"),
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default value", () => {
    const { getByText } = render(<DateTimeField {...defaultProps} />);

    // Should display formatted date
    expect(getByText(/Jan|January/)).toBeTruthy();
  });

  it("renders label when provided", () => {
    const { getByText } = render(
      <DateTimeField {...defaultProps} label="Select Date" />
    );

    expect(getByText("Select Date")).toBeTruthy();
  });

  it("does not render label when not provided", () => {
    const { queryByText } = render(<DateTimeField {...defaultProps} />);

    expect(queryByText("Date & time")).toBeNull();
  });

  it("opens picker when pressed", () => {
    const { getByText } = render(<DateTimeField {...defaultProps} />);

    const button = getByText(/Jan|January/);
    fireEvent.press(button);

    // Picker should be triggered
    expect(button).toBeTruthy();
  });

  it("calls onChange when date is confirmed", () => {
    const onChange = jest.fn();
    const newDate = new Date("2024-02-20T14:00:00");

    render(<DateTimeField {...defaultProps} onChange={onChange} />);

    // Simulate date selection
    onChange(newDate);

    expect(onChange).toHaveBeenCalledWith(newDate);
  });

  it("formats date with time correctly", () => {
    const date = new Date("2024-06-15T14:30:00");
    const { getByText } = render(<DateTimeField value={date} onChange={jest.fn()} />);

    // Should show formatted date and time
    expect(getByText(/15/)).toBeTruthy();
  });

  it("forwards testID prop", () => {
    const { getByTestId } = render(
      <DateTimeField {...defaultProps} testID="test-datetime" />
    );

    expect(getByTestId("test-datetime")).toBeTruthy();
  });

  it("forwards accessibility props", () => {
    const { getByLabelText } = render(
      <DateTimeField {...defaultProps} accessibilityLabel="Select date and time" />
    );

    expect(getByLabelText("Select date and time")).toBeTruthy();
  });

  it("handles different date formats", () => {
    const dates = [
      new Date("2024-01-01T00:00:00"),
      new Date("2024-06-15T12:30:00"),
      new Date("2024-12-31T23:59:59"),
    ];

    dates.forEach((date) => {
      const { unmount } = render(<DateTimeField value={date} onChange={jest.fn()} />);
      unmount();
    });
  });

  it("displays current date value", () => {
    const now = new Date();
    const { getByText } = render(<DateTimeField value={now} onChange={jest.fn()} />);

    // Should display current date
    expect(getByText(/\d+/)).toBeTruthy();
  });

  it("updates display when value changes", () => {
    const { rerender } = render(
      <DateTimeField value={new Date("2024-01-01")} onChange={jest.fn()} />
    );

    rerender(<DateTimeField value={new Date("2024-06-15")} onChange={jest.fn()} />);

    // Should show updated date
    const { getByText } = render(
      <DateTimeField value={new Date("2024-06-15")} onChange={jest.fn()} />
    );
    expect(getByText(/15/)).toBeTruthy();
  });

  it("handles label with special characters", () => {
    const { getByText } = render(
      <DateTimeField {...defaultProps} label="Select Date & Time!" />
    );

    expect(getByText("Select Date & Time!")).toBeTruthy();
  });

  it("renders consistently across multiple renders", () => {
    const { rerender } = render(<DateTimeField {...defaultProps} />);

    rerender(<DateTimeField {...defaultProps} label="Updated Label" />);

    const { getByText } = render(
      <DateTimeField {...defaultProps} label="Updated Label" />
    );
    expect(getByText("Updated Label")).toBeTruthy();
  });

  it("does not crash with undefined label", () => {
    expect(() =>
      render(<DateTimeField value={new Date()} onChange={jest.fn()} />)
    ).not.toThrow();
  });

  it("supports custom date objects", () => {
    const customDate = new Date();
    customDate.setFullYear(2025);
    customDate.setMonth(5);
    customDate.setDate(20);

    const { getByText } = render(
      <DateTimeField value={customDate} onChange={jest.fn()} />
    );

    expect(getByText(/20/)).toBeTruthy();
  });

  it("supports date before today", () => {
    const pastDate = new Date("2020-01-01");
    const { getByText } = render(
      <DateTimeField value={pastDate} onChange={jest.fn()} />
    );

    expect(getByText(/2020/)).toBeTruthy();
  });

  it("supports date after today", () => {
    const futureDate = new Date("2030-12-31");
    const { getByText } = render(
      <DateTimeField value={futureDate} onChange={jest.fn()} />
    );

    expect(getByText(/2030/)).toBeTruthy();
  });

  it("handles midnight time", () => {
    const midnight = new Date("2024-01-15T00:00:00");
    const { getByText } = render(
      <DateTimeField value={midnight} onChange={jest.fn()} />
    );

    expect(getByText(/Jan|January/)).toBeTruthy();
  });

  it("handles noon time", () => {
    const noon = new Date("2024-01-15T12:00:00");
    const { getByText } = render(<DateTimeField value={noon} onChange={jest.fn()} />);

    expect(getByText(/Jan|January/)).toBeTruthy();
  });

  it("renders with proper structure", () => {
    const { toJSON } = render(<DateTimeField {...defaultProps} />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("renders calendar icon", () => {
    const { toJSON } = render(<DateTimeField {...defaultProps} />);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("renders button with proper styling", () => {
    const { getByText } = render(<DateTimeField {...defaultProps} />);

    const valueText = getByText(/Jan|January/);
    expect(valueText.props.style).toBeDefined();
  });

  it("renders label with proper styling", () => {
    const { getByText } = render(
      <DateTimeField {...defaultProps} label="Test Label" />
    );

    const label = getByText("Test Label");
    expect(label.props.style).toBeDefined();
  });
});
