/**
 * Test utilities for E2E tests
 */

/**
 * Generate a unique email address for testing
 */
export function generateTestEmail(prefix: string = 'testuser'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  return `${prefix}+e2e${timestamp}${random}@example.com`;
}

/**
 * Generate a secure test password
 */
export function generateTestPassword(): string {
  return `TestPass${Math.random().toString(36).substring(2, 6)}123`;
}

/**
 * Wait for a specific duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format date for comparison
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get current timestamp for workout logging
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate random workout data
 */
export function generateRunningWorkout() {
  return {
    distance: (Math.random() * 10 + 1).toFixed(1), // 1-11 km
    duration: Math.floor(Math.random() * 30 + 20).toString(), // 20-50 min
  };
}

export function generateStrengthWorkout() {
  return {
    reps: Math.floor(Math.random() * 20 + 10).toString(), // 10-30 reps
    sets: Math.floor(Math.random() * 3 + 3).toString(), // 3-6 sets
    weight: (Math.random() * 50 + 20).toFixed(1), // 20-70 kg
  };
}

/**
 * Retry a function multiple times
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < retries - 1) {
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return {
    result,
    duration: end - start,
  };
}

/**
 * Check if running in CI environment
 */
export function isCI(): boolean {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}

/**
 * Get base URL for tests
 */
export function getBaseURL(): string {
  return process.env.WEB_URL || 'http://localhost:8081';
}

/**
 * Create a test report object
 */
export interface TestReport {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  screenshot?: string;
  video?: string;
  error?: string;
}

/**
 * Generate test report
 */
export function generateTestReport(
  testName: string,
  status: 'passed' | 'failed' | 'skipped',
  duration: number,
  error?: string
): TestReport {
  return {
    testName,
    status,
    duration,
    error,
  };
}
