/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from "@playwright/test";

import { CalendarPage } from "../pages/CalendarPage";
import { HomePage } from "../pages/HomePage";
import { LogPage } from "../pages/LogPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { SettingsPage } from "../pages/SettingsPage";

/**
 * Test fixtures for E2E tests
 * Provides pre-configured page objects and test utilities
 */

interface Fixtures {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  homePage: HomePage;
  logPage: LogPage;
  calendarPage: CalendarPage;
  settingsPage: SettingsPage;
  testUser: {
    email: string;
    password: string;
  };
  authenticatedPage: {
    loginPage: LoginPage;
    homePage: HomePage;
    logPage: LogPage;
    calendarPage: CalendarPage;
    settingsPage: SettingsPage;
  };
}

// Extend Playwright test with our fixtures
export const test = base.extend<Fixtures>({
  // Test user credentials
  testUser: async ({ ...rest }, use) => {
    const timestamp = Date.now();
    await use({
      email: `testuser+e2e${timestamp}@example.com`,
      password: "TestPass123",
    });
  },

  // Page objects (unauthenticated)
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  logPage: async ({ page }, use) => {
    await use(new LogPage(page));
  },

  calendarPage: async ({ page }, use) => {
    await use(new CalendarPage(page));
  },

  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },

  // Authenticated page objects (automatically logs in before test)
  authenticatedPage: async (
    {
      page,
      testUser,
      loginPage,
      homePage,
      logPage,
      calendarPage,
      settingsPage,
    },
    use,
  ) => {
    // Setup: Login before test
    await loginPage.goto();
    await loginPage.loginAndNavigate(testUser.email, testUser.password);
    await homePage.waitForLoad();

    // Provide authenticated page objects
    await use({
      loginPage,
      homePage,
      logPage,
      calendarPage,
      settingsPage,
    });

    // Teardown: Clear storage after test
    await page.evaluate(() => localStorage.clear());
  },
});

// Export expect from Playwright
export { expect };
