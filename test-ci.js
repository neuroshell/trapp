/**
 * Frontend CI Test Runner
 * 
 * Runs only stable Jest tests for CI pipeline.
 * Excludes Playwright E2E tests and tests with known issues.
 * 
 * Known Issues:
 * - Playwright E2E tests must be run with 'npx playwright test'
 * - NetInfo module has mock issues in some tests
 * 
 * Stable Tests:
 * - All tests in __tests__/ directory (except commented out ones)
 * - Excludes __e2e__/ directory
 * 
 * Usage:
 *   node test-ci.js
 * 
 * Full test suite (manual):
 *   npm run test:app
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('Running frontend CI test suite...\n');

async function runTests() {
  try {
    // Run Jest with CI configuration
    const { stdout, stderr } = await execAsync('npm run test:app -- --ci --passWithNoTests', {
      env: process.env,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    console.log(stdout);
    
    if (stderr) {
      console.error(stderr);
    }

    console.log('\n✅ Frontend CI tests completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Frontend CI tests failed\n');
    console.error(error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

runTests();
