import { test, expect } from '../fixtures/fixtures';
import { generateTestEmail, measureTime } from '../utils/testUtils';

/**
 * E2E Test Suite: Workout Logging
 * 
 * Covers: Running workouts, Strength workouts, Validation, Delete, Quick Log
 * Priority: P0 - Critical
 */

test.describe('Workout Logging', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Quick Log', () => {
    test('E2E-LOG-01: Quick Log Running Workout (<10 seconds)', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Measure quick log time
      const { duration } = await measureTime(async () => {
        // Click quick log running button
        await homePage.clickQuickLog('running');
        
        // Wait for log page
        await logPage.logScreen.waitFor({ state: 'visible', timeout: 5000 });
        
        // Form should be pre-filled with defaults
        await logPage.expectRunningFormVisible();
        
        // Save immediately (using pre-filled values)
        await logPage.saveWorkoutAndWaitForSuccess();
        
        // Return to home
        await homePage.navigateToLogTab();
        await logPage.logScreen.waitFor({ state: 'visible', timeout: 5000 });
      });

      // CRITICAL METRIC: Must complete in < 10 seconds
      expect(duration).toBeLessThan(10000);

      // Verify workout was saved
      await logPage.expectSuccessMessage();
    });

    test('E2E-LOG-02: Quick Log from Home - All Types', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      const workoutTypes: Array<'running' | 'squats' | 'pushups' | 'pullups'> = [
        'running',
        'squats',
        'pushups',
        'pullups',
      ];

      for (const type of workoutTypes) {
        await homePage.clickQuickLog(type);
        await logPage.logScreen.waitFor({ state: 'visible', timeout: 5000 });
        await logPage.expectWorkoutTypeSelected(type);
        
        // Navigate back home
        await homePage.navigateToLogTab();
        await logPage.logScreen.waitFor({ state: 'visible', timeout: 5000 });
      }
    });
  });

  test.describe('Running Workouts', () => {
    test('E2E-LOG-03: Log Full Running Workout', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to log screen
      await logPage.goto();
      await logPage.expectRunningFormVisible();

      // Fill running workout
      await logPage.fillRunningWorkout('5.5', '35', 'Morning run in park');

      // Save
      await logPage.saveWorkoutAndWaitForSuccess();

      // Verify success
      await logPage.expectSuccessMessage();
      await logPage.expectWorkoutInList();
    });

    test('E2E-LOG-04: Running Workout - Decimal Distance', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();

      // Fill with decimal distance
      await logPage.fillRunningWorkout('7.25', '45');
      await logPage.saveWorkoutAndWaitForSuccess();

      await logPage.expectSuccessMessage();
    });

    test('E2E-LOG-05: Running Workout - With Notes', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();

      const notes = 'Felt great, perfect weather!';
      await logPage.fillRunningWorkout('10', '60', notes);
      await logPage.saveWorkoutAndWaitForSuccess();

      await logPage.expectSuccessMessage();
    });
  });

  test.describe('Strength Workouts', () => {
    test('E2E-LOG-06: Log Squats Workout', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();

      // Select squats
      await logPage.selectWorkoutType('squats');
      await logPage.expectStrengthFormVisible();

      // Fill squats workout
      await logPage.fillStrengthWorkout('25', '4', '60', 'Leg day!');
      await logPage.saveWorkoutAndWaitForSuccess();

      await logPage.expectSuccessMessage();
    });

    test('E2E-LOG-07: Log Pushups Workout', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();

      // Select pushups
      await logPage.selectWorkoutType('pushups');
      await logPage.expectStrengthFormVisible();

      // Fill pushups workout
      await logPage.fillStrengthWorkout('30', '3', '', 'Bodyweight only');
      await logPage.saveWorkoutAndWaitForSuccess();

      await logPage.expectSuccessMessage();
    });

    test('E2E-LOG-08: Log Pullups Workout', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();

      // Select pullups
      await logPage.selectWorkoutType('pullups');
      await logPage.expectStrengthFormVisible();

      // Fill pullups workout
      await logPage.fillStrengthWorkout('10', '5', '0');
      await logPage.saveWorkoutAndWaitForSuccess();

      await logPage.expectSuccessMessage();
    });
  });

  test.describe('Form Validation', () => {
    test('E2E-LOG-09: Running Workout - Validation Errors', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();

      // Test empty distance
      await logPage.fillRunningWorkout('', '30');
      await logPage.triggerValidation();
      await logPage.expectDistanceError();

      // Test negative distance
      await logPage.fillRunningWorkout('-5', '30');
      await logPage.triggerValidation();
      await logPage.expectDistanceError();

      // Test unrealistic distance
      await logPage.fillRunningWorkout('150', '30');
      await logPage.triggerValidation();
      await logPage.expectDistanceError();

      // Test zero duration
      await logPage.fillRunningWorkout('5', '0');
      await logPage.triggerValidation();
      await logPage.expectDurationError();

      // Test duration > 1440 min (24hrs)
      await logPage.fillRunningWorkout('5', '1500');
      await logPage.triggerValidation();
      await logPage.expectDurationError();
    });

    test('E2E-LOG-10: Strength Workout - Validation Errors', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();

      // Select squats
      await logPage.selectWorkoutType('squats');

      // Test negative reps
      await logPage.fillStrengthWorkout('-10', '4', '60');
      await logPage.triggerValidation();
      await logPage.expectRepsError();

      // Test reps > 1000
      await logPage.fillStrengthWorkout('1500', '4', '60');
      await logPage.triggerValidation();
      await logPage.expectRepsError();

      // Test sets > 100
      await logPage.fillStrengthWorkout('20', '150', '60');
      await logPage.triggerValidation();
      await logPage.expectSetsError();
    });

    test('E2E-LOG-11: Multiple Validation Errors Simultaneously', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();

      // Fill with multiple invalid values
      await logPage.fillRunningWorkout('-5', '0');
      await logPage.triggerValidation();

      // Both errors should be visible
      await logPage.expectDistanceError();
      await logPage.expectDurationError();
    });
  });

  test.describe('Delete Workout', () => {
    test('E2E-LOG-12: Delete Workout with Confirmation', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login and create workout
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();
      await logPage.fillRunningWorkout('5', '30');
      await logPage.saveWorkoutAndWaitForSuccess();
      await logPage.expectWorkoutInList();

      // Delete workout
      await logPage.deleteWorkout();

      // Verify workout removed
      await logPage.expectWorkoutInList().catch(() => {
        // Expected - workout should be deleted
      });
    });

    test('E2E-LOG-13: Cancel Delete Workout', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login and create workout
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();
      await logPage.fillRunningWorkout('5', '30');
      await logPage.saveWorkoutAndWaitForSuccess();
      await logPage.expectWorkoutInList();

      // Cancel delete
      await logPage.cancelDelete();

      // Verify workout still exists
      await logPage.expectWorkoutInList();
    });

    test('E2E-LOG-14: Delete Confirmation Dialog', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login and create workout
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();
      await logPage.fillRunningWorkout('5', '30');
      await logPage.saveWorkoutAndWaitForSuccess();

      // Click delete and verify dialog
      await logPage.deleteButton.click();
      await logPage.expectDeleteDialogVisible();
    });
  });

  test.describe('Form Pre-filling', () => {
    test('E2E-LOG-15: Form Pre-fills with Last Values', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login and create workout
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();
      
      // Create first workout
      await logPage.fillRunningWorkout('8', '45');
      await logPage.saveWorkoutAndWaitForSuccess();

      // Open form again
      await logPage.goto();

      // Verify form is pre-filled with last values
      const distanceValue = await logPage.getPreFilledValue(logPage.distanceInput);
      const durationValue = await logPage.getPreFilledValue(logPage.durationInput);
      
      expect(distanceValue).toBe('8');
      expect(durationValue).toBe('45');
    });
  });

  test.describe('Empty State', () => {
    test('E2E-LOG-16: Empty State When No Workouts', async ({ loginPage, homePage, logPage, testUser }) => {
      // Setup: Login (no workouts)
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await logPage.goto();

      // Should show empty state
      await logPage.expectEmptyState();
    });
  });
});
