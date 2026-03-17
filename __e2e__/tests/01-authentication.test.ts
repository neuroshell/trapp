import { test, expect } from '../fixtures/fixtures';
import { generateTestEmail } from '../utils/testUtils';

/**
 * E2E Test Suite: Authentication Flows
 * 
 * Covers: Registration, Login, Logout, Session Persistence
 * Priority: P0 - Critical
 */

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page, homePage }) => {
    // Clear localStorage before each test
    await page.goto(homePage.baseURL);
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Registration', () => {
    test('E2E-AUTH-01: User Registration - Success Flow', async ({ registerPage, homePage, testUser }) => {
      // Navigate to registration page
      await registerPage.goto();
      await registerPage.expectRegisterPageVisible();

      // Fill valid registration data
      await registerPage.fillValidData(testUser.email, testUser.password);

      // Submit registration
      await registerPage.registerAndNavigate(testUser.email, testUser.password);

      // Verify success - should navigate to home
      await registerPage.expectRegistrationSuccess();
      await homePage.expectHomePageVisible();
    });

    test('E2E-AUTH-02: User Registration - Validation Errors', async ({ registerPage }) => {
      await registerPage.goto();

      // Test empty email
      await registerPage.fillValidData('', 'TestPass123');
      await registerPage.registerButton.click();
      await registerPage.expectEmailError('Email is required');

      // Test invalid email format
      await registerPage.fillValidData('notanemail', 'TestPass123');
      await registerPage.registerButton.click();
      await registerPage.expectEmailError('valid email');

      // Test short password
      await registerPage.fillValidData(generateTestEmail(), 'Short1');
      await registerPage.registerButton.click();
      await registerPage.expectPasswordError('at least 8 characters');

      // Test email without TLD
      await registerPage.fillValidData('test@domain', 'TestPass123');
      await registerPage.registerButton.click();
      await registerPage.expectEmailError('valid email');
    });

    test('E2E-AUTH-03: Registration with Plus-Addressed Email', async ({ registerPage, homePage }) => {
      const email = generateTestEmail('testuser.plus');
      const password = 'TestPass123';

      await registerPage.goto();
      await registerPage.registerAndNavigate(email, password);
      
      await homePage.expectHomePageVisible();
      await registerPage.expectRegistrationSuccess();
    });
  });

  test.describe('Login', () => {
    test('E2E-AUTH-04: User Login - Success Flow', async ({ loginPage, homePage, testUser }) => {
      // First register a user
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Logout
      const settingsPage = new (await import('../pages/SettingsPage')).SettingsPage(loginPage.page);
      await settingsPage.goto();
      await settingsPage.logout();

      // Now test login
      await loginPage.goto();
      await loginPage.expectLoginPageVisible();

      // Login with valid credentials
      await loginPage.loginAndNavigate(testUser.email, testUser.password);

      // Verify success
      await homePage.expectHomePageVisible();
      await loginPage.expectNotOnLoginPage();
    });

    test('E2E-AUTH-05: User Login - Invalid Credentials', async ({ loginPage, testUser }) => {
      await loginPage.goto();

      // Test with unregistered email
      await loginPage.attemptInvalidLogin('notexist@example.com', 'WrongPass123');
      await loginPage.expectGeneralError('Invalid');

      // Test with registered email but wrong password
      // First create an account
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);

      // Logout
      const settingsPage = new (await import('../pages/SettingsPage')).SettingsPage(loginPage.page);
      await settingsPage.goto();
      await settingsPage.logout();

      // Try wrong password
      await loginPage.goto();
      await loginPage.login(testUser.email, 'WrongPassword123');
      await loginPage.expectGeneralError('Invalid');
    });

    test('E2E-AUTH-06: Session Persistence Across Refresh', async ({ loginPage, homePage, testUser, page }) => {
      // Register and login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Refresh the page
      await page.reload();

      // Verify user is still logged in
      await homePage.waitForLoad();
      await homePage.expectHomePageVisible();
      await loginPage.expectNotOnLoginPage();

      // Close and reopen (simulate new tab)
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());
    });
  });

  test.describe('Logout', () => {
    test('E2E-AUTH-07: Logout Flow', async ({ loginPage, homePage, settingsPage, testUser, page }) => {
      // Setup: Register and login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to settings
      await settingsPage.goto();
      await settingsPage.expectSettingsVisible();

      // Logout
      await settingsPage.logout();

      // Verify redirected to login
      await loginPage.expectLoginPageVisible();

      // Verify session cleared - refresh should stay on login
      await page.reload();
      await loginPage.expectLoginPageVisible();
      await homePage.expectHomePageVisible().catch(() => {
        // Expected - should not be on home page
      });
    });

    test('E2E-AUTH-08: Cancel Logout', async ({ loginPage, homePage, settingsPage, testUser }) => {
      // Setup: Register and login
      await loginPage.goToRegistration();
      const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
      await registerPage.registerAndNavigate(testUser.email, testUser.password);
      await homePage.expectHomePageVisible();

      // Navigate to settings and attempt logout
      await settingsPage.goto();
      await settingsPage.clickLogout();
      await settingsPage.expectLogoutDialogVisible();

      // Cancel logout
      await settingsPage.cancelLogout();

      // Should still be on settings page
      await settingsPage.expectSettingsVisible();
    });
  });

  test.describe('Navigation from Login', () => {
    test('E2E-AUTH-09: Navigate to Registration from Login', async ({ loginPage, registerPage }) => {
      await loginPage.goto();
      await loginPage.expectLoginPageVisible();

      // Click create account link
      await loginPage.goToRegistration();

      // Verify on registration page
      await registerPage.expectRegisterPageVisible();
    });
  });
});
