import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Calendar Page Object Model
 * Handles all interactions with the calendar screen
 */
export class CalendarPage extends BasePage {
  // Locators
  readonly calendarScreen: Locator;
  readonly calendarGrid: Locator;
  readonly calendarHeader: Locator;
  readonly currentMonthLabel: Locator;
  readonly previousMonthButton: Locator;
  readonly nextMonthButton: Locator;
  readonly todayButton: Locator;
  readonly dayCells: Locator;
  readonly workoutIndicators: Locator;
  readonly dayDetailModal: Locator;
  readonly dayDetailDate: Locator;
  readonly dayDetailWorkouts: Locator;
  readonly dayDetailCloseButton: Locator;
  readonly emptyStateMessage: Locator;
  readonly addWorkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.calendarScreen = page.getByText('Calendar', { exact: false }).or(
      page.getByTestId('calendar-screen')
    );
    this.calendarGrid = page.getByTestId('calendar-grid').or(
      page.getByRole('grid')
    );
    this.calendarHeader = page.getByTestId('calendar-header').or(
      this.calendarScreen.locator('[class*="header"]').first()
    );
    this.currentMonthLabel = page.getByTestId('current-month').or(
      this.calendarHeader.locator('[class*="month"]').or(
        this.calendarHeader.getByText(/\w+ \d{4}/)
      )
    );
    this.previousMonthButton = page.getByTestId('previous-month').or(
      page.getByRole('button', { name: /previous/i }).or(
        page.getByText('‹', { exact: false }).or(
          page.getByText('<', { exact: false })
        )
      )
    );
    this.nextMonthButton = page.getByTestId('next-month').or(
      page.getByRole('button', { name: /next/i }).or(
        page.getByText('›', { exact: false }).or(
          page.getByText('>', { exact: false })
        )
      )
    );
    this.todayButton = page.getByTestId('today-button').or(
      page.getByText('Today', { exact: false })
    );
    this.dayCells = page.getByTestId('calendar-day').or(
      this.calendarGrid.locator('[class*="day"]').or(
        this.calendarGrid.locator('[role="gridcell"]')
      )
    );
    this.workoutIndicators = page.getByTestId('workout-indicator').or(
      this.dayCells.locator('[class*="indicator"]').or(
        this.dayCells.locator('[class*="dot"]')
      )
    );
    this.dayDetailModal = page.getByTestId('day-detail-modal').or(
      page.getByRole('dialog').or(
        page.getByText(/workouts? for/i).locator('..').locator('..')
      )
    );
    this.dayDetailDate = page.getByTestId('day-detail-date').or(
      this.dayDetailModal.locator('[class*="date"]').first()
    );
    this.dayDetailWorkouts = page.getByTestId('day-detail-workouts').or(
      this.dayDetailModal.locator('[class*="workout-list"]')
    );
    this.dayDetailCloseButton = page.getByTestId('day-detail-close').or(
      this.dayDetailModal.getByText('Close', { exact: false }).or(
        this.dayDetailModal.getByRole('button', { name: /close/i })
      )
    );
    this.emptyStateMessage = page.getByText(/no workouts/i).or(
      page.getByText(/nothing logged/i)
    );
    this.addWorkoutButton = page.getByTestId('add-workout-button').or(
      page.getByText('Log Workout', { exact: false }).or(
        page.getByText('Add Workout', { exact: false })
      )
    );
  }

  /**
   * Navigate to calendar screen
   */
  async goto() {
    await this.navigateTo('/');
    const calendarTab = this.page.getByTestId('tab-calendar').or(
      this.page.getByRole('tab', { name: /calendar/i })
    );
    await calendarTab.click();
    await this.calendarScreen.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Verify calendar is visible
   */
  async expectCalendarVisible() {
    await expect(this.calendarScreen).toBeVisible();
    await expect(this.calendarGrid).toBeVisible();
  }

  /**
   * Get current month text
   */
  async getCurrentMonth(): Promise<string> {
    return await this.currentMonthLabel.textContent() || '';
  }

  /**
   * Navigate to previous month
   */
  async goToPreviousMonth() {
    await this.previousMonthButton.click();
    await this.page.waitForTimeout(500); // Wait for animation
  }

  /**
   * Navigate to next month
   */
  async goToNextMonth() {
    await this.nextMonthButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Navigate to current month
   */
  async goToToday() {
    await this.todayButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get day cell by date
   */
  getDayCell(day: number): Locator {
    return this.dayCells.filter({ hasText: day.toString() }).first();
  }

  /**
   * Click on a specific day
   */
  async clickDay(day: number) {
    const dayCell = this.getDayCell(day);
    await dayCell.click();
    await this.dayDetailModal.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Verify day has workout indicator
   */
  async expectDayHasWorkout(day: number) {
    const dayCell = this.getDayCell(day);
    const indicator = dayCell.locator('[class*="indicator"]').or(
      dayCell.locator('[class*="dot"]')
    );
    await expect(indicator.first()).toBeVisible();
  }

  /**
   * Verify day has no workout indicator
   */
  async expectDayNoWorkout(day: number) {
    const dayCell = this.getDayCell(day);
    const indicator = dayCell.locator('[class*="indicator"]').or(
      dayCell.locator('[class*="dot"]')
    );
    await expect(indicator).not.toBeVisible();
  }

  /**
   * Verify day detail modal is visible
   */
  async expectDayDetailVisible() {
    await expect(this.dayDetailModal).toBeVisible();
  }

  /**
   * Get workout count from day detail
   */
  async getWorkoutCount(): Promise<number> {
    try {
      const workouts = this.dayDetailWorkouts.locator('[class*="workout"]');
      return await workouts.count();
    } catch {
      return 0;
    }
  }

  /**
   * Verify workouts listed in day detail
   */
  async expectWorkoutsListed(count: number) {
    const workouts = this.dayDetailWorkouts.locator('[class*="workout"]');
    await expect(workouts).toHaveCount(count);
  }

  /**
   * Verify empty state in day detail
   */
  async expectDayDetailEmpty() {
    await expect(this.emptyStateMessage).toBeVisible();
  }

  /**
   * Close day detail modal
   */
  async closeDayDetail() {
    await this.dayDetailCloseButton.click();
    await this.dayDetailModal.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Click add workout from day detail
   */
  async clickAddWorkoutFromDetail() {
    await this.addWorkoutButton.click();
  }

  /**
   * Verify current day is highlighted
   */
  async expectTodayHighlighted() {
    const today = new Date().getDate();
    const dayCell = this.getDayCell(today);
    await expect(dayCell).toHaveCSS('background-color', /rgb/).or(
      expect(dayCell).toHaveAttribute('aria-current', 'date')
    );
  }

  /**
   * Verify weekday headers
   */
  async expectWeekdayHeaders() {
    const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (const header of headers) {
      const headerElement = this.page.getByText(header, { exact: false });
      await expect(headerElement.first()).toBeVisible();
    }
  }

  /**
   * Verify month navigation changed month
   */
  async expectMonthChanged(previousMonth: string) {
    const currentMonth = await this.getCurrentMonth();
    expect(currentMonth).not.toBe(previousMonth);
  }
}
