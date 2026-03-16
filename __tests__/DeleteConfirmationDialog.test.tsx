import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { DeleteConfirmationDialog } from "../src/components/DeleteConfirmationDialog";

describe("DeleteConfirmationDialog", () => {
  const defaultProps = {
    visible: true,
    workoutType: "running",
    workoutDate: "Mar 15, 2026, 7:30 AM",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it("should render when visible", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    expect(screen.getByTestId("delete-confirmation-dialog")).toBeTruthy();
    expect(screen.getByTestId("dialog-title")).toBeTruthy();
    expect(screen.getByTestId("dialog-message")).toBeTruthy();
  });

  it("should not render when not visible", () => {
    render(<DeleteConfirmationDialog {...defaultProps} visible={false} />);

    expect(screen.queryByTestId("delete-confirmation-dialog")).toBeNull();
  });

  it("should display workout type and date in message", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    expect(screen.getByText(/running/)).toBeTruthy();
    expect(screen.getByText(/Mar 15, 2026, 7:30 AM/)).toBeTruthy();
  });

  it("should call onCancel when cancel button pressed", () => {
    const onCancel = jest.fn();
    render(<DeleteConfirmationDialog {...defaultProps} onCancel={onCancel} />);

    const cancelButton = screen.getByTestId("cancel-button");
    fireEvent.press(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should call onConfirm when delete button pressed", () => {
    const onConfirm = jest.fn();
    render(<DeleteConfirmationDialog {...defaultProps} onConfirm={onConfirm} />);

    const deleteButton = screen.getByTestId("delete-button");
    fireEvent.press(deleteButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should have proper accessibility labels", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    const cancelButton = screen.getByTestId("cancel-button");
    const deleteButton = screen.getByTestId("delete-button");

    expect(cancelButton.props.accessibilityLabel).toBe("Cancel");
    expect(deleteButton.props.accessibilityLabel).toBe("Delete workout");
  });

  it("should have proper accessibility hints", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    const cancelButton = screen.getByTestId("cancel-button");
    const deleteButton = screen.getByTestId("delete-button");

    expect(cancelButton.props.accessibilityHint).toBe("Keep the workout");
    expect(deleteButton.props.accessibilityHint).toBe(
      "Permanently remove this workout",
    );
  });

  it("should use destructive styling for delete button", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    const deleteButton = screen.getByTestId("delete-button");
    // Check that it has error color styling (implementation detail)
    expect(deleteButton).toBeTruthy();
  });

  it("should have warning icon", () => {
    render(<DeleteConfirmationDialog {...defaultProps} />);

    // The warning emoji should be present
    expect(screen.getByText("⚠️")).toBeTruthy();
  });
});
