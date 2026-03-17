import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Home/Dashboard Page Object Model
 * Handles all interactions with the home screen
 */
export class HomePage extends BasePage {
  // Locators
  readonly dashboard: Locator;
  readonly streakTracker: Locator;
  readonly weeklySummary: Locator;
  readonly quickLogButtons: Locator;
  readonly recentActivitySection: Locator;
  readonly recentActivityList: Locator;
  readonly emptyStateMessage: Locator;
  readonly loadingIndicator: Locator;
  readonly syncStatus: Locator;
  readonly headerTitle: Locator;

  // Tab navigation
  readonly homeTab: Locator;
  readonly logTab: Locator;
  readonly calendarTab: Locator;
  readonly achievementsTab: Locator;
  readonly settingsTab: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboard = page.getByTestId('dashboard').or(page.getByText('FitTrack Pro', { exact: false }).first());
    this.streakTracker = page.getByTestId('home-streak-tracker');
    this.weeklySummary = page.getByTestId('home-weekly-summary');
    this.quickLogButtons = page.getByTestId(/quick-log-/);
    this.recentActivitySection = page.getByText('Recent Activity', { exact: false });
    this.recentActivityList = page.getByTestId('recent-activity-list').or(
      this.recentActivitySection.locator('..').locator('[data-testid]')
    );
    this.emptyStateMessage = page.getByText(/no workouts/i).or(
      page.getByText(/start logging/i)
    );
    this.loadingIndicator = page.getByText('Loading...', { exact: false });
    this.syncStatus = page.getByTestId('sync-status').or(
      page.getByText('Online', { exact: false }).or(page.getByText('Offline', { exact: false }))
    );
    this.headerTitle = page.getByText('FitTrack Pro', { exact: false }).first();

    // Tab navigation
    this.homeTab = page.getByTestId('tab-home').or(page.getByRole('tab', { name: /home/i }));
    this.logTab = page.getByTestId('tab-log').or(page.getByRole('tab', { name: /log/i }));
    this.calendarTab = page.getByTestId('tab-calendar').or(page.getByRole('tab', { name: /calendar/i }));
    this.achievementsTab = page.getByTestId('tab-achievements').or(page.getByRole('tab', { name: /achievement/i }));
    this.settingsTab = page.getByTestId('tab-settings').or(page.getByRole('tab', { name: /setting/i }));
  }

  /**
   * Wait for home page to load
   */
  async waitForLoad() {
    await this.dashboard.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Verify home page is displayed
   */
  async expectHomePageVisible() {
    await expect(this.dashboard).toBeVisible();
    await expect(this.headerTitle).toBeVisible();
  }

  /**
   * Verify streak tracker is visible
   */
  async expectStreakTrackerVisible() {
    await expect(this.streakTracker).toBeVisible();
  }

  /**
   * Verify weekly summary is visible
   */
  async expectWeeklySummaryVisible() {
    await expect(this.weeklySummary).toBeVisible();
  }

  /**
   * Get quick log button by type
   */
  getQuickLogButton(type: 'running' | 'squats' | 'pushups' | 'pullups') {
    return this.page.getByTestId(`quick-log-${type}`);
  }

  /**
   * Click quick log button
   */
  async clickQuickLog(type: 'running' | 'squats' | 'pushups' | 'pullups') {
    const button = this.getQuickLogButton(type);
    await button.click();
  }

  /**
   * Verify recent activity section
   */
  async expectRecentActivityVisible() {
    await expect(this.recentActivitySection).toBeVisible();
  }

  /**
   * Verify empty state
   */
  async expectEmptyState() {
    await expect(this.emptyStateMessage).toBeVisible();
  }

  /**
   * Verify workouts are loading
   */
  async expectLoadingState() {
    await expect(this.loadingIndicator).toBeVisible();
  }

  /**
   * Get workout item from recent activity
   */
  getWorkoutItem(index: number = 0) {
    return this.page.getByTestId('workout-item').nth(index);
  }

  /**
   * Verify workout appears in recent activity
   */
  async expectWorkoutInList(workoutType: string) {
    const workoutItem = this.page.getByText(workoutType, { exact: false }).first();
    await expect(workoutItem).toBeVisible();
  }

  /**
   * Navigate to Log screen via tab
   */
  async navigateToLogTab() {
    await this.logTab.click();
  }

  /**
   * Navigate to Calendar screen via tab
   */
  async navigateToCalendarTab() {
    await this.calendarTab.click();
  }

  /**
   * Navigate to Achievements screen via tab
   */
  async navigateToAchievementsTab() {
    await this.achievementsTab.click();
  }

  /**
   * Navigate to Settings screen via tab
   */
  async navigateToSettingsTab() {
    await this.settingsTab.click();
  }

  /**
   * Verify active tab
   */
  async expectActiveTab(tabName: 'home' | 'log' | 'calendar' | 'achievements' | 'settings') {
    const tab = this[`${tabName}Tab` as keyof typeof this] as Locator;
    await expect(tab).toHaveAttribute('aria-selected', 'true').or(
      expect(tab).toHaveCSS('font-weight', '700')
    );
  }

  /**
   * Get streak count
   */
  async getStreakCount(): Promise<number> {
    const streakText = await this.streakTracker.textContent() || '0';
    const match = streakText.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /**
   * Refresh page and verify session persists
   */
  async refreshAndVerifySession() {
    await this.page.reload();
    await this.waitForLoad();
    await expect(this.dashboard).toBeVisible();
  }
}
