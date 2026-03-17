import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { LogRunningForm } from "../src/components/LogRunningForm";
import { LogStrengthForm } from "../src/components/LogStrengthForm";

describe("LogRunningForm", () => {
  const defaultProps = {
    distance: "",
    duration: "",
    onDistanceChange: jest.fn(),
    onDurationChange: jest.fn(),
  };

  it("should render distance and duration inputs", () => {
    render(<LogRunningForm {...defaultProps} />);

    expect(screen.getByTestId("distance-input")).toBeTruthy();
    expect(screen.getByTestId("duration-input")).toBeTruthy();
  });

  it("should display validation errors", () => {
    render(
      <LogRunningForm
        {...defaultProps}
        errors={{
          distance: "Please enter a valid distance",
          duration: "Please enter a valid duration",
        }}
      />,
    );

    expect(screen.getByTestId("distance-error")).toBeTruthy();
    expect(screen.getByTestId("duration-error")).toBeTruthy();
  });

  it("should calculate and display pace when valid values entered", () => {
    const { rerender } = render(<LogRunningForm {...defaultProps} />);

    rerender(
      <LogRunningForm
        distance="10"
        duration="60"
        onDistanceChange={defaultProps.onDistanceChange}
        onDurationChange={defaultProps.onDurationChange}
      />,
    );

    expect(screen.getByTestId("pace-display")).toBeTruthy();
    expect(screen.getByText("6:00 min/km")).toBeTruthy();
  });

  it("should call onDistanceChange when distance input changes", () => {
    const onDistanceChange = jest.fn();
    render(
      <LogRunningForm
        {...defaultProps}
        onDistanceChange={onDistanceChange}
      />,
    );

    const distanceInput = screen.getByTestId("distance-input");
    fireEvent.changeText(distanceInput, "5.5");

    expect(onDistanceChange).toHaveBeenCalledWith("5.5");
  });

  it("should call onDurationChange when duration input changes", () => {
    const onDurationChange = jest.fn();
    render(
      <LogRunningForm
        {...defaultProps}
        onDurationChange={onDurationChange}
      />,
    );

    const durationInput = screen.getByTestId("duration-input");
    fireEvent.changeText(durationInput, "45");

    expect(onDurationChange).toHaveBeenCalledWith("45");
  });

  it("should have proper accessibility labels", () => {
    render(<LogRunningForm {...defaultProps} />);

    const distanceInput = screen.getByTestId("distance-input");
    const durationInput = screen.getByTestId("duration-input");

    expect(distanceInput.props.accessibilityLabel).toBe("Distance");
    expect(durationInput.props.accessibilityLabel).toBe("Duration");
  });
});

describe("LogStrengthForm", () => {
  const defaultProps = {
    exerciseType: "squats" as const,
    reps: "",
    sets: "",
    weight: "",
    onRepsChange: jest.fn(),
    onSetsChange: jest.fn(),
    onWeightChange: jest.fn(),
  };

  it("should render reps, sets, and weight inputs", () => {
    render(<LogStrengthForm {...defaultProps} />);

    expect(screen.getByTestId("reps-input")).toBeTruthy();
    expect(screen.getByTestId("sets-input")).toBeTruthy();
    expect(screen.getByTestId("weight-input")).toBeTruthy();
  });

  it("should display validation errors", () => {
    render(
      <LogStrengthForm
        {...defaultProps}
        errors={{
          reps: "Please enter valid reps",
          sets: "Please enter valid sets",
          weight: "Please enter valid weight",
        }}
      />,
    );

    expect(screen.getByTestId("reps-error")).toBeTruthy();
    expect(screen.getByTestId("sets-error")).toBeTruthy();
    expect(screen.getByTestId("weight-error")).toBeTruthy();
  });

  it("should calculate and display total volume", () => {
    const { rerender } = render(<LogStrengthForm {...defaultProps} />);

    rerender(
      <LogStrengthForm
        {...defaultProps}
        reps="20"
        sets="3"
        onRepsChange={defaultProps.onRepsChange}
        onSetsChange={defaultProps.onSetsChange}
        onWeightChange={defaultProps.onWeightChange}
      />,
    );

    expect(screen.getByTestId("volume-display")).toBeTruthy();
    expect(screen.getByText("60 reps")).toBeTruthy();
  });

  it("should display volume with weight when provided", () => {
    const { rerender } = render(<LogStrengthForm {...defaultProps} />);

    rerender(
      <LogStrengthForm
        {...defaultProps}
        reps="20"
        sets="3"
        weight="50"
        onRepsChange={defaultProps.onRepsChange}
        onSetsChange={defaultProps.onSetsChange}
        onWeightChange={defaultProps.onWeightChange}
      />,
    );

    expect(screen.getByText("60 reps × 50 kg")).toBeTruthy();
  });

  it("should call onRepsChange when reps input changes", () => {
    const onRepsChange = jest.fn();
    render(
      <LogStrengthForm
        {...defaultProps}
        onRepsChange={onRepsChange}
      />,
    );

    const repsInput = screen.getByTestId("reps-input");
    fireEvent.changeText(repsInput, "25");

    expect(onRepsChange).toHaveBeenCalledWith("25");
  });

  it("should call onSetsChange when sets input changes", () => {
    const onSetsChange = jest.fn();
    render(
      <LogStrengthForm
        {...defaultProps}
        onSetsChange={onSetsChange}
      />,
    );

    const setsInput = screen.getByTestId("sets-input");
    fireEvent.changeText(setsInput, "4");

    expect(onSetsChange).toHaveBeenCalledWith("4");
  });

  it("should call onWeightChange when weight input changes", () => {
    const onWeightChange = jest.fn();
    render(
      <LogStrengthForm
        {...defaultProps}
        onWeightChange={onWeightChange}
      />,
    );

    const weightInput = screen.getByTestId("weight-input");
    fireEvent.changeText(weightInput, "60");

    expect(onWeightChange).toHaveBeenCalledWith("60");
  });

  it("should show exercise-specific labels", () => {
    const { rerender } = render(<LogStrengthForm {...defaultProps} />);

    rerender(
      <LogStrengthForm
        {...defaultProps}
        exerciseType="pushups"
        onRepsChange={defaultProps.onRepsChange}
        onSetsChange={defaultProps.onSetsChange}
        onWeightChange={defaultProps.onWeightChange}
      />,
    );

    const repsInput = screen.getByTestId("reps-input");
    expect(repsInput.props.accessibilityHint).toContain("push-ups");
  });
});
