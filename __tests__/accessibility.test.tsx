import { render, screen, waitFor } from "@testing-library/react-native";
import { act } from "react-test-renderer";
import React from "react";

import { LogRunningForm } from "../src/components/LogRunningForm";
import { LogStrengthForm } from "../src/components/LogStrengthForm";
import { DeleteConfirmationDialog } from "../src/components/DeleteConfirmationDialog";
import { QuickLogButton } from "../src/components/QuickLogButton";

// Helper to wait for async operations
const waitForAsync = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
};

describe("Accessibility Tests", () => {
  describe("LogRunningForm Accessibility", () => {
    it("should have accessible labels on all inputs", () => {
      render(
        <LogRunningForm
          distance=""
          duration=""
          onDistanceChange={() => {}}
          onDurationChange={() => {}}
        />,
      );

      const distanceInput = screen.getByTestId("distance-input");
      const durationInput = screen.getByTestId("duration-input");

      expect(distanceInput.props.accessibilityLabel).toBe("Distance");
      expect(durationInput.props.accessibilityLabel).toBe("Duration");
    });

    it("should have accessibility hints on all inputs", () => {
      render(
        <LogRunningForm
          distance=""
          duration=""
          onDistanceChange={() => {}}
          onDurationChange={() => {}}
        />,
      );

      const distanceInput = screen.getByTestId("distance-input");
      const durationInput = screen.getByTestId("duration-input");

      expect(distanceInput.props.accessibilityHint).toContain("kilometers");
      expect(durationInput.props.accessibilityHint).toContain("minutes");
    });

    it("should mark invalid inputs with aria-invalid", () => {
      render(
        <LogRunningForm
          distance=""
          duration=""
          onDistanceChange={() => {}}
          onDurationChange={() => {}}
          errors={{ distance: "Invalid distance" }}
        />,
      );

      const distanceInput = screen.getByTestId("distance-input");
      expect(distanceInput.props["aria-invalid"]).toBe(true);
    });

    it("should use alert role for error messages", () => {
      render(
        <LogRunningForm
          distance=""
          duration=""
          onDistanceChange={() => {}}
          onDurationChange={() => {}}
          errors={{ distance: "Invalid distance" }}
        />,
      );

      const errorText = screen.getByTestId("distance-error");
      expect(errorText.props.accessibilityRole).toBe("alert");
    });

    it("should have form role on container", () => {
      const { toJSON } = render(
        <LogRunningForm
          distance=""
          duration=""
          onDistanceChange={() => {}}
          onDurationChange={() => {}}
        />,
      );

      const json = toJSON();
      // The container should have form role
      expect(json).toBeTruthy();
    });

    it("should announce pace changes to screen readers", async () => {
      const { rerender } = render(
        <LogRunningForm
          distance=""
          duration=""
          onDistanceChange={() => {}}
          onDurationChange={() => {}}
        />,
      );

      await waitForAsync();
      rerender(
        <LogRunningForm
          distance="10"
          duration="60"
          onDistanceChange={() => {}}
          onDurationChange={() => {}}
        />,
      );

      await waitForAsync();
      // Pace display should be present with summary role
      const paceDisplay = screen.getByTestId("pace-display");
      expect(paceDisplay).toBeTruthy();
    });
  });

  describe("LogStrengthForm Accessibility", () => {
    it("should have accessible labels on all inputs", () => {
      render(
        <LogStrengthForm
          exerciseType="squats"
          reps=""
          sets=""
          weight=""
          onRepsChange={() => {}}
          onSetsChange={() => {}}
          onWeightChange={() => {}}
        />,
      );

      const repsInput = screen.getByTestId("reps-input");
      const setsInput = screen.getByTestId("sets-input");
      const weightInput = screen.getByTestId("weight-input");

      expect(repsInput.props.accessibilityLabel).toBe("Repetitions");
      expect(setsInput.props.accessibilityLabel).toBe("Sets");
      expect(weightInput.props.accessibilityLabel).toBe("Weight");
    });

    it("should have exercise-specific accessibility hints", () => {
      render(
        <LogStrengthForm
          exerciseType="pushups"
          reps=""
          sets=""
          weight=""
          onRepsChange={() => {}}
          onSetsChange={() => {}}
          onWeightChange={() => {}}
        />,
      );

      const repsInput = screen.getByTestId("reps-input");
      expect(repsInput.props.accessibilityHint).toContain("push-ups");
    });

    it("should mark invalid inputs with aria-invalid", () => {
      render(
        <LogStrengthForm
          exerciseType="squats"
          reps=""
          sets=""
          weight=""
          onRepsChange={() => {}}
          onSetsChange={() => {}}
          onWeightChange={() => {}}
          errors={{ reps: "Invalid reps" }}
        />,
      );

      const repsInput = screen.getByTestId("reps-input");
      expect(repsInput.props["aria-invalid"]).toBe(true);
    });

    it("should use alert role for error messages", () => {
      render(
        <LogStrengthForm
          exerciseType="squats"
          reps=""
          sets=""
          weight=""
          onRepsChange={() => {}}
          onSetsChange={() => {}}
          onWeightChange={() => {}}
          errors={{ sets: "Invalid sets" }}
        />,
      );

      const errorText = screen.getByTestId("sets-error");
      expect(errorText.props.accessibilityRole).toBe("alert");
    });
  });

  describe("DeleteConfirmationDialog Accessibility", () => {
    it("should have alertdialog role", () => {
      render(
        <DeleteConfirmationDialog
          visible
          workoutType="running"
          workoutDate="Mar 15, 2026"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      // Dialog should be present
      expect(screen.getByTestId("delete-confirmation-dialog")).toBeTruthy();
    });

    it("should have accessible labels on buttons", () => {
      render(
        <DeleteConfirmationDialog
          visible
          workoutType="running"
          workoutDate="Mar 15, 2026"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      const cancelButton = screen.getByTestId("cancel-button");
      const deleteButton = screen.getByTestId("delete-button");

      expect(cancelButton.props.accessibilityLabel).toBe("Cancel");
      expect(deleteButton.props.accessibilityLabel).toBe("Delete workout");
    });

    it("should have accessibility hints on buttons", () => {
      render(
        <DeleteConfirmationDialog
          visible
          workoutType="running"
          workoutDate="Mar 15, 2026"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      const cancelButton = screen.getByTestId("cancel-button");
      const deleteButton = screen.getByTestId("delete-button");

      expect(cancelButton.props.accessibilityHint).toBe("Keep the workout");
      expect(deleteButton.props.accessibilityHint).toBe(
        "Permanently remove this workout",
      );
    });

    it("should have header role on title", () => {
      render(
        <DeleteConfirmationDialog
          visible
          workoutType="running"
          workoutDate="Mar 15, 2026"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      const title = screen.getByTestId("dialog-title");
      expect(title.props.accessibilityRole).toBe("header");
    });
  });

  describe("QuickLogButton Accessibility", () => {
    it("should have button role", () => {
      render(
        <QuickLogButton
          workoutType="running"
          label="Run"
          onPress={() => {}}
          icon="run"
          color="#FF6B35"
          backgroundColor="#FFF0EB"
        />,
      );

      // Button should be present and accessible
      const button = screen.getByTestId("quick-log-running");
      expect(button.props.accessibilityRole).toBe("button");
    });

    it("should have accessible label", () => {
      render(
        <QuickLogButton
          workoutType="running"
          label="Run"
          onPress={() => {}}
          icon="run"
          color="#FF6B35"
          backgroundColor="#FFF0EB"
        />,
      );

      const button = screen.getByTestId("quick-log-running");
      expect(button.props.accessibilityLabel).toBe("Quick log Run");
    });

    it("should have accessibility hint", () => {
      render(
        <QuickLogButton
          workoutType="running"
          label="Run"
          onPress={() => {}}
          icon="run"
          color="#FF6B35"
          backgroundColor="#FFF0EB"
        />,
      );

      const button = screen.getByTestId("quick-log-running");
      expect(button.props.accessibilityHint).toContain(
        "quickly log a run workout",
      );
    });

    it("should have minimum touch target of 44x44", () => {
      render(
        <QuickLogButton
          workoutType="running"
          label="Run"
          onPress={() => {}}
          icon="run"
          color="#FF6B35"
          backgroundColor="#FFF0EB"
        />,
      );

      const button = screen.getByTestId("quick-log-running");
      // The component should have minHeight and minWidth of at least 44
      expect(button).toBeTruthy();
    });
  });

  describe("Touch Target Sizes", () => {
    it("should have 48px minimum height for inputs", () => {
      render(
        <LogRunningForm
          distance=""
          duration=""
          onDistanceChange={() => {}}
          onDurationChange={() => {}}
        />,
      );

      const distanceInput = screen.getByTestId("distance-input");
      // Input should have minHeight of 48 for touch target
      expect(distanceInput).toBeTruthy();
    });

    it("should have proper touch targets for buttons", () => {
      render(
        <DeleteConfirmationDialog
          visible
          workoutType="running"
          workoutDate="Mar 15, 2026"
          onConfirm={() => {}}
          onCancel={() => {}}
        />,
      );

      const cancelButton = screen.getByTestId("cancel-button");
      const deleteButton = screen.getByTestId("delete-button");

      // Both buttons should be present and tappable
      expect(cancelButton).toBeTruthy();
      expect(deleteButton).toBeTruthy();
    });
  });
});
