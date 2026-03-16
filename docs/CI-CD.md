# Trapp Tracker - CI/CD Documentation

Complete documentation for the CI/CD pipelines, configuration, and developer workflows.

---

## Table of Contents

1. [Overview](#overview)
2. [Pipeline Summary](#pipeline-summary)
3. [Required Secrets](#required-secrets)
4. [Developer Workflow](#developer-workflow)
5. [Status Badges](#status-badges)
6. [Troubleshooting](#troubleshooting)
7. [Additional Recommendations](#additional-recommendations)

---

## Overview

Trapp Tracker uses GitHub Actions for all CI/CD operations. The pipelines are designed to:

- ✅ Ensure code quality through automated testing and linting
- ✅ Build and deploy mobile apps to iOS App Store and Google Play
- ✅ Deploy web app to GitHub Pages
- ✅ Scan for security vulnerabilities
- ✅ Provide clear feedback on every PR

### Technology Stack

| Component    | Version |
| ------------ | ------- |
| Node.js      | 18+     |
| npm          | Latest  |
| Expo SDK     | 55.0.6  |
| React Native | 0.81.5  |
| TypeScript   | ~5.9.2  |

---

## Pipeline Summary

### 1. CI Pipeline (`ci.yml`)

**Triggers:**

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
| Job | Description |
|-----|-------------|
| `lint` | ESLint code quality check |
| `type-check` | TypeScript compilation check |
| `test-app` | Jest tests for React Native app |
| `test-backend` | Node.js tests for backend |
| `build` | Create build artifacts (web) |
| `coverage-summary` | Generate coverage report |
| `status-check` | Final status aggregation |

**Artifacts:**

- `lint-results` - Linting output
- `test-results-app` - App test results + coverage
- `test-results-backend` - Backend test results
- `build-artifacts` - Web build output

---

### 2. Mobile CD Pipeline (`cd-mobile.yml`)

**Triggers:**

- Git tags matching `v*` pattern (e.g., `v1.2.3`)
- Manual dispatch via GitHub Actions UI

**Jobs:**
| Job | Description |
|-----|-------------|
| `validate` | Verify build configuration |
| `build-ios` | EAS Build for iOS |
| `build-android` | EAS Build for Android |
| `submit-ios` | Submit to TestFlight |
| `submit-android` | Submit to Google Play Internal |
| `notify` | Slack notification + GitHub Release |

**Manual Dispatch Options:**

- Build Type: `production` or `preview`
- Platform: `both`, `ios`, or `android`
- Profile: `production` or `development`
- Submit to Store: `true/false`

---

### 3. Web CD Pipeline (`cd-web.yml`)

**Triggers:**

- Push to `main` branch (production deploy)
- Pull requests (preview deploy)
- Manual dispatch

**Jobs:**
| Job | Description |
|-----|-------------|
| `build-web` | Expo web build |
| `deploy-production` | Deploy to GitHub Pages |
| `deploy-preview` | PR comment with preview link |
| `deploy-alternative` | Optional Vercel/Netlify deploy |
| `health-check` | Verify deployment |

**SPA Routing:**

- Automatically creates `404.html` fallback for client-side routing
- GitHub Pages configuration included

---

### 4. Security Scan Pipeline (`security-scan.yml`)

**Triggers:**

- Pull requests to `main`/`develop`
- Push to `main`
- Weekly schedule (Mondays at 2 AM UTC)
- Manual dispatch

**Jobs:**
| Job | Description |
|-----|-------------|
| `dependency-scan` | npm audit for vulnerabilities |
| `secret-detection` | Gitleaks + TruffleHog scans |
| `codeql-analysis` | GitHub CodeQL static analysis |
| `license-check` | Dependency license compliance |
| `security-summary` | Aggregated security report |

---

## Required Secrets

Configure these secrets in **GitHub Repository Settings → Secrets and variables → Actions**:

### Essential Secrets (Required)

| Secret Name                       | Description                    | How to Obtain                                     |
| --------------------------------- | ------------------------------ | ------------------------------------------------- |
| `EXPO_TOKEN`                      | Expo EAS authentication token  | Run `npx eas login` then `npx eas credentials:me` |
| `APPLE_ID`                        | Apple ID for App Store Connect | Your Apple developer account email                |
| `APPLE_PASSWORD`                  | App-specific password          | Generate at appleid.apple.com                     |
| `APPLE_TEAM_ID`                   | Apple Developer Team ID        | Found in Apple Developer Portal                   |
| `APPLE_APP_SPECIFIC_PASSWORD`     | App-specific password for CI   | Generate at appleid.apple.com                     |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | Google Play Service Account    | Create in Google Cloud Console                    |
| `EAS_PROJECT_ID`                  | Expo project ID                | From `eas.json` or Expo dashboard                 |

### Optional Secrets

| Secret Name          | Description                     | Used By                      |
| -------------------- | ------------------------------- | ---------------------------- |
| `SLACK_WEBHOOK_URL`  | Slack webhook for notifications | Mobile CD, Security Scan     |
| `NETLIFY_AUTH_TOKEN` | Netlify deployment token        | Web CD (alternative hosting) |
| `NETLIFY_SITE_ID`    | Netlify site ID                 | Web CD (alternative hosting) |
| `VERCEL_TOKEN`       | Vercel deployment token         | Web CD (alternative hosting) |
| `VERCEL_ORG_ID`      | Vercel organization ID          | Web CD (alternative hosting) |
| `VERCEL_PROJECT_ID`  | Vercel project ID               | Web CD (alternative hosting) |
| `CODECOV_TOKEN`      | Codecov upload token            | CI Pipeline (coverage)       |
| `GITLEAKS_LICENSE`   | Gitleaks license key            | Security Scan                |

### How to Set Up Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

---

## Developer Workflow

### Daily Development

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

### Before Committing

```bash
# Run linting
npm run lint

# Run tests
npm run test:app
npm run test:backend

# Type check
npx tsc --noEmit
```

### Using Helper Scripts

**Windows (PowerShell):**

```powershell
# Setup environment
.\scripts\ci-helpers.ps1 setup

# Clean caches
.\scripts\ci-helpers.ps1 cache-clean

# Warm caches (for faster CI)
.\scripts\ci-helpers.ps1 cache-warm

# Bump version
.\scripts\ci-helpers.ps1 version-bump -Version 1.2.3

# Generate changelog
.\scripts\ci-helpers.ps1 changelog

# Run tests with coverage
.\scripts\ci-helpers.ps1 test -Target all -Coverage
```

**Linux/Mac (Bash):**

```bash
# Setup environment
./scripts/ci-helpers.sh setup

# Clean caches
./scripts/ci-helpers.sh cache-clean

# Warm caches
./scripts/ci-helpers.sh cache-warm

# Bump version
./scripts/ci-helpers.sh version-bump 1.2.3

# Generate changelog
./scripts/ci-helpers.sh changelog --dry-run

# Run tests with coverage
./scripts/ci-helpers.sh test all --coverage
```

### Creating a Release

1. **Update version:**

   ```bash
   ./scripts/ci-helpers.sh version-bump 1.2.3
   git add package.json app.json backend/package.json
   git commit -m "chore: bump version to 1.2.3"
   ```

2. **Generate changelog:**

   ```bash
   ./scripts/ci-helpers.sh changelog
   git add CHANGELOG.md
   git commit -m "docs: update changelog"
   ```

3. **Push and tag:**

   ```bash
   git push origin main
   git tag v1.2.3
   git push origin v1.2.3
   ```

4. **Mobile build triggers automatically** via `cd-mobile.yml`

5. **Monitor build** in GitHub Actions tab

---

## Status Badges

Add these badges to your `README.md`:

```markdown
## CI/CD Status

[![CI Pipeline](https://github.com/neuroshell/trapp/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/neuroshell/trapp/actions/workflows/ci.yml)
[![Mobile CD](https://github.com/neuroshell/trapp/actions/workflows/cd-mobile.yml/badge.svg)](https://github.com/neuroshell/trapp/actions/workflows/cd-mobile.yml)
[![Web Deploy](https://github.com/neuroshell/trapp/actions/workflows/cd-web.yml/badge.svg?branch=main)](https://github.com/neuroshell/trapp/actions/workflows/cd-web.yml)
[![Security Scan](https://github.com/neuroshell/trapp/actions/workflows/security-scan.yml/badge.svg)](https://github.com/neuroshell/trapp/actions/workflows/security-scan.yml)

## Quality

[![CodeQL](https://github.com/neuroshell/trapp/actions/workflows/security-scan.yml/badge.svg?label=CodeQL)](https://github.com/neuroshell/trapp/security/code-scanning)
[![Codecov](https://codecov.io/gh/neuroshell/trapp/branch/main/graph/badge.svg)](https://codecov.io/gh/neuroshell/trapp)
```

### Compact Badge Set

```markdown
[![CI](https://github.com/neuroshell/trapp/actions/workflows/ci.yml/badge.svg)](https://github.com/neuroshell/trapp/actions/workflows/ci.yml)
[![Mobile](https://github.com/neuroshell/trapp/actions/workflows/cd-mobile.yml/badge.svg)](https://github.com/neuroshell/trapp/actions/workflows/cd-mobile.yml)
[![Web](https://github.com/neuroshell/trapp/actions/workflows/cd-web.yml/badge.svg)](https://github.com/neuroshell/trapp/actions/workflows/cd-web.yml)
[![Security](https://github.com/neuroshell/trapp/actions/workflows/security-scan.yml/badge.svg)](https://github.com/neuroshell/trapp/actions/workflows/security-scan.yml)
```

---

## Troubleshooting

### Common Issues

#### 1. CI Pipeline Fails on `npm ci`

**Error:** `npm ERR! Could not resolve dependency`

**Solution:**

```bash
# Delete lock file and regenerate
rm package-lock.json
npm install
git add package-lock.json
git commit -m "chore: regenerate lock file"
```

#### 2. EAS Build Fails

**Error:** `Credentials not configured`

**Solution:**

```bash
# Configure EAS credentials
npx eas build:configure
npx eas credentials:configure
```

#### 3. Web Deploy Fails

**Error:** `Permission denied for GitHub Pages`

**Solution:**

- Go to Repository Settings → Pages
- Ensure "GitHub Actions" is selected as source
- Check branch protection rules

#### 4. Security Scan Shows Vulnerabilities

**Action:**

```bash
# Check vulnerabilities
npm audit

# Auto-fix where possible
npm audit fix

# For breaking changes, review manually
npm audit --audit-level=high
```

#### 5. Cache Issues in CI

**Symptom:** Tests pass locally but fail in CI

**Solution:**

- Add `CACHE_VERSION: 'v2'` to workflow env (increment version)
- This forces cache invalidation

---

## Additional Recommendations

### 1. Branch Protection Rules

Configure in **Settings → Branches → Add branch protection rule**:

```
Branch name pattern: main
✓ Require a pull request before merging
✓ Require approvals (1)
✓ Require status checks to pass before merging
  ✓ lint
  ✓ type-check
  ✓ test-app
  ✓ test-backend
✓ Require branches to be up to date before merging
✓ Include administrators
```

### 2. Environment Configuration

Create GitHub Environments for deployment gates:

**Production Environment:**

- Name: `production`
- Required reviewers: 1-2 team members
- Deployment branches: `main` only

**Staging Environment:**

- Name: `staging`
- No required reviewers
- Deployment branches: `main`, `develop`

### 3. Monitoring Setup

**Recommended integrations:**

- **Codecov** - Coverage reporting
- **Sentry** - Error tracking
- **Slack** - Build notifications
- **Datadog/New Relic** - Performance monitoring

### 4. Cost Optimization

- EAS Build uses credits - use `preview` builds for testing
- Cache node_modules to reduce build times
- Use `cancel-in-progress` to avoid redundant builds
- Set artifact retention to 7-14 days

### 5. Security Best Practices

- Never commit `.env` files
- Rotate secrets quarterly
- Use app-specific passwords for CI
- Enable Dependabot for automated security updates
- Review CodeQL findings weekly

### 6. Rollback Strategy

**Mobile:**

- Use EAS Update for over-the-air fixes
- Submit hotfix build with incremented patch version

**Web:**

- Re-deploy previous commit via GitHub Actions
- GitHub Pages maintains history in `gh-pages` branch

---

## File Structure

```
trapp/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug-report.md
│   │   └── feature-request.md
│   ├── workflows/
│   │   ├── agents-pipeline.yml    (existing)
│   │   ├── ci.yml                 (new)
│   │   ├── cd-mobile.yml          (new)
│   │   ├── cd-web.yml             (new)
│   │   └── security-scan.yml      (new)
│   └── pull-request-template.md
├── scripts/
│   ├── ci-helpers.ps1             (Windows)
│   └── ci-helpers.sh              (Linux/Mac)
├── eas.json                       (EAS Build config)
├── package.json
├── app.json
└── backend/
    └── package.json
```

---

## Quick Reference

| Task                 | Command/Action                              |
| -------------------- | ------------------------------------------- |
| Run all tests        | `npm test`                                  |
| Run lint             | `npm run lint`                              |
| Build web            | `npx expo export:web`                       |
| Trigger mobile build | Create tag `v1.2.3`                         |
| Trigger manual build | GitHub Actions → CD - Mobile → Run workflow |
| View build status    | GitHub Actions tab                          |
| Download artifacts   | Workflow run → Artifacts section            |
| Check security       | Security tab → Code scanning                |

---

_Last updated: March 2026_
_Document version: 1.0.0_
