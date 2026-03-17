import { Page, Locator, expect } from "@playwright/test";

import { BasePage } from "./BasePage";

/**
 * Log Workout Page Object Model
 * Handles all interactions with the workout logging screen
 */
export class LogPage extends BasePage {
  // Locators
  readonly logScreen: Locator;
  readonly workoutTypeSelector: Locator;
  readonly runningTypeButton: Locator;
  readonly squatsTypeButton: Locator;
  readonly pushupsTypeButton: Locator;
  readonly pullupsTypeButton: Locator;

  // Running form fields
  readonly distanceInput: Locator;
  readonly durationInput: Locator;
  readonly distanceError: Locator;
  readonly durationError: Locator;

  // Strength form fields
  readonly repsInput: Locator;
  readonly setsInput: Locator;
  readonly weightInput: Locator;
  readonly repsError: Locator;
  readonly setsError: Locator;
  readonly weightError: Locator;

  // Common fields
  readonly notesInput: Locator;
  readonly dateTimePicker: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // Delete functionality
  readonly deleteButton: Locator;
  readonly deleteConfirmationDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly cancelDeleteButton: Locator;

  // Workout list
  readonly workoutList: Locator;
  readonly workoutItem: Locator;
  readonly emptyStateMessage: Locator;

  // Success/error messages
  readonly successToast: Locator;
  readonly formErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.logScreen = page
      .getByText("Log Workout", { exact: false })
      .or(page.getByTestId("log-screen"));

    // Workout type selectors
    this.workoutTypeSelector = page
      .getByTestId("workout-type-selector")
      .or(page.getByRole("tabgroup"));
    this.runningTypeButton = page
      .getByTestId("type-running")
      .or(page.getByText("Running", { exact: false }).first());
    this.squatsTypeButton = page
      .getByTestId("type-squats")
      .or(page.getByText("Squats", { exact: false }));
    this.pushupsTypeButton = page
      .getByTestId("type-pushups")
      .or(page.getByText("Pushups", { exact: false }));
    this.pullupsTypeButton = page
      .getByTestId("type-pullups")
      .or(page.getByText("Pullups", { exact: false }));

    // Running fields
    this.distanceInput = page
      .getByTestId("distance-input")
      .or(
        page
          .getByLabel("Distance", { exact: false })
          .or(page.getByPlaceholder(/distance/i)),
      );
    this.durationInput = page
      .getByTestId("duration-input")
      .or(
        page
          .getByLabel("Duration", { exact: false })
          .or(page.getByPlaceholder(/duration/i)),
      );
    this.distanceError = page
      .getByTestId("distance-error")
      .or(page.getByText(/valid distance/i));
    this.durationError = page
      .getByTestId("duration-error")
      .or(page.getByText(/valid duration/i));

    // Strength fields
    this.repsInput = page
      .getByTestId("reps-input")
      .or(
        page
          .getByLabel("Reps", { exact: false })
          .or(page.getByPlaceholder(/reps/i)),
      );
    this.setsInput = page
      .getByTestId("sets-input")
      .or(
        page
          .getByLabel("Sets", { exact: false })
          .or(page.getByPlaceholder(/sets/i)),
      );
    this.weightInput = page
      .getByTestId("weight-input")
      .or(
        page
          .getByLabel("Weight", { exact: false })
          .or(page.getByPlaceholder(/weight/i)),
      );
    this.repsError = page
      .getByTestId("reps-error")
      .or(page.getByText(/valid reps/i));
    this.setsError = page
      .getByTestId("sets-error")
      .or(page.getByText(/valid sets/i));
    this.weightError = page
      .getByTestId("weight-error")
      .or(page.getByText(/valid weight/i));

    // Common fields
    this.notesInput = page
      .getByTestId("notes-input")
      .or(
        page
          .getByLabel("Notes", { exact: false })
          .or(page.getByPlaceholder(/notes/i)),
      );
    this.dateTimePicker = page
      .getByTestId("datetime-picker")
      .or(page.getByText("Date", { exact: false }).first());
    this.saveButton = page
      .getByTestId("save-workout-button")
      .or(
        page
          .getByText("Save", { exact: false })
          .or(page.getByText("Log Workout", { exact: false }).last()),
      );
    this.cancelButton = page
      .getByTestId("cancel-button")
      .or(page.getByText("Cancel", { exact: false }));

    // Delete functionality
    this.deleteButton = page
      .getByTestId("delete-workout-button")
      .or(page.getByText("Delete", { exact: false }).first());
    this.deleteConfirmationDialog = page
      .getByTestId("delete-confirmation-dialog")
      .or(
        page.getByText(/are you sure/i).or(page.getByText(/cannot be undone/i)),
      );
    this.confirmDeleteButton = page
      .getByTestId("delete-button")
      .or(page.getByText("Delete", { exact: false }).last());
    this.cancelDeleteButton = page
      .getByTestId("cancel-button")
      .or(page.getByText("Cancel", { exact: false }).last());

