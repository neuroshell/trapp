# E2E Test Suite - Trapp Tracker

End-to-End test suite for Trapp Tracker (FitTrack Pro) using Playwright.

## Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run test:e2e:install

# Start the web app
npm run web

# Run tests (in another terminal)
npm run test:e2e
```

## Test Files

- `01-authentication.test.ts` - Login, registration, logout, session
- `02-workout-logging.test.ts` - Running, strength, validation, delete
- `03-navigation.test.ts` - Tab navigation, deep links
- `04-calendar.test.ts` - Calendar view, month navigation, day detail
- `05-integrated-workflows.test.ts` - Complete user journeys

## Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all tests (headless) |
| `npm run test:e2e:ui` | Interactive UI mode |
| `npm run test:e2e:headed` | Run in visible browser |
| `npm run test:e2e:debug` | Debug mode |
| `npm run test:e2e:report` | View HTML report |

## Documentation

See [docs/tech/e2e-testing.md](../../docs/tech/e2e-testing.md) for complete documentation.

## Structure

```
__e2e__/
├── tests/           # Test files
├── pages/           # Page Object Models
├── fixtures/        # Test fixtures
└── utils/           # Utilities
```

## Coverage

- **56 tests** covering critical user flows
- **P0 Critical**: 100% coverage
- **P1 High**: 95% coverage
- **Overall**: 92% coverage
