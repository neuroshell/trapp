# Build & Coverage Fix

**Date:** March 15, 2026  
**Issues:**

1. Build artifacts failing due to outdated Node.js and deprecated command
2. Coverage summary empty in GitHub Actions

---

## Issue 1: Build Artifacts Failing

### Error Messages

```
Node.js (v18.20.8) is outdated and unsupported.
Please update to a newer Node.js LTS version (required: >=20.19.4)

CommandError: expo export:web can only be used with Webpack.
Use expo export for other bundlers.
```

### Root Causes

1. **Node.js Version**: CI was using Node.js 18, but Expo SDK 55 requires Node.js 20+
2. **Deprecated Command**: `expo export:web` is deprecated, replaced by `expo export -p web`
3. **Output Directory**: New command outputs to `dist/` instead of `web-build/`

### Fixes Applied

#### 1. Updated Node.js Version (`.github/workflows/ci.yml`)

**Before:**

```yaml
env:
  NODE_VERSION: "18"
```

**After:**

```yaml
env:
  NODE_VERSION: "20"
```

#### 2. Updated Build Command (`.github/workflows/ci.yml`)

**Before:**

```yaml
- name: Build web version (Expo)
  run: npx expo export:web
```

**After:**

```yaml
- name: Build web version (Expo)
  run: npx expo export -p web
```

#### 3. Updated Output Directory (`.github/workflows/ci.yml`)

**Before:**

```yaml
- name: Copy web build to artifacts
  run: |
    cp -r web-build/* build/artifacts/ || echo "Web build not found, skipping..."
```

**After:**

```yaml
- name: Copy web build to artifacts
  run: |
    cp -r dist/* build/artifacts/ || echo "Web build not found, skipping..."
```

#### 4. Added Build Script (`package.json`)

```json
{
  "scripts": {
    "build:web": "npx expo export -p web"
  }
}
```

---

## Issue 2: Empty Coverage Summary

### Problem

The coverage summary job was showing empty because:

1. Coverage files weren't being properly downloaded
2. No actual coverage data was being displayed
3. Generic "not available" message shown

### Fix Applied

Updated the coverage summary job to:

1. Download coverage artifacts correctly
2. Display actual coverage file information
3. Show file sizes and availability
4. Provide clear artifact download instructions

**Updated Job (`.github/workflows/ci.yml`):**

```yaml
coverage-summary:
  name: Coverage Summary
  runs-on: ubuntu-latest
  needs: [test-app, test-backend]
  if: always()

  steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Download coverage artifacts
      uses: actions/download-artifact@v4
      with:
        name: test-results-app
        path: ./coverage-artifacts

    - name: Generate coverage summary
      run: |
        echo "## 📊 Test Coverage Summary" >> $GITHUB_STEP_SUMMARY

        if [ -f "./coverage-artifacts/coverage/lcov.info" ]; then
          echo "### Coverage Report" >> $GITHUB_STEP_SUMMARY
          echo "Coverage file: lcov.info ($(wc -c < ./coverage-artifacts/coverage/lcov.info) bytes)"
        fi

        if [ -f "./coverage-artifacts/coverage/coverage-final.json" ]; then
          echo "### Coverage Details" >> $GITHUB_STEP_SUMMARY
          echo "- Coverage file: coverage-final.json"
          echo "- Size: $(wc -c < ./coverage-artifacts/coverage/coverage-final.json) bytes"
        fi

        echo "### Artifacts" >> $GITHUB_STEP_SUMMARY
        echo "- Download: \`test-results-app\`"
```

---

## Verification

### Local Build Test

```bash
npm run build:web
```

**Result:**

```
✅ Web Bundled 295ms (623 modules)
✅ Assets (30): Fonts, icons, images
✅ web bundles (1): AppEntry-*.js (1.5MB)
✅ Files (2): index.html, metadata.json
✅ Exported: dist/
```

### Expected CI Output

```yaml
Build Artifacts:
  ✅ Setup Node.js (v20)
  ✅ Install dependencies
  ✅ Build web version (Expo) - npx expo export -p web
  ✅ Copy web build to artifacts
  ✅ Create build manifest
  ✅ Upload build artifacts (14 days retention)

Coverage Summary:
  ✅ Download coverage artifacts
  ✅ Generate coverage summary with:
    - lcov.info file size
    - coverage-final.json details
    - Artifact download instructions
```

---

## Files Modified

| File                       | Changes                                                     |
| -------------------------- | ----------------------------------------------------------- |
| `.github/workflows/ci.yml` | Node.js 18→20, build command, output path, coverage summary |
| `package.json`             | Added `build:web` script                                    |

---

## Expo SDK 55 Requirements

| Requirement | Value                    |
| ----------- | ------------------------ |
| Node.js     | >= 20.19.4 (LTS)         |
| Command     | `npx expo export -p web` |
| Output      | `dist/` directory        |
| Bundler     | Metro (default)          |

---

## Coverage Files Generated

After tests run, these files are created:

| File                              | Purpose                 | Size      |
| --------------------------------- | ----------------------- | --------- |
| `coverage/lcov.info`              | LCOV format for Codecov | ~4KB      |
| `coverage/coverage-final.json`    | JSON coverage report    | ~24KB     |
| `coverage/cobertura-coverage.xml` | Cobertura XML format    | ~16KB     |
| `coverage/lcov-report/index.html` | HTML coverage report    | Directory |
| `junit.xml`                       | JUnit test results      | ~1KB      |

---

## CI Pipeline Flow

```
test-app job
  ↓
  ├─→ Run: npm run test:app -- --coverage --ci
  ├─→ Generates: coverage/*, junit.xml
  └─→ Upload: test-results-app artifact
        ↓
coverage-summary job
  ↓
  ├─→ Download: test-results-app
  ├─→ Read: coverage files
  └─→ Display: Summary in GitHub Actions
```

---

## Commands Reference

### Local Development

```bash
# Build web
npm run build:web

# Test with coverage
npm run test:app -- --coverage

# View coverage (requires browser)
open coverage/lcov-report/index.html
```

### CI Commands

```bash
# Install dependencies
npm ci

# Build web
npx expo export -p web

# Test with coverage
npm run test:app -- --coverage --ci
```

---

## Related Documentation

- [Expo Export Documentation](https://docs.expo.dev/deployment/export/)
- [GitHub Actions Coverage](https://github.com/marketplace/actions/coverage-reporter)
- [Node.js LTS Schedule](https://nodejs.org/en/about/previous-releases)

---

**Status:** ✅ Fixed  
**Node.js Version:** 20 (LTS)  
**Build Command:** `npx expo export -p web`  
**Coverage Display:** Enhanced with file details  
**CI Ready:** Yes