    // Workout list
    this.workoutList = page
      .getByTestId("workout-list")
      .or(page.getByRole("list"));
    this.workoutItem = page.getByTestId("workout-item");
    this.emptyStateMessage = page
      .getByText(/no workouts/i)
      .or(page.getByText(/start logging/i));

    // Messages
    this.successToast = page
      .getByText(/workout logged/i)
      .or(page.getByText(/success/i));
    this.formErrors = page.getByRole("alert");
  }

  /**
   * Navigate to log screen
   */
  async goto() {
    await this.navigateTo("/");
    // Navigate to log tab
    const logTab = this.page
      .getByTestId("tab-log")
      .or(this.page.getByRole("tab", { name: /log/i }));
    await logTab.click();
    await this.logScreen.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Select workout type
   */
  async selectWorkoutType(type: "running" | "squats" | "pushups" | "pullups") {
    const button = this.page.getByTestId(`type-${type}`).or(
      this.page.getByText(type.charAt(0).toUpperCase() + type.slice(1), {
        exact: false,
      }),
    );
    await button.click();
  }

  /**
   * Fill running workout form
   */
  async fillRunningWorkout(distance: string, duration: string, notes?: string) {
    await this.distanceInput.fill(distance);
    await this.durationInput.fill(duration);
    if (notes) {
      await this.notesInput.fill(notes);
    }
  }

  /**
   * Fill strength workout form
   */
  async fillStrengthWorkout(
    reps: string,
    sets: string,
    weight?: string,
    notes?: string,
  ) {
    await this.repsInput.fill(reps);
    await this.setsInput.fill(sets);
    if (weight) {
      await this.weightInput.fill(weight);
    }
    if (notes) {
      await this.notesInput.fill(notes);
    }
  }

  /**
   * Save workout
   */
  async saveWorkout() {
    await this.saveButton.click();
  }

  /**
   * Save workout and wait for success
   */
  async saveWorkoutAndWaitForSuccess() {
    await this.saveButton.click();
    await this.successToast.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Verify workout type is selected
   */
  async expectWorkoutTypeSelected(
    type: "running" | "squats" | "pushups" | "pullups",
  ) {
    const button = this.page.getByTestId(`type-${type}`);
    await expect(button)
      .toHaveAttribute("aria-selected", "true")
      .or(expect(button).toHaveCSS("background-color", /rgb/));
  }

  /**
   * Verify running form fields are visible
   */
  async expectRunningFormVisible() {
    await expect(this.distanceInput).toBeVisible();
    await expect(this.durationInput).toBeVisible();
  }

  /**
   * Verify strength form fields are visible
   */
  async expectStrengthFormVisible() {
    await expect(this.repsInput).toBeVisible();
    await expect(this.setsInput).toBeVisible();
    await expect(this.weightInput).toBeVisible();
  }

  /**
   * Verify validation errors
   */
  async expectDistanceError() {
    await expect(this.distanceError).toBeVisible();
  }

  async expectDurationError() {
    await expect(this.durationError).toBeVisible();
  }

  async expectRepsError() {
    await expect(this.repsError).toBeVisible();
  }

  async expectSetsError() {
    await expect(this.setsError).toBeVisible();
  }

  /**
   * Verify success message
   */
  async expectSuccessMessage() {
    await expect(this.successToast).toBeVisible();
  }

  /**
   * Delete workout
   */
  async deleteWorkout() {
    await this.deleteButton.click();
    await this.deleteConfirmationDialog.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.confirmDeleteButton.click();
  }

  /**
   * Cancel delete
   */
  async cancelDelete() {
    await this.deleteButton.click();
    await this.deleteConfirmationDialog.waitFor({
      state: "visible",
      timeout: 5000,
    });
    await this.cancelDeleteButton.click();
  }

  /**
   * Verify delete dialog is visible
   */
  async expectDeleteDialogVisible() {
    await expect(this.deleteConfirmationDialog).toBeVisible();
  }

  /**
   * Verify workout appears in list
   */
  async expectWorkoutInList() {
    await expect(this.workoutItem.first()).toBeVisible();
  }

  /**
   * Verify empty state
   */
  async expectEmptyState() {
    await expect(this.emptyStateMessage).toBeVisible();
  }

  /**
   * Get pre-filled value from input
   */
  async getPreFilledValue(input: Locator): Promise<string> {
    return await input.inputValue();
  }

  /**
   * Verify form is pre-filled
   */
  async expectFormPreFilled(
    distance?: string,
    duration?: string,
    reps?: string,
    sets?: string,
  ) {
    if (distance) {
      const value = await this.getPreFilledValue(this.distanceInput);
      expect(value).toBe(distance);
    }
    if (duration) {
      const value = await this.getPreFilledValue(this.durationInput);
      expect(value).toBe(duration);
    }
    if (reps) {
      const value = await this.getPreFilledValue(this.repsInput);
      expect(value).toBe(reps);
    }
    if (sets) {
      const value = await this.getPreFilledValue(this.setsInput);
      expect(value).toBe(sets);
    }
  }

  /**
   * Trigger validation by submitting empty form
   */
  async triggerValidation() {
    await this.saveButton.click();
    // Wait for validation errors to appear
    await this.page.waitForTimeout(1000);
  }
}
