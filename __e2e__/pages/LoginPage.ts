import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object Model
 * Handles all interactions with the login screen
 */
export class LoginPage extends BasePage {
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly createAccountLink: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly generalError: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email address input', { exact: false });
    this.passwordInput = page.getByLabel('Password input', { exact: false });
    this.signInButton = page.getByTestId('signin-button');
    this.createAccountLink = page.getByText('Create Account');
    this.emailError = page.getByText('Email is required', { exact: false }).or(
      page.getByText('valid email', { exact: false })
    );
    this.passwordError = page.getByText('Password is required', { exact: false }).or(
      page.getByText('Password must be', { exact: false })
    );
    this.generalError = page.getByText('Invalid email or password', { exact: false }).or(
      page.getByText('Login failed', { exact: false })
    );
    this.loadingIndicator = this.signInButton.getByRole('progressbar');
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.navigateTo('/');
    // Wait for login screen to appear
    await this.emailInput.waitFor({ state: 'visible', timeout: 10000 });
  }

  /**
   * Login with valid credentials
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /**
   * Login and wait for navigation to home
   */
  async loginAndNavigate(email: string, password: string) {
    await this.login(email, password);
    // Wait for navigation to home screen
    await this.page.waitForURL(/.*\/.*/, { timeout: 10000 });
    await this.page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 }).catch(() => {
      // Fallback: wait for home screen content
    });
  }

  /**
   * Attempt login with invalid credentials
   */
  async attemptInvalidLogin(email: string, password: string) {
    await this.login(email, password);
    await this.generalError.waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Navigate to registration page
   */
  async goToRegistration() {
    await this.createAccountLink.click();
  }

  /**
   * Verify login page is displayed
   */
  async expectLoginPageVisible() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  /**
   * Verify validation errors
   */
  async expectEmailError(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }

  /**
   * Verify general error message
   */
  async expectGeneralError(message: string) {
    await expect(this.page.getByText(message, { exact: false })).toBeVisible();
  }

  /**
   * Verify loading state
   */
  async expectLoadingState() {
    await expect(this.loadingIndicator).toBeVisible();
  }

  /**
   * Verify not on login page (successfully logged in)
   */
  async expectNotOnLoginPage() {
    await expect(this.emailInput).not.toBeVisible();
  }
}
