# Trapp Tracker - E2E Testing Guide

**Document Version:** 1.0  
**Last Updated:** March 17, 2026  
**Test Framework:** Playwright  
**Target Platform:** React Native Web (Chrome, Mobile Emulation)

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Page Object Model](#page-object-model)
6. [Debugging Tests](#debugging-tests)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Test Coverage](#test-coverage)

---

## Overview

### What is E2E Testing?

End-to-End (E2E) testing validates complete user workflows by simulating real user interactions with the application in a browser environment. Unlike unit tests that test individual components, E2E tests verify that all parts of the application work together correctly.

### Why Playwright?

We use **Playwright** for E2E testing because it provides:

- ✅ **Cross-browser support**: Chrome, Firefox, Safari
- ✅ **Mobile emulation**: Pixel 5, iPhone 12, and more
- ✅ **Auto-wait**: Intelligent waiting for elements
- ✅ **Built-in reporting**: HTML, JUnit, JSON reports
- ✅ **Screenshots & Video**: Automatic capture on failure
- ✅ **Trace Viewer**: Step-by-step test execution replay
- ✅ **CI/CD Ready**: GitHub Actions integration
- ✅ **React Native Web Support**: Better than Detox for web testing

### Test Coverage

| Priority | Test Suite | Count | Status |
|----------|-----------|-------|--------|
| **P0 - Critical** | Authentication | 9 | ✅ Complete |
| **P0 - Critical** | Workout Logging | 16 | ✅ Complete |
| **P0 - Critical** | Navigation | 10 | ✅ Complete |
| **P1 - High** | Calendar | 14 | ✅ Complete |
| **P0 - Critical** | Integrated Workflows | 7 | ✅ Complete |
| **Total** | | **56** | |

---

## Quick Start

### Prerequisites

1. **Node.js** v20+ installed
2. **npm** installed
3. **Expo CLI** (for running the web app)

### Installation

```bash
# Navigate to project root
cd trapp

# Install dependencies (if not already done)
npm install

# Install Playwright browsers (Chromium, Firefox, WebKit)
npm run test:e2e:install

# Install system dependencies (Linux only)
# npm run test:e2e:install-deps
```

### Running Your First Test

```bash
# Start the web app in one terminal
npm run web

# Run E2E tests in another terminal
npm run test:e2e
```

---

## Running Tests

### Available Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run test:e2e` | Run all E2E tests (headless) | CI/CD, quick validation |
| `npm run test:e2e:ui` | Run tests with UI mode | Interactive development |
| `npm run test:e2e:headed` | Run tests in visible browser | Debugging, visual verification |
| `npm run test:e2e:debug` | Run tests in debug mode | Step-by-step debugging |
| `npm run test:e2e:report` | Open HTML test report | Review results |
| `npm run test:e2e:chromium` | Run tests on Chromium only | Fast feedback |
| `npm run test:e2e:mobile` | Run tests on mobile emulators | Mobile testing |
| `npm run test:e2e:clean` | Clean test artifacts | Cleanup |

### Running Specific Tests

```bash
# Run authentication tests only
npx playwright test authentication

# Run workout logging tests only
npx playwright test workout-logging

# Run tests by file name
npx playwright test 01-authentication.test.ts

# Run tests by title pattern
npx playwright test -g "Login"

# Run tests by line number
npx playwright test 01-authentication.test.ts:42
```

### Running on Specific Browsers

```bash
# Run on Chromium (desktop)
npx playwright test --project=chromium

# Run on Mobile Chrome
npx playwright test --project='Mobile Chrome'

# Run on Mobile Safari (iPhone)
npx playwright test --project='Mobile Safari'

# Run on all browsers
npx playwright test
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WEB_URL` | `http://localhost:8081` | Base URL for tests |
| `CI` | `false` | Enable CI mode (retries, single worker) |

```bash
# Run tests against deployed web app
WEB_URL=https://neuroshell.github.io/trapp npm run test:e2e

# Run in CI mode locally
CI=true npm run test:e2e
```

---

## Test Structure

### Directory Layout

```
__e2e__/
├── tests/                    # Test files
│   ├── 01-authentication.test.ts
│   ├── 02-workout-logging.test.ts
│   ├── 03-navigation.test.ts
│   ├── 04-calendar.test.ts
│   └── 05-integrated-workflows.test.ts
├── pages/                    # Page Object Models
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── HomePage.ts
│   ├── LogPage.ts
│   ├── CalendarPage.ts
│   └── SettingsPage.ts
├── fixtures/                 # Test fixtures
│   └── fixtures.ts
├── utils/                    # Test utilities
│   └── testUtils.ts
└── README.md
```

### Test File Naming

- **Format**: `NN-description.test.ts`
- **NN**: Sequential number for execution order
- **Examples**:
  - `01-authentication.test.ts`
  - `02-workout-logging.test.ts`

### Test Naming Convention

```typescript
test('E2E-AUTH-01: User Registration - Success Flow', async ({ ... }) => {
  // Test implementation
});
```

**Format**: `E2E-{AREA}-{NUMBER}: {Description} - {Scenario}`

---

## Page Object Model

### What is Page Object Model?

Page Object Model (POM) is a design pattern that creates an object repository for storing all web elements. Each page in the application has a corresponding class that encapsulates:

- **Locators**: Selectors for UI elements
- **Actions**: Methods to interact with elements
- **Assertions**: Methods to verify element states

### Benefits

- ✅ **Maintainability**: Changes to UI only require updating page objects
- ✅ **Reusability**: Common actions defined once, used everywhere
- ✅ **Readability**: Tests read like user stories
- ✅ **Separation of Concerns**: Tests focus on workflows, not selectors

### Example: LoginPage

```typescript
// __e2e__/pages/LoginPage.ts
export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByLabel('Email address input');
    this.passwordInput = page.getByLabel('Password input');
    this.signInButton = page.getByTestId('signin-button');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async loginAndNavigate(email: string, password: string) {
    await this.login(email, password);
    await this.page.waitForURL(/.*\/.*/, { timeout: 10000 });
  }
}
```

### Using Page Objects in Tests

```typescript
test('E2E-AUTH-03: User Login', async ({ loginPage, homePage, testUser }) => {
  await loginPage.goto();
  await loginPage.loginAndNavigate(testUser.email, testUser.password);
  await homePage.expectHomePageVisible();
});
```

### Available Page Objects

| Page | Key Methods |
|------|-------------|
| `LoginPage` | `login()`, `loginAndNavigate()`, `attemptInvalidLogin()` |
| `RegisterPage` | `register()`, `registerAndNavigate()`, `fillValidData()` |
| `HomePage` | `clickQuickLog()`, `navigateToLogTab()`, `expectHomePageVisible()` |
| `LogPage` | `fillRunningWorkout()`, `fillStrengthWorkout()`, `saveWorkout()` |
| `CalendarPage` | `clickDay()`, `goToNextMonth()`, `expectDayDetailVisible()` |
| `SettingsPage` | `logout()`, `clickLogout()`, `expectSettingsVisible()` |

---

## Debugging Tests

### Debug Mode

```bash
# Run in debug mode (opens Playwright Inspector)
npm run test:e2e:debug

# Debug specific test
npx playwright test 01-authentication.test.ts --debug
```

### UI Mode (Recommended)

```bash
# Interactive UI mode
npm run test:e2e:ui
```

**Features:**
- Watch mode (auto-rerun on file changes)
- Time-travel debugging
- Actionability traces
- Screenshot comparison

### Headed Mode

```bash
# Run tests in visible browser
npm run test:e2e:headed
```

### Trace Viewer

```bash
# Run tests with tracing
npx playwright test --trace on

# View trace after test run
npx playwright show-trace playwright-results/trace.zip
```

**Trace includes:**
- DOM snapshots
- Network requests
- Console logs
- Screenshots
- Source code

### Screenshots on Failure

Screenshots are automatically captured on failure:

```
playwright-results/
└── screenshots/
    └── 01-authentication-test-failed-1234567890.png
```

### Video Recording

Videos are automatically recorded for failed tests:

```
playwright-results/
└── videos/
    └── 01-authentication-test-failed.webm
```

### Common Debugging Techniques

#### 1. Add Pause

```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // Opens inspector
  // Continue with test
});
```

#### 2. Take Screenshot

```typescript
await page.screenshot({ path: 'debug.png' });
```

#### 3. Log to Console

```typescript
console.log('Current URL:', page.url());
```

#### 4. Wait for Manual Inspection

```typescript
await page.waitForTimeout(5000); // Wait 5 seconds
```

---

## CI/CD Integration

### GitHub Actions

E2E tests run automatically on:
- Pull requests to `main`
- Push to `main` branch
- Scheduled runs (daily)

### Workflow Configuration

See `.github/workflows/e2e-tests.yml` for the complete workflow.

### Local CI Simulation

```bash
# Run tests as they would run in CI
CI=true npm run test:e2e
```

### Test Reports

**JUnit XML:** `playwright-junit.xml`  
**HTML Report:** `playwright-report/index.html`

```bash
# Generate and open HTML report
npm run test:e2e
npm run test:e2e:report
```

### Artifacts

GitHub Actions uploads:
- Test reports (HTML)
- Screenshots (on failure)
- Videos (on failure)
- Traces (on retry)

---

## Best Practices

### Writing Tests

#### ✅ DO:

```typescript
// Use descriptive test names
test('E2E-LOG-01: Quick Log Running Workout (<10 seconds)', async ({ ... }) => {
  // Arrange
  await loginPage.goto();
  
  // Act
  await homePage.clickQuickLog('running');
  await logPage.saveWorkout();
  
  // Assert
  await expect(logPage.successToast).toBeVisible();
});

// Use page objects
await loginPage.login(email, password);

// Wait for network idle when needed
await page.waitForLoadState('networkidle');

// Use test IDs for selectors
page.getByTestId('signin-button');

// Clean up after tests
test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});
```

#### ❌ DON'T:

```typescript
// Don't use brittle CSS selectors
await page.click('.btn-primary');

// Don't use fixed timeouts (unless necessary)
await page.waitForTimeout(5000); // Bad

// Don't test implementation details
await expect(component.state.value).toBe('test'); // Bad

// Don't skip cleanup
// Tests should be isolated
```

### Selectors Priority

1. **`getByTestId()`** - Most stable, purpose-built for testing
2. **`getByRole()`** - Accessibility-based, semantic
3. **`getByLabel()`** - Form fields
4. **`getByText()`** - Text content
5. **`getByPlaceholder()`** - Input placeholders
6. **CSS selectors** - Last resort

### Handling Flakiness

```typescript
// Use retry for flaky tests
test('flaky test', async ({ page }) => {
  // Test code
}, { retries: 2 });

// Wait for element to be stable
await element.waitFor({ state: 'stable' });

// Retry actions
await retry(async () => {
  await page.click('button');
}, 3);
```

### Performance Testing

```typescript
import { measureTime } from '../utils/testUtils';

test('quick log under 10 seconds', async ({ ... }) => {
  const { duration } = await measureTime(async () => {
    await homePage.clickQuickLog('running');
    await logPage.saveWorkout();
  });
  
  expect(duration).toBeLessThan(10000); // CRITICAL METRIC
});
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Timeout

**Problem:** Test fails with timeout error

**Solutions:**
```typescript
// Increase timeout for specific test
test('slow test', async ({ page }) => {
  // Test code
}, { timeout: 120000 }); // 2 minutes

// Increase action timeout
await element.click({ timeout: 10000 });

// Wait for element before action
await element.waitFor({ state: 'visible' });
await element.click();
```

#### 2. Element Not Found

**Problem:** `Error: Element not found`

**Solutions:**
```typescript
// Check if element is in iframe
const frame = page.frame({ name: 'frame-name' });
await frame.locator('button').click();

// Check if element is in shadow DOM
await page.locator('button', { hasNot: page.locator('shadow') });

// Use different selector
await page.getByRole('button', { name: 'Submit' });
```

#### 3. Navigation Fails

**Problem:** Test fails during navigation

**Solutions:**
```typescript
// Wait for navigation explicitly
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/next-page"]'),
]);

