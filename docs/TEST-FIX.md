# Test Pipeline Fix

**Date:** March 15, 2026  
**Issue:** `jest-junit` reporter module not found in CI pipeline

---

## Problem

The CI pipeline failed with the following error:

```
Error: Could not resolve a module for a custom reporter.
  Module name: jest-junit

npm run test:app -- --coverage --ci --reporters=default --reporters=jest-junit
```

---

## Root Cause

The workflow file (`.github/workflows/ci.yml`) referenced `jest-junit` reporter, but the package was not installed in `package.json`.

---

## Solution

### 1. Install jest-junit

```bash
npm install --save-dev jest-junit
```

**Package added:**

```json
{
  "devDependencies": {
    "jest-junit": "^16.0.0"
  }
}
```

---

### 2. Update jest.config.js

Added reporter configuration to `jest.config.js` so it's centralized:

```javascript
module.exports = {
  // ... existing config
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: ".",
        outputName: "junit.xml",
        addFileAttribute: "true",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
  ],
  coverageReporters: ["text", "lcov", "cobertura"],
};
```

---

### 3. Simplify CI Workflow

Updated `.github/workflows/ci.yml` to use the simpler command:

**Before:**

```yaml
- name: Run Jest tests (App)
  run: npm run test:app -- --coverage --ci --reporters=default --reporters=jest-junit
```

**After:**

```yaml
- name: Run Jest tests (App)
  run: npm run test:app -- --coverage --ci
```

The reporters are now loaded from `jest.config.js` automatically.

---

## Verification

### Test Run Results

```bash
npm run test:app -- --coverage --ci
```

**Output:**

```
 PASS  __tests__/HomeScreen.test.tsx
 PASS  __tests__/LogScreen.test.tsx

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total

----------------|---------|----------|---------|---------|
File            | % Stmts | % Branch | % Funcs | % Lines |
----------------|---------|----------|---------|---------|
All files       |   60.71 |    46.66 |      65 |   62.61 |
 src            |   30.43 |    16.66 |   22.22 |   32.55 |
  storage.ts    |    23.8 |    16.66 |   22.22 |   25.64 |
  theme.ts      |     100 |      100 |     100 |     100 |
 src/components |   69.56 |    46.15 |   63.63 |   69.56 |
  Card.tsx      |     100 |       50 |     100 |     100 |
  DateTimeField |   53.33 |       25 |   33.33 |   53.33 |
  IconButton.tsx|     100 |       50 |     100 |     100 |
  Card.tsx      |     100 |     62.5 |     100 |     100 |
 src/screens    |   88.37 |    61.53 |      85 |   90.24 |
  HomeScreen.tsx|     100 |      100 |     100 |     100 |
  LogScreen.tsx |   86.48 |    61.53 |      80 |   88.57 |
----------------|---------|----------|---------|---------|
```

### Generated Files

✅ `junit.xml` (680 bytes) - JUnit test results  
✅ `coverage/cobertura-coverage.xml` - Cobertura format  
✅ `coverage/coverage-final.json` - JSON coverage report  
✅ `coverage/lcov.info` - LCOV format  
✅ `coverage/lcov-report/` - HTML coverage report

---

## Files Modified

| File                       | Change                                           |
| -------------------------- | ------------------------------------------------ |
| `package.json`             | Added `jest-junit` to devDependencies            |
| `jest.config.js`           | Added `reporters` and `coverageReporters` config |
| `.github/workflows/ci.yml` | Simplified test command                          |

---

## Coverage Report

**Overall Coverage:** 60.71%

| Category   | Statements | Branch | Functions | Lines  |
| ---------- | ---------- | ------ | --------- | ------ |
| All files  | 60.71%     | 46.66% | 65%       | 62.61% |
| src        | 30.43%     | 16.66% | 22.22%    | 32.55% |
| components | 69.56%     | 46.15% | 63.63%    | 69.56% |
| screens    | 88.37%     | 61.53% | 85%       | 90.24% |

**Note:** Low coverage in `storage.ts` (23.8%) - consider adding tests for AsyncStorage operations.

---

## CI Pipeline Status

### test-app Job ✅

```yaml
- name: Run Jest tests (App)
  run: npm run test:app -- --coverage --ci
  env:
    CI: true

- name: Upload test results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-results-app
    path: |
      junit.xml
      coverage/
    retention-days: 7

- name: Upload coverage to Codecov (optional)
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
    flags: app
    name: app-coverage
```

---

## Additional Benefits

### 1. JUnit XML Format

The `junit.xml` file can be:

- Uploaded to CI/CD platforms for test reporting
- Used by Codecov for coverage tracking
- Integrated with GitHub Checks API
- Parsed by IDEs for test result display

### 2. Multiple Coverage Formats

Generated coverage reports support:

- **lcov** - Standard for coverage tools
- **cobertura** - Jenkins, Codecov support
- **HTML** - Human-readable reports
- **JSON** - Programmatic access

### 3. Codecov Ready

With `CODECOV_TOKEN` secret configured, coverage will automatically upload to Codecov:

```yaml
- name: Upload coverage to Codecov (optional)
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
    flags: app
    name: app-coverage
    fail_ci_if_error: false
```

---

## Recommendations

### Immediate

1. ✅ **DONE** - Install jest-junit
2. ✅ **DONE** - Configure jest.config.js
3. ✅ **DONE** - Update CI workflow

### Short-Term

1. Add tests for `storage.ts` (currently 23.8% coverage)
2. Increase branch coverage in components (currently 46.15%)
3. Configure Codecov integration
4. Add coverage threshold to prevent regressions:

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50
  }
}
```

### Long-Term

1. Add E2E tests (Detox or Maestro)
2. Integrate with GitHub Status Checks
3. Set up coverage badges in README
4. Track coverage trends over time

---

## Related Documentation

- [Jest Reporters](https://jestjs.io/docs/configuration#reporters-array)
- [jest-junit Package](https://www.npmjs.com/package/jest-junit)
- [Codecov Integration](https://docs.codecov.com/docs)

---

**Status:** ✅ Fixed  
**Tests:** ✅ Passing (2/2)  
**Coverage:** 60.71%  
**CI Ready:** Yes
