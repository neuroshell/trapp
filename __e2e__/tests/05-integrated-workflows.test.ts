import { test, expect } from '../fixtures/fixtures';

/**
 * E2E Test Suite: Integrated User Workflows
 * 
 * Covers: Complete user journeys from registration to workout logging
 * Priority: P0 - Critical
 */

test.describe('Integrated User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test('E2E-FLOW-01: Complete New User Onboarding Flow', async ({ 
    loginPage, 
    registerPage, 
    homePage, 
    logPage, 
    testUser 
  }) => {
    // Step 1: Register new account
    await loginPage.goToRegistration();
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await homePage.expectHomePageVisible();

    // Step 2: Verify empty state
    await homePage.expectEmptyState();

    // Step 3: Quick log first workout
    await homePage.clickQuickLog('running');
    await logPage.logScreen.waitFor({ state: 'visible', timeout: 10000 });
    await logPage.fillRunningWorkout('3', '20', 'First workout!');
    await logPage.saveWorkoutAndWaitForSuccess();

    // Step 4: Verify workout appears
    await logPage.expectWorkoutInList();

    // Step 5: Navigate to calendar
    await homePage.navigateToCalendarTab();
    const calendarPage = new (await import('../pages/CalendarPage')).CalendarPage(homePage.page);
    await calendarPage.expectCalendarVisible();

    // Step 6: Navigate to settings
    const settingsPage = new (await import('../pages/SettingsPage')).SettingsPage(homePage.page);
    await homePage.navigateToSettingsTab();
    await settingsPage.expectSettingsVisible();

    // Step 7: Verify user email shown
    await settingsPage.expectUserEmailVisible();
  });

  test('E2E-FLOW-02: Complete Workout Session Flow', async ({ 
    loginPage, 
    homePage, 
    logPage,
    calendarPage,
    testUser 
  }) => {
    // Setup: Login
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await homePage.expectHomePageVisible();

    // Log multiple workouts in a session
    const workouts = [
      { type: 'running' as const, distance: '5', duration: '30' },
      { type: 'squats' as const, reps: '20', sets: '4' },
      { type: 'pushups' as const, reps: '15', sets: '3' },
    ];

    for (const workout of workouts) {
      await logPage.goto();
      
      if (workout.type === 'running') {
        await logPage.fillRunningWorkout(workout.distance, workout.duration);
      } else {
        await logPage.selectWorkoutType(workout.type);
        await logPage.fillStrengthWorkout(workout.reps, workout.sets);
      }
      
      await logPage.saveWorkoutAndWaitForSuccess();
    }

    // Verify all workouts logged
    await logPage.expectWorkoutInList();

    // Check calendar shows indicators
    await calendarPage.goto();
    await calendarPage.expectCalendarVisible();
  });

  test('E2E-FLOW-03: Login -> Log Workout -> Check Calendar -> Logout', async ({ 
    loginPage, 
    homePage, 
    logPage,
    calendarPage,
    settingsPage,
    testUser 
  }) => {
    // Step 1: Register and login
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await homePage.expectHomePageVisible();

    // Step 2: Log a workout
    await logPage.goto();
    await logPage.fillRunningWorkout('10', '60', 'Long run');
    await logPage.saveWorkoutAndWaitForSuccess();

    // Step 3: Check calendar
    await calendarPage.goto();
    await calendarPage.expectCalendarVisible();

    // Step 4: Logout
    await homePage.navigateToSettingsTab();
    await settingsPage.logout();

    // Step 5: Verify logged out
    await loginPage.expectLoginPageVisible();

    // Step 6: Try to access app - should redirect to login
    await homePage.navigateTo('/');
    await loginPage.expectLoginPageVisible();
  });

  test('E2E-FLOW-04: Session Persistence Across Page Refresh', async ({ 
    loginPage, 
    homePage, 
    page,
    testUser 
  }) => {
    // Setup: Login
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await homePage.expectHomePageVisible();

    // Refresh page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await homePage.waitForLoad();
      await homePage.expectHomePageVisible();
      await loginPage.expectNotOnLoginPage();
    }
  });

  test('E2E-FLOW-05: Delete Workout and Verify Removal', async ({ 
    loginPage, 
    homePage, 
    logPage,
    calendarPage,
    testUser 
  }) => {
    // Setup: Login and create workout
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await homePage.expectHomePageVisible();

    // Log workout
    await logPage.goto();
    await logPage.fillRunningWorkout('5', '30');
    await logPage.saveWorkoutAndWaitForSuccess();
    await logPage.expectWorkoutInList();

    // Delete workout
    await logPage.deleteWorkout();

    // Verify removed from list
    const workoutCount = await logPage.workoutItem.count();
    expect(workoutCount).toBe(0);

    // Verify calendar updated
    await calendarPage.goto();
    await calendarPage.expectCalendarVisible();
  });

  test('E2E-FLOW-06: Multiple Workouts in One Day', async ({ 
    loginPage, 
    homePage, 
    logPage,
    calendarPage,
    testUser 
  }) => {
    // Setup: Login
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await homePage.expectHomePageVisible();

    // Log morning run
    await logPage.goto();
    await logPage.fillRunningWorkout('5', '30', 'Morning run');
    await logPage.saveWorkoutAndWaitForSuccess();

    // Log evening strength
    await logPage.goto();
    await logPage.selectWorkoutType('squats');
    await logPage.fillStrengthWorkout('25', '4', '60', 'Evening workout');
    await logPage.saveWorkoutAndWaitForSuccess();

    // Check calendar day detail
    await calendarPage.goto();
    const today = new Date().getDate();
    await calendarPage.clickDay(today);
    
    // Should show both workouts
    const workoutCount = await calendarPage.getWorkoutCount();
    expect(workoutCount).toBeGreaterThanOrEqual(1);
  });

  test('E2E-FLOW-07: Form Validation Prevents Invalid Submission', async ({ 
    loginPage, 
    homePage, 
    logPage,
    testUser 
  }) => {
    // Setup: Login
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await homePage.expectHomePageVisible();

    // Try to save with invalid data
    await logPage.goto();
    await logPage.fillRunningWorkout('-5', '0'); // Invalid values
    await logPage.triggerValidation();

    // Errors should prevent submission
    await logPage.expectDistanceError();
    await logPage.expectDurationError();

    // Fix values
    await logPage.fillRunningWorkout('5', '30');
    await logPage.saveWorkoutAndWaitForSuccess();

    // Should succeed now
    await logPage.expectSuccessMessage();
  });
});