// Wait for URL change
await page.waitForURL(/.*\/next-page.*/);
```

#### 4. Session Issues

**Problem:** User logged out unexpectedly

**Solutions:**
```typescript
// Ensure localStorage is cleared before test
test.beforeEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});

// Verify session persistence
await page.reload();
await expect(homePage.dashboard).toBeVisible();
```

#### 5. Flaky Tests

**Problem:** Test passes sometimes, fails other times

**Solutions:**
```typescript
// Add explicit waits
await element.waitFor({ state: 'visible' });
await element.waitFor({ state: 'stable' });

// Retry flaky tests
test('flaky test', async ({ page }) => {
  // Test code
}, { retries: 2 });

// Check for race conditions
await page.waitForLoadState('networkidle');
```

### Getting Help

1. **Check Playwright Docs**: https://playwright.dev
2. **View Trace**: `npx playwright show-trace trace.zip`
3. **Run in Debug Mode**: `npm run test:e2e:debug`
4. **Check Test Report**: `npm run test:e2e:report`

---

## Test Coverage

### Test Inventory

| Test ID | Description | Priority | Status |
|---------|-------------|----------|--------|
| **Authentication** |
| E2E-AUTH-01 | User Registration - Success | P0 | ✅ |
| E2E-AUTH-02 | User Registration - Validation | P1 | ✅ |
| E2E-AUTH-03 | Registration with Plus Email | P2 | ✅ |
| E2E-AUTH-04 | User Login - Success | P0 | ✅ |
| E2E-AUTH-05 | User Login - Invalid Credentials | P1 | ✅ |
| E2E-AUTH-06 | Session Persistence | P0 | ✅ |
| E2E-AUTH-07 | Logout Flow | P1 | ✅ |
| E2E-AUTH-08 | Cancel Logout | P2 | ✅ |
| E2E-AUTH-09 | Navigate to Registration | P2 | ✅ |
| **Workout Logging** |
| E2E-LOG-01 | Quick Log < 10 seconds | P0 | ✅ |
| E2E-LOG-02 | Quick Log All Types | P1 | ✅ |
| E2E-LOG-03 | Full Running Workout | P1 | ✅ |
| E2E-LOG-04 | Decimal Distance | P2 | ✅ |
| E2E-LOG-05 | Workout with Notes | P2 | ✅ |
| E2E-LOG-06 | Squats Workout | P1 | ✅ |
| E2E-LOG-07 | Pushups Workout | P1 | ✅ |
| E2E-LOG-08 | Pullups Workout | P1 | ✅ |
| E2E-LOG-09 | Running Validation | P1 | ✅ |
| E2E-LOG-10 | Strength Validation | P1 | ✅ |
| E2E-LOG-11 | Multiple Errors | P1 | ✅ |
| E2E-LOG-12 | Delete with Confirmation | P1 | ✅ |
| E2E-LOG-13 | Cancel Delete | P2 | ✅ |
| E2E-LOG-14 | Delete Dialog | P2 | ✅ |
| E2E-LOG-15 | Form Pre-filling | P2 | ✅ |
| E2E-LOG-16 | Empty State | P2 | ✅ |
| **Navigation** |
| E2E-NAV-01 | Navigate All Tabs | P0 | ✅ |
| E2E-NAV-02 | Click Active Tab | P2 | ✅ |
| E2E-NAV-03 | Rapid Tab Switching | P2 | ✅ |
| E2E-NAV-04 | Quick Action Navigation | P1 | ✅ |
| E2E-NAV-05 | Home to Calendar | P1 | ✅ |
| E2E-NAV-06 | Home to Achievements | P1 | ✅ |
| E2E-NAV-07 | Home to Settings | P1 | ✅ |
| E2E-NAV-08 | Browser Back Button | P2 | ✅ |
| E2E-NAV-09 | Unsaved Changes | P2 | ✅ |
| E2E-NAV-10 | Active Tab Indicator | P2 | ✅ |
| **Calendar** |
| E2E-CAL-01 | Current Month View | P1 | ✅ |
| E2E-CAL-02 | Today Highlighted | P2 | ✅ |
| E2E-CAL-03 | Previous Month | P1 | ✅ |
| E2E-CAL-04 | Next Month | P1 | ✅ |
| E2E-CAL-05 | Back and Forth | P2 | ✅ |
| E2E-CAL-06 | Today Button | P2 | ✅ |
| E2E-CAL-07 | Day Detail Modal | P1 | ✅ |
| E2E-CAL-08 | Close Modal | P2 | ✅ |
| E2E-CAL-09 | Day Detail Date | P2 | ✅ |
| E2E-CAL-10 | Day Detail Empty | P2 | ✅ |
| E2E-CAL-11 | Add from Detail | P2 | ✅ |
| E2E-CAL-12 | Workout Indicators | P2 | ✅ |
| E2E-CAL-13 | Multiple Months Back | P2 | ✅ |
| E2E-CAL-14 | Rapid Navigation | P2 | ✅ |
| **Integrated Workflows** |
| E2E-FLOW-01 | New User Onboarding | P0 | ✅ |
| E2E-FLOW-02 | Complete Workout Session | P0 | ✅ |
| E2E-FLOW-03 | Login -> Log -> Calendar -> Logout | P0 | ✅ |
| E2E-FLOW-04 | Session Persistence | P0 | ✅ |
| E2E-FLOW-05 | Delete and Verify | P0 | ✅ |
| E2E-FLOW-06 | Multiple Workouts One Day | P1 | ✅ |
| E2E-FLOW-07 | Validation Prevents Submit | P1 | ✅ |

### Coverage Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Critical Flows (P0) | 100% | 100% |
| High Priority (P1) | 90% | 95% |
| Medium Priority (P2) | 70% | 85% |
| **Overall** | **85%** | **92%** |

---

## Appendix

### A. Test Data Management

```typescript
// Use unique test users to avoid conflicts
const testUser = {
  email: `testuser+e2e${Date.now()}@example.com`,
  password: 'TestPass123',
};

// Clean up after tests
test.afterEach(async ({ page }) => {
  await page.evaluate(() => localStorage.clear());
});
```

### B. Configuration Reference

**playwright.config.ts:**
```typescript
export default defineConfig({
  testDir: './__e2e__/tests',
  timeout: 60000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

### C. Useful Links

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Assertions](https://playwright.dev/docs/test-assertions)
- [Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**Questions?** Check the [Playwright Docs](https://playwright.dev) or contact the development team.
