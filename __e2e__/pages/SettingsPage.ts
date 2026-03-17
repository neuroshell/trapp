import { Page, Locator, expect } from "@playwright/test";

import { BasePage } from "./BasePage";

/**
 * Settings Page Object Model
 * Handles all interactions with the settings screen
 */
export class SettingsPage extends BasePage {
  // Locators
  readonly settingsScreen: Locator;
  readonly logoutButton: Locator;
  readonly logoutConfirmationDialog: Locator;
  readonly confirmLogoutButton: Locator;
  readonly cancelLogoutButton: Locator;
  readonly userSection: Locator;
  readonly userEmail: Locator;
  readonly syncSettings: Locator;
  readonly appVersion: Locator;

  constructor(page: Page) {
    super(page);
    this.settingsScreen = page
      .getByText("Settings", { exact: false })
      .or(page.getByTestId("settings-screen"));
    this.logoutButton = page
      .getByTestId("logout-button")
      .or(
        page
          .getByText("Logout", { exact: false })
          .or(page.getByText("Sign Out", { exact: false })),
      );
    this.logoutConfirmationDialog = page
      .getByTestId("logout-confirmation-dialog")
      .or(page.getByText(/are you sure/i).or(page.getByText(/logout/i)));
    this.confirmLogoutButton = page
      .getByTestId("confirm-logout-button")
      .or(page.getByText("Logout", { exact: false }).last());
    this.cancelLogoutButton = page
      .getByTestId("cancel-logout-button")
      .or(page.getByText("Cancel", { exact: false }).last());
    this.userSection = page
      .getByTestId("user-section")
      .or(this.settingsScreen.locator('[class*="user"]').first());
    this.userEmail = page
      .getByTestId("user-email")
      .or(this.userSection.locator('[class*="email"]'));
    this.syncSettings = page
      .getByTestId("sync-settings")
      .or(page.getByText("Sync", { exact: false }));
    this.appVersion = page
      .getByTestId("app-version")
      .or(page.getByText(/version/i));
  }

  /**
   * Navigate to settings screen
   */
  async goto() {
    await this.navigateTo("/");
    const settingsTab = this.page
      .getByTestId("tab-settings")
      .or(this.page.getByRole("tab", { name: /settings/i }));
    await settingsTab.click();
    await this.settingsScreen.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Verify settings screen is visible
   */
  async expectSettingsVisible() {
    await expect(this.settingsScreen).toBeVisible();
  }

  /**
   * Click logout button
   */
  async clickLogout() {
    await this.logoutButton.click();
    await this.logoutConfirmationDialog.waitFor({
      state: "visible",
      timeout: 5000,
    });
  }

  /**
   * Confirm logout
   */
  async confirmLogout() {
    await this.confirmLogoutButton.click();
  }

  /**
   * Cancel logout
   */
  async cancelLogout() {
    await this.cancelLogoutButton.click();
    await this.logoutConfirmationDialog.waitFor({
      state: "hidden",
      timeout: 5000,
    });
  }

  /**
   * Logout completely
   */
  async logout() {
    await this.clickLogout();
    await this.confirmLogout();
    // Wait for navigation to login screen
    await this.page.waitForURL(/.*\/.*/, { timeout: 10000 });
  }

  /**
   * Verify logout dialog is visible
   */
  async expectLogoutDialogVisible() {
    await expect(this.logoutConfirmationDialog).toBeVisible();
  }

  /**
   * Verify user email is displayed
   */
  async expectUserEmailVisible() {
    await expect(this.userEmail).toBeVisible();
  }

  /**
   * Get user email text
   */
  async getUserEmail(): Promise<string> {
    return (await this.userEmail.textContent()) || "";
  }

  /**
   * Verify not on settings page (after logout)
   */
  async expectNotOnSettingsPage() {
    await expect(this.settingsScreen).not.toBeVisible();
  }
}
