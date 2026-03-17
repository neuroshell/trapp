import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Register Page Object Model
 * Handles all interactions with the registration screen
 */
export class RegisterPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly registerButton: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly termsError: Locator;
  readonly loadingIndicator: Locator;
  readonly passwordStrengthIndicator: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email address input', { exact: true }).or(
      page.getByPlaceholder('Enter your email')
    );
    this.passwordInput = page.getByLabel('Password input', { exact: false }).or(
      page.getByPlaceholder('Enter your password')
    );
    this.confirmPasswordInput = page.getByPlaceholder('Confirm password').or(
      page.getByLabel('Confirm password', { exact: false })
    );
    this.termsCheckbox = page.getByRole('checkbox').or(
      page.getByText('Terms', { exact: false }).locator('..').getByRole('checkbox')
    );
    this.registerButton = page.getByTestId('register-button').or(
      page.getByText('Register', { exact: false }).or(
        page.getByText('Create Account', { exact: false })
      )
    );
    this.emailError = page.getByText('valid email', { exact: false });
    this.passwordError = page.getByText('Password must be', { exact: false });
    this.termsError = page.getByText('must accept', { exact: false }).or(
      page.getByText('terms', { exact: false })
    );
    this.loadingIndicator = this.registerButton.getByRole('progressbar');
    this.passwordStrengthIndicator = page.getByText('Password strength', { exact: false });
  }

  /**
   * Navigate to register page
   */
  async goto() {
    await this.navigateTo('/');
    // Wait for login screen, then navigate to register
    const createAccountLink = this.page.getByText('Create Account');
    await createAccountLink.waitFor({ state: 'visible', timeout: 10000 });
    await createAccountLink.click();
    
    // Wait for register screen
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Register a new user
   */
  async register(email: string, password: string, acceptTerms: boolean = true) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    if (this.confirmPasswordInput.isVisible()) {
      await this.confirmPasswordInput.fill(password);
    }
    
    if (acceptTerms && await this.isElementVisible(this.termsCheckbox)) {
      await this.termsCheckbox.check();
    }
    
    await this.registerButton.click();
  }

  /**
   * Register and wait for navigation
   */
  async registerAndNavigate(email: string, password: string) {
    await this.register(email, password);
    // Wait for navigation to home screen
    await this.page.waitForURL(/.*\/.*/, { timeout: 10000 });
  }

  /**
   * Verify registration page is displayed
   */
  async expectRegisterPageVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.registerButton).toBeVisible();
  }

  /**
   * Verify validation errors
   */
  async expectEmailError(message: string) {
    await expect(this.page.getByText(message, { exact: false })).toBeVisible();
  }

  async expectPasswordError(message: string) {
    await expect(this.page.getByText(message, { exact: false })).toBeVisible();
  }

  async expectTermsError() {
    await expect(this.termsError).toBeVisible();
  }

  /**
   * Verify success state
   */
  async expectRegistrationSuccess() {
    // Should navigate away from register page
    await expect(this.emailInput).not.toBeVisible();
  }

  /**
   * Verify loading state
   */
  async expectLoadingState() {
    await expect(this.loadingIndicator).toBeVisible();
  }

  /**
   * Fill form with invalid data
   */
  async fillInvalidData() {
    await this.emailInput.fill('invalid-email');
    await this.passwordInput.fill('short');
  }

  /**
   * Fill form with valid data
   */
  async fillValidData(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }
}
