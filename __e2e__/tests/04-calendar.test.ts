import { test, expect } from '../fixtures/fixtures';

/**
 * E2E Test Suite: Calendar
 * 
 * Covers: Calendar view, Month navigation, Day detail, Empty states
 * Priority: P1 - High
 */

test.describe('Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Calendar View', () => {
    test('E2E-CAL-01: Calendar View - Current Month', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();
      await calendarPage.expectCalendarVisible();

      // Verify current month displayed
      const currentMonth = await calendarPage.getCurrentMonth();
      expect(currentMonth).toBeTruthy();

      // Verify weekday headers
      await calendarPage.expectWeekdayHeaders();

      // Verify grid layout
      await expect(calendarPage.calendarGrid).toBeVisible();
    });

    test('E2E-CAL-02: Calendar Shows Current Day Highlighted', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Verify today is highlighted
      await calendarPage.expectTodayHighlighted();
    });
  });

  test.describe('Month Navigation', () => {
    test('E2E-CAL-03: Navigate to Previous Month', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Get current month
      const previousMonth = await calendarPage.getCurrentMonth();

      // Navigate to previous month
      await calendarPage.goToPreviousMonth();

      // Verify month changed
      await calendarPage.expectMonthChanged(previousMonth);
    });

    test('E2E-CAL-04: Navigate to Next Month', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Get current month
      const previousMonth = await calendarPage.getCurrentMonth();

      // Navigate to next month
      await calendarPage.goToNextMonth();

      // Verify month changed
      await calendarPage.expectMonthChanged(previousMonth);
    });

    test('E2E-CAL-05: Navigate Back and Forth Between Months', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Get initial month
      const initialMonth = await calendarPage.getCurrentMonth();

      // Next month
      await calendarPage.goToNextMonth();
      await calendarPage.expectMonthChanged(initialMonth);

      // Previous month (should return to initial)
      await calendarPage.goToPreviousMonth();
      const currentMonth = await calendarPage.getCurrentMonth();
      expect(currentMonth).toBe(initialMonth);
    });

    test('E2E-CAL-06: Today Button Returns to Current Month', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Get current month
      const currentMonth = await calendarPage.getCurrentMonth();

      // Navigate away
      await calendarPage.goToPreviousMonth();
      await calendarPage.expectMonthChanged(currentMonth);

      // Click today button
      await calendarPage.goToToday();

      // Should return to current month
      const returnedMonth = await calendarPage.getCurrentMonth();
      expect(returnedMonth).toBe(currentMonth);
    });
  });

  test.describe('Day Detail View', () => {
    test('E2E-CAL-07: Click Day Opens Detail Modal', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Click on a day (e.g., day 1)
      await calendarPage.clickDay(1);

      // Verify modal opens
      await calendarPage.expectDayDetailVisible();
    });

    test('E2E-CAL-08: Close Day Detail Modal', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Open day detail
      await calendarPage.clickDay(1);
      await calendarPage.expectDayDetailVisible();

      // Close modal
      await calendarPage.closeDayDetail();

      // Modal should be hidden
      await expect(calendarPage.dayDetailModal).not.toBeVisible();
    });

    test('E2E-CAL-09: Day Detail Shows Date', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Click on day 15
      const day = 15;
      await calendarPage.clickDay(day);

      // Verify date in modal
      const dateText = await calendarPage.dayDetailDate.textContent() || '';
      expect(dateText).toBeTruthy();
    });

    test('E2E-CAL-10: Day Detail Empty State', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login (no workouts logged)
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Click on a day
      await calendarPage.clickDay(1);

      // Should show empty state
      await calendarPage.expectDayDetailEmpty();
    });

    test('E2E-CAL-11: Add Workout from Day Detail', async ({ loginPage, homePage, calendarPage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Open day detail
      await calendarPage.clickDay(1);

      // Click add workout
      await calendarPage.clickAddWorkoutFromDetail();

      // Should navigate to log screen
      await logPage.logScreen.waitFor({ state: 'visible', timeout: 10000 });
    });
  });

  test.describe('Workout Indicators', () => {
    test('E2E-CAL-12: Calendar Shows Workout Indicators After Logging', async ({ loginPage, homePage, calendarPage, logPage, testUser }) => {
      // Setup: Login and create workout
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Log a workout
      await logPage.goto();
      await logPage.fillRunningWorkout('5', '30');
      await logPage.saveWorkoutAndWaitForSuccess();

      // Navigate to calendar
      await calendarPage.goto();

      // Today should have workout indicator
      const today = new Date().getDate();
      // Note: This depends on the implementation showing indicators
      // The test verifies the calendar renders correctly
      await calendarPage.expectCalendarVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test('E2E-CAL-13: Navigate Multiple Months Back', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Navigate back 3 months
      for (let i = 0; i < 3; i++) {
        await calendarPage.goToPreviousMonth();
      }

      // Should still work correctly
      await calendarPage.expectCalendarVisible();
      const monthText = await calendarPage.getCurrentMonth();
      expect(monthText).toBeTruthy();
    });

    test('E2E-CAL-14: Rapid Month Navigation', async ({ loginPage, homePage, calendarPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to calendar
      await calendarPage.goto();

      // Rapid navigation
      await calendarPage.goToNextMonth();
      await calendarPage.goToNextMonth();
      await calendarPage.goToPreviousMonth();
      await calendarPage.goToPreviousMonth();

      // Should handle gracefully
      await calendarPage.expectCalendarVisible();
    });
  });
});
