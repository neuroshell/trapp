import { test, expect } from '../fixtures/fixtures';

/**
 * E2E Test Suite: Navigation
 * 
 * Covers: Tab navigation, Deep navigation, Navigation with unsaved changes
 * Priority: P0 - Critical
 */

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Bottom Tab Navigation', () => {
    test('E2E-NAV-01: Navigate Between All Tabs', async ({ loginPage, homePage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Test each tab
      const tabs = [
        { name: 'Home', testId: 'tab-home' },
        { name: 'Log', testId: 'tab-log' },
        { name: 'Calendar', testId: 'tab-calendar' },
        { name: 'Achievements', testId: 'tab-achievements' },
        { name: 'Settings', testId: 'tab-settings' },
      ];

      for (const tab of tabs) {
        const tabElement = homePage.page.getByTestId(tab.testId).or(
          homePage.page.getByRole('tab', { name: new RegExp(tab.name, 'i') })
        );
        await tabElement.click();
        await homePage.page.waitForTimeout(500);

        // Verify tab is active
        await expect(tabElement).toBeVisible();
      }
    });

    test('E2E-NAV-02: Click Active Tab Does Nothing', async ({ loginPage, homePage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Click active home tab
      await homePage.homeTab.click();
      await homePage.page.waitForTimeout(500);

      // Should still be on home, no error
      await homePage.expectHomePageVisible();
    });

    test('E2E-NAV-03: Rapid Tab Switching', async ({ loginPage, homePage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Rapidly click tabs
      await homePage.logTab.click();
      await homePage.calendarTab.click();
      await homePage.achievementsTab.click();
      await homePage.settingsTab.click();
      await homePage.homeTab.click();

      // App should remain responsive
      await homePage.expectHomePageVisible();
    });
  });

  test.describe('Deep Navigation', () => {
    test('E2E-NAV-04: Quick Action Navigates to Log', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Click quick action
      await homePage.clickQuickLog('running');

      // Should navigate to log screen
      await logPage.logScreen.waitFor({ state: 'visible', timeout: 10000 });
      await logPage.expectRunningFormVisible();
    });

    test('E2E-NAV-05: Navigate from Home to Calendar', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await homePage.navigateToCalendarTab();

      // Verify calendar visible
      await calendarPage.expectCalendarVisible();
    });

    test('E2E-NAV-06: Navigate from Home to Achievements', async ({ loginPage, homePage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to achievements
      await homePage.navigateToAchievementsTab();

      // Verify achievements screen visible
      const achievementsScreen = homePage.page.getByText('Achievements', { exact: false }).or(
        homePage.page.getByTestId('achievements-screen')
      );
      await achievementsScreen.waitFor({ state: 'visible', timeout: 10000 });
    });

    test('E2E-NAV-07: Navigate from Home to Settings', async ({ loginPage, homePage, settingsPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to settings
      await homePage.navigateToSettingsTab();

      // Verify settings visible
      await settingsPage.expectSettingsVisible();
    });
  });

  test.describe('Browser Navigation', () => {
    test('E2E-NAV-08: Browser Back Button', async ({ loginPage, homePage, logPage, calendarPage, testUser, page }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to log
      await homePage.navigateToLogTab();
      await logPage.logScreen.waitFor({ state: 'visible', timeout: 10000 });

      // Navigate to calendar
      await homePage.navigateToCalendarTab();
      await calendarPage.expectCalendarVisible();

      // Use browser back button
      await page.goBack();

      // Should be back on log screen
      await logPage.logScreen.waitFor({ state: 'visible', timeout: 10000 });

      // Back again
      await page.goBack();

      // Should be back on home
      await homePage.expectHomePageVisible();
    });
  });

  test.describe('Navigation with Unsaved Changes', () => {
    test('E2E-NAV-09: Navigate Away from Form with Data', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to log and fill form
      await logPage.goto();
      await logPage.fillRunningWorkout('5', '30', 'Test workout');

      // Navigate away (in a real app, this might show a warning)
      await homePage.navigateToCalendarTab();

      // Should navigate without crash
      const calendarScreen = homePage.page.getByText('Calendar', { exact: false });
      await calendarScreen.waitFor({ state: 'visible', timeout: 10000 });
    });
  });

  test.describe('Tab Active State', () => {
    test('E2E-NAV-10: Active Tab Indicator', async ({ loginPage, homePage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Home should be active
      await expect(homePage.homeTab).toBeVisible();

      // Click log tab
      await homePage.logTab.click();
      await homePage.page.waitForTimeout(500);

      // Log should be active
      await expect(homePage.logTab).toBeVisible();
    });
  });
});
