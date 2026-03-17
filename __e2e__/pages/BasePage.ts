import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object Model
 * Provides common functionality for all page objects
 */
export class BasePage {
  readonly page: Page;
  readonly baseURL: string;

  constructor(page: Page) {
    this.page = page;
    this.baseURL = process.env.WEB_URL || 'http://localhost:8081';
  }

  /**
   * Navigate to a relative path
   */
  async navigateTo(path: string = '/') {
    await this.page.goto(`${this.baseURL}${path}`);
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Take a screenshot
   */
  async screenshot(name: string) {
    await this.page.screenshot({
      path: `playwright-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /**
   * Clear localStorage (useful for logout tests)
   */
  async clearStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Get text content of a locator
   */
  async getLocatorText(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to be enabled
   */
  async waitForEnabled(locator: Locator, timeout: number = 5000) {
    await locator.waitFor({ state: 'enabled', timeout });
  }

  /**
   * Click with retry
   */
  async clickWithRetry(locator: Locator, retries: number = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await locator.click({ timeout: 3000 });
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(500);
      }
    }
  }
}
