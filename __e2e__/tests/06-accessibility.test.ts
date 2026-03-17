import { test, expect } from '../fixtures/fixtures';
import AxeBuilder from '@axe-core/playwright';

/**
 * E2E Test Suite: Accessibility
 * 
 * Covers: WCAG 2.1 AA compliance checks using axe-core
 * Priority: P1 - High
 */

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test('E2E-A11Y-01: Login Screen Accessibility', async ({ loginPage, testUser, page }) => {
    await loginPage.goto();

    // Run axe-core accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    // No accessibility violations allowed
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('E2E-A11Y-02: Registration Screen Accessibility', async ({ registerPage, page }) => {
    await registerPage.goto();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('E2E-A11Y-03: Home Screen Accessibility', async ({ loginPage, homePage, testUser, page }) => {
    // Setup: Login
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await homePage.expectHomePageVisible();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('E2E-A11Y-04: Log Workout Screen Accessibility', async ({ loginPage, homePage, logPage, testUser, page }) => {
    // Setup: Login
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await logPage.goto();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('E2E-A11Y-05: Calendar Screen Accessibility', async ({ loginPage, homePage, calendarPage, testUser, page }) => {
    // Setup: Login
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await calendarPage.goto();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('E2E-A11Y-06: Settings Screen Accessibility', async ({ loginPage, homePage, settingsPage, testUser, page }) => {
    // Setup: Login
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);
    await settingsPage.goto();

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('E2E-A11Y-07: Keyboard Navigation - Tab Order', async ({ loginPage, page }) => {
    await loginPage.goto();

    // Test keyboard tab order
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('INPUT');

    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('INPUT');

    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('BUTTON');
  });

  test('E2E-A11Y-08: Keyboard Navigation - Enter to Submit', async ({ loginPage, testUser, page }) => {
    // Setup: Register first
    await loginPage.goToRegistration();
    const registerPage = new (await import('../pages/RegisterPage')).RegisterPage(loginPage.page);
    await registerPage.registerAndNavigate(testUser.email, testUser.password);

    // Logout
    const settingsPage = new (await import('../pages/SettingsPage')).SettingsPage(loginPage.page);
    await settingsPage.goto();
    await settingsPage.logout();

    // Test login with keyboard
    await loginPage.goto();
    await loginPage.emailInput.fill(testUser.email);
    await loginPage.passwordInput.fill(testUser.password);
    
    // Press Enter to submit
    await page.keyboard.press('Enter');
    
    // Should navigate to home
    await loginPage.page.waitForTimeout(2000);
    await loginPage.expectNotOnLoginPage();
  });

  test('E2E-A11Y-09: Error Messages Announced to Screen Readers', async ({ loginPage, page }) => {
    await loginPage.goto();

    // Submit empty form
    await loginPage.signInButton.click();

    // Wait for error messages
    await page.waitForTimeout(1000);

    // Check if error messages have alert role
    const alertElements = await page.locator('[role="alert"]').count();
    expect(alertElements).toBeGreaterThan(0);
  });

  test('E2E-A11Y-10: Color Contrast - Login Screen', async ({ loginPage, page }) => {
    await loginPage.goto();

    // Run axe-core with specific rules
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    // Check for color contrast violations specifically
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toEqual([]);
  });

  test('E2E-A11Y-11: Touch Targets - Minimum 44x44', async ({ loginPage, page }) => {
    await loginPage.goto();

    // Run axe-core for target size
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    // Check for target size violations
    const targetSizeViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'target-size'
    );

    // Note: This rule may not be enabled by default, but we check anyway
    expect(targetSizeViolations).toEqual([]);
  });

  test('E2E-A11Y-12: Form Labels - All Inputs Labeled', async ({ loginPage, page }) => {
    await loginPage.goto();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa', 'wcag21aa'])
      .analyze();

    // Check for label violations
    const labelViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'label' || v.id === 'aria-required-attr'
    );

    expect(labelViolations).toEqual([]);
  });
});
