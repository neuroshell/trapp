# Trapp Tracker (FitTrack Pro) - Project Context

## Project Overview

**Trapp Tracker** (also branded as **FitTrack Pro**) is a cross-platform fitness tracking application built with **React Native + Expo**. The app enables users to log workout activities (running, squats, pushups, pullups), track progress over time, view calendar history, and earn achievements through gamification.

### Vision Statement

> **"Empower everyday athletes to build consistent fitness habits through intuitive tracking, meaningful achievements, and data-driven insights."**

### Core Value Proposition

> **"The simplest way to build unbreakable fitness habits"** - Log any workout in under 10 seconds.

### Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React Native, Expo SDK | 0.81.5, ~55.0.6 |
| **Language** | TypeScript | ~5.9.2 |
| **Navigation** | React Navigation | ^7.1.33 |
| **State Management** | React Context API | Built-in |
| **Storage** | AsyncStorage | 2.2.0 |
| **Backend** | Express.js + lowdb | ^4.18.4, ^5.0.0 (Phase 3) |
| **Testing** | Jest + jest-expo + RNTL | ^29.6.0 |
| **CI/CD** | GitHub Actions | - |

### Key Features

- **Authentication**: Email/password login with SHA-256 hashing (expo-crypto)
- **Workout Logging**: Track running, squats, pushups, pullups with form validation
- **Progress Tracking**: View workout history with timestamps and notes
- **Calendar View**: Visual calendar of workout history with indicators
- **Achievements**: Gamification system with streak tracking and personal records
- **Offline-First**: AsyncStorage for local persistence with optional backend sync (Phase 3)

---

## Building and Running

### Prerequisites

- **Node.js LTS** (v20 recommended): https://nodejs.org/en/download/
- **npm** (comes with Node.js)
- **Expo CLI** (optional, can use `npx expo`)

### Installation

```bash
cd trapp
npm install
```

### Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android device/emulator |
| `npm run ios` | Run on iOS simulator |
| `npm run web` | Run in web browser |
| `npm run build:web` | Build for web deployment |
| `npm run lint` | Run ESLint |
| `npm run test:app` | Run app tests (Jest) |
| `npm run test:backend` | Run backend tests |
| `npm test` | Run all tests |

### Backend Server (Optional - Phase 3)

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:4000` by default.

### Environment Variables

For the AI agent pipeline, create a `.env` file based on `.env.example`:

```bash
# Required: GitHub Personal Access Token
GITHUB_TOKEN=ghp_your_token_here

# Required: Repository info
GITHUB_REPO_OWNER=neuroshell
GITHUB_REPO_NAME=trapp

# Optional: Configuration
AGENT_TIMEOUT=300000        # 5 minutes per agent
AGENT_CONCURRENCY=3         # Max concurrent agents
APPROVAL_TIMEOUT=86400000   # 24 hours for approval
```

---

## Architecture

### Architecture Style

**Pattern:** Modular Monolith (Offline-First)

| Characteristic | Decision | Rationale |
|----------------|----------|-----------|
| **Architecture Style** | Modular Monolith | Small team, single codebase, clear module boundaries |
| **Deployment Model** | Mobile-first, backend optional | MVP works offline; backend added in Phase 3 |
| **Data Flow** | Unidirectional (React patterns) | Predictable state updates, easier debugging |
| **Sync Strategy** | Optimistic local-first | Immediate UX, background sync when online |

### Project Structure

```
trapp/
├── App.tsx                  # Main entry point, navigation setup
├── src/
│   ├── auth/                # Authentication context (AuthProvider, useAuth)
│   ├── components/          # Reusable UI components (Card, IconButton, etc.)
│   ├── navigation/          # Navigation types and configuration
│   ├── screens/             # Screen components (Home, Log, Calendar, etc.)
│   ├── domain/              # Business logic and models (proposed)
│   ├── models.ts            # TypeScript types (ActivityEntry, AppState)
│   ├── storage.ts           # AsyncStorage wrappers for app/auth state
│   ├── theme.ts             # Design tokens (colors, spacing, typography)
│   └── validation.ts        # Form validation utilities
├── backend/                 # Optional Express.js sync server (Phase 3)
├── __tests__/               # App-level tests
├── __mocks__/               # Jest mocks for Expo modules
├── scripts/                 # Utility scripts including AI agent pipeline
├── docs/                    # Comprehensive documentation
│   ├── reqs/                # Product requirements
│   ├── tech/                # Technical documentation
│   ├── tasks/               # Task specifications
│   ├── comms/               # Handoff documents
│   ├── adr/                 # Architecture Decision Records
│   └── reports/             # Test reports
├── .github/                 # GitHub Actions workflows
└── assets/                  # App icons and splash images
```

### Module Responsibilities

| Module | Responsibility | Dependencies |
|--------|----------------|--------------|
| **auth** | User authentication, session management | expo-crypto, AsyncStorage |
| **components** | Reusable UI primitives | React Native, expo-vector-icons |
| **screens** | Screen-level UI and user interactions | All lower modules |
| **navigation** | App routing and tab configuration | @react-navigation/* |
| **domain** | Business logic, models, validators | None (pure TypeScript) |
| **storage** | Local data persistence, migrations | AsyncStorage |
| **services** | External integrations (sync, export) | domain, storage, fetch API |

### Dependency Direction

```
┌─────────────────────────────────────────────────────────┐
│                      Screens                            │
│                         ↑                               │
│                         │ uses                          │
│                         ↓                               │
│         ┌───────────────┼───────────────┐               │
│         │               │               │               │
│    Components       Navigation       Domain             │
│         ↑               ↑               ↑               │
│         │               │               │               │
│         └───────────────┼───────────────┘               │
│                         │                               │
│                         ↓                               │
│                      Storage                            │
│                         ↑                               │
│                         │                               │
│                      Services                           │
└─────────────────────────────────────────────────────────┘

Rule: Dependencies point inward. Higher layers depend on lower layers.
      Domain and Storage have no dependencies on UI layers.
```

### Data Models

```typescript
type ActivityType = "running" | "squats" | "pushups" | "pullups" | "other";

interface WorkoutEntry {
  id: string;
  userId: string;
  type: ActivityType;
  timestamp: string; // ISO 8601
  data: {
    distance?: number; // km, for running
    duration?: number; // minutes, for running
    reps?: number; // for strength exercises
    sets?: number; // for strength exercises
    weight?: number; // kg, optional for strength
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  passwordHash?: string;
}
```

### Screen Components

| Screen | Route | Description |
|--------|-------|-------------|
| `SplashScreen` | - | Loading screen during auth check |
| `LoginScreen` | - | User authentication |
| `RegisterScreen` | - | User registration |
| `HomeScreen` | `Home` | Dashboard with stats, quick actions, recent activity |
| `LogScreen` | `Log` | Activity logging form with workout history |
| `CalendarScreen` | `Calendar` | Calendar view of workouts |
| `AchievementsScreen` | `Achievements` | Gamification/achievements |
| `SettingsScreen` | `Settings` | App settings |

### Navigation

Bottom tab navigator with 5 tabs:

```typescript
type RootTabParamList = {
  Home: undefined;
  Log: undefined;
  Calendar: undefined;
  Achievements: undefined;
  Settings: undefined;
};
```

Icons: Material Community Icons via `@expo/vector-icons`

---

## Development Conventions

### Code Style

- **ESLint**: `eslint-config-universe` (Expo/React Native focused)
- **TypeScript**: Strict mode enabled
- **React**: JSX transform (`react-jsx`)
- **Formatting**: Consistent use of spaces, semicolons required

### File Naming

- **Screens**: PascalCase, e.g., `HomeScreen.tsx`
- **Components**: PascalCase, e.g., `Card.tsx`, `IconButton.tsx`
- **Utils/Models**: camelCase, e.g., `models.ts`, `storage.ts`
- **Tests**: `*.test.ts` or `*.test.tsx`

### Component Patterns

- **Screen components**: Named exports: `export function HomeScreen(...)`
- **App entry**: Default export: `export default function App()`
- **Context hooks**: Custom hooks with `use` prefix: `useAuth()`, `useAppStorage()`
- **Reusable components**: Named exports from `src/components/`

### Testing Practices

- **Framework**: Jest with `jest-expo` preset
- **Component tests**: React Native Testing Library
- **Mocks**: Configured for Expo modules in `__mocks__/`
- **Coverage**: JUnit XML output for CI integration
- **Reports**: HTML + lcov + cobertura formats

### Git Workflow

- **Main branch**: `main` (production-ready)
- **Feature branches**: `feature/description` or auto-generated `agent-pipeline/auto-<run_id>`
- **PRs**: Required for main branch, auto-created by agent pipeline
- **Commits**: Conventional commits preferred

---

## CI/CD Pipeline

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | PR, push to main/develop | Lint, type-check, test, build |
| `cd-mobile.yml` | Push to main, tags v* | Build and deploy mobile apps |
| `cd-web.yml` | Push to main | Deploy web version to GitHub Pages |
| `agents-pipeline.yml` | Issue labeled, schedule, manual | AI agent SDLC automation |
| `security-scan.yml` | Schedule, PR | Security vulnerability scanning |

### CI Pipeline Stages

1. **Lint**: ESLint (root + backend)
2. **Type Check**: TypeScript compiler check
3. **Test App**: Jest tests for React Native code
4. **Test Backend**: Node.js native tests
5. **Build**: Web build artifact generation
6. **Coverage Summary**: Generate coverage reports
7. **Status Check**: Aggregate all job results

### Required Secrets

Configure in **GitHub Repository Settings → Secrets and variables → Actions**:

| Secret Name | Description |
|-------------|-------------|
| `EXPO_TOKEN` | Expo EAS authentication token |
| `APPLE_ID` | Apple ID for App Store Connect |
| `APPLE_PASSWORD` | App-specific password |
| `APPLE_TEAM_ID` | Apple Developer Team ID |
| `GOOGLE_SERVICE_ACCOUNT_KEY_JSON` | Google Play Service Account |
| `EAS_PROJECT_ID` | Expo project ID |

See `docs/tech/CI-CD.md` for complete CI/CD documentation.

---

## AI Agent SDLC Pipeline

The project includes an automated SDLC pipeline for processing GitHub Issues through specialized AI agents.

### Agent Types

| Agent | Phase | Approval Required |
|-------|-------|-------------------|
| `product-planner` | Specification | ✅ Yes |
| `software-architect` | Architecture | ✅ Yes |
| `ux-ui-designer` | Design | ✅ Yes |
| `expo-react-native-developer` | Development | ❌ No |
| `integration-tester` | Testing | ❌ No |
| `code-reviewer` | Code Review | ✅ Yes |

### Commands

| Command | Description |
|---------|-------------|
| `npm run agents:process` | Process all backlog items |
| `npm run agents:watch` | Continuous watch mode |
| `npm run agents:issue -- --issue=123` | Process specific issue |
| `npm run agents:setup` | Initialize agent scripts |

### Approval Gates

Pipeline pauses at approval phases and requires label to be added:

| Phase | Approval Label |
|-------|----------------|
| Specification | `spec-approved` |
| Architecture | `architecture-approved` |
| Design | `design-approved` |
| Code Review | `review-approved` |

See `AGENTS.md` for full documentation.

---

## Key Configuration Files

| File | Purpose |
|------|---------|
| `app.json` | Expo configuration (name, platforms, assets) |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration (extends expo/tsconfig.base) |
| `babel.config.js` | Babel configuration |
| `jest.config.js` | Jest test configuration |
| `.eslintrc.json` | ESLint rules |
| `eas.json` | EAS Build configuration |
| `tsconfig.ci.json` | TypeScript config for CI (excludes test files) |

---

## Theme System

Design tokens defined in `src/theme.ts`:

```typescript
// Colors
colors.primary      // #2E7DFF (blue)
colors.primaryAlt   // #36C4A5 (teal)
colors.accent       // #FF8C42 (orange)
colors.success      // #28A745 (green)
colors.error        // #E53935 (red)

// Spacing
spacing.xs  // 6
spacing.sm  // 10
spacing.md  // 14
spacing.lg  // 20
spacing.xl  // 28

// Typography
typography.title     // 28px
typography.sectionTitle // 20px
typography.body      // 16px
typography.small     // 13px
```

---

## Storage Layer

AsyncStorage wrappers in `src/storage.ts`:

- `loadAppState()` / `saveAppState()` / `clearAppState()` - App state persistence
- `loadAuthState()` / `saveAuthState()` / `clearAuthState()` - Auth persistence
- `getDeviceId()` - Unique device identifier generation
- `useAppStorage()` - React hook for storage operations

Storage keys:
- `TRAPP_TRACKER_STATE_V1` - App state
- `TRAPP_TRACKER_AUTH_V1` - Auth state
- `TRAPP_TRACKER_DEVICE_ID` - Device ID
- `TRAPP_TRACKER_USERS_V1` - User database
- `TRAPP_TRACKER_WORKOUTS_V1` - Workout entries

### Validation Rules

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| Distance | Number | Required for running, > 0, max 100 | "Please enter a valid distance (0-100 km)" |
| Duration | Number | Required for running, > 0, max 1440 | "Please enter a valid duration (0-1440 min)" |
| Reps | Integer | Required for strength, > 0, max 1000 | "Please enter valid reps (1-1000)" |
| Sets | Integer | Required for strength, > 0, max 100 | "Please enter valid sets (1-100)" |
| Weight | Number | Optional for strength, >= 0, max 500 | "Please enter a valid weight (0-500 kg)" |

---

## Backend API (Optional Sync Server - Phase 3)

Express.js server with lowdb for JSON file storage.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/sync` | Upload sync payload |
| `GET` | `/sync` | Download sync payload |

### Security Features (ADR-006)

- **Input Validation**: `sanitizeKey()` function blocks prototype pollution keys
- **Prototype-Safe Objects**: `Object.create(null)` for all user-controlled maps
- **Log Sanitization**: `sanitizeForLog()` prevents log injection attacks
- **SHA-256 password hashing**
- **CORS enabled**

See `docs/adr/ADR-006-backend-security.md` for complete security documentation.

---

## Product Documentation

### Target Users

**Primary Persona: "Casual Chris"**
- 25-40 years old, working professional
- Beginner to intermediate fitness level
- Needs: Simple tracking, visual progress, encouragement

**Secondary Persona: "Dedicated Dana"**
- 30-50 years old, fitness enthusiast
- Intermediate to advanced fitness level
- Needs: Comprehensive stats, export capabilities, detailed history

### Success Metrics (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users (DAU) | 2,000+ | Unique users per day |
| Weekly Active Users (WAU) | 5,000+ | Unique users per week |
| Session Frequency | 3+ sessions/week | Average workouts logged |
| Day-7 Retention | 60% | Users returning after 7 days |
| Day-30 Retention | 40% | Users returning after 30 days |
| Time to Log Workout | <10 seconds | Average logging time |

### Product Principles

1. **Simplicity First**: Every feature must justify its complexity
2. **Celebrate Progress**: Make every achievement feel meaningful
3. **Respect Time**: Minimize friction in every interaction
4. **Data Empowerment**: Users own and control their data
5. **Inclusive Design**: Accessible to all fitness levels
6. **Offline-First**: App works fully without network; sync is transparent

---

## Development Roadmap

### Phase 1: MVP (Weeks 5-12) - Current

**Goal:** Launch minimum viable product with core functionality

- ✅ Authentication (email/password, session persistence)
- ✅ Workout logging (running, squats, pushups, pullups)
- ✅ Form validation with inline errors
- ✅ Quick log functionality
- ✅ Delete workout with confirmation
- 🚧 Calendar view (basic implementation)
- 🚧 Statistics & achievements (basic implementation)

### Phase 2: Enhancement (Weeks 13-20)

- Progress trend charts
- Achievement expansion with gallery
- Onboarding flow
- Dark mode support
- Data export functionality

### Phase 3: Sync & Scale (Weeks 21-28)

- Express.js backend deployment
- Cloud sync implementation
- Multi-device support
- Conflict resolution

### Phase 4: Growth (Weeks 29+)

- Social features
- Wearable integration
- Personalization
- Advanced analytics

---

## Architecture Decision Records (ADRs)

| ADR | Title | Status |
|-----|-------|--------|
| ADR-001 | React Native + Expo for Cross-Platform Mobile | Accepted |
| ADR-002 | AsyncStorage for Local Persistence | Accepted |
| ADR-003 | Context API for State Management | Accepted |
| ADR-004 | Express.js + lowdb for Backend | Accepted (Phase 3) |
| ADR-005 | TypeScript for Type Safety | Accepted |
| ADR-006 | Backend Security Hardening | Accepted |

See `docs/tech/technical-decisions.md` and `docs/adr/` for complete ADR documentation.

---

## Architecture Significant Requirements (ASRs)

### Performance

| ASR | Requirement | Target |
|-----|-------------|--------|
| ASR-PERF-01 | Fast Workout Logging | < 10 seconds (95th percentile) |
| ASR-PERF-02 | Fast App Launch | < 3 seconds on mid-range devices |
| ASR-PERF-03 | Smooth Scroll Performance | 60 FPS with 100+ entries |

### Security

| ASR | Requirement | Target |
|-----|-------------|--------|
| ASR-SEC-01 | Password Protection | SHA-256 (MVP), bcrypt (Phase 3) |
| ASR-SEC-02 | Session Persistence Security | Encrypted at rest (Phase 2) |
| ASR-SEC-03 | Input Validation | 100% of required fields validated |

### Availability

| ASR | Requirement | Target |
|-----|-------------|--------|
| ASR-AVA-01 | Offline Operation | 100% of core features functional offline |
| ASR-AVA-02 | Graceful Error Handling | No full app crashes; > 90% recovery rate |
| ASR-AVA-03 | Data Recovery | Corruption detected and handled |

See `docs/tech/asr.md` for complete ASR documentation.

---

## Task Specifications

### Task 001: Authentication System

**Priority:** Must Have (MVP)
**Status:** Implemented

- ✅ User registration with email and password (min 8 characters)
- ✅ Email validation (RFC 5322 format)
- ✅ Password validation with inline feedback
- ✅ Auto-login after registration
- ✅ Session persistence across app restarts
- ✅ Logout clears session and navigates to login
- ✅ WCAG 2.1 AA accessibility compliance

See `docs/tasks/task-001-authentication.md` for complete specification.

### Task 002: Workout Logging System

**Priority:** Must Have (MVP) - CRITICAL
**Status:** Implemented

- ✅ Running workouts with distance (km) and duration (minutes)
- ✅ Strength workouts (squats, pushups, pullups) with reps and sets
- ✅ Quick log feature (< 10 seconds - CRITICAL metric)
- ✅ Quick action buttons on HomeScreen
- ✅ Form pre-fills with user's last values or defaults
- ✅ Full form validation with inline errors
- ✅ Delete workout with confirmation dialog
- ✅ Performance validated: quick log < 10 seconds

See `docs/tasks/task-002-workout-logging.md` for complete specification.

### Task 003: Calendar History

**Priority:** Must Have (MVP)
**Status:** In Progress

- Monthly calendar view with workout indicators
- Day detail view showing all workouts
- Calendar navigation (month switching)
- Empty states for months without workouts

See `docs/tasks/task-003-calendar-history.md` for specification.

### Task 004: Statistics & Achievements

**Priority:** Must Have (MVP)
**Status:** In Progress

- Weekly summary statistics
- Personal records tracking
- Basic achievement system
- Streak tracking
- Achievement unlock notifications

See `docs/tasks/task-004-statistics-achievements.md` for specification.

### Task 005: Backend Sync

**Priority:** Should Have (Phase 3)
**Status:** Planned

- Express.js backend deployment
- Cloud sync implementation
- Conflict resolution
- Multi-device support

See `docs/tasks/task-005-backend-sync.md` for specification.

---

## Design Handoff

### Component Library

Key components implemented:

| Component | File | Status |
|-----------|------|--------|
| Button | `src/components/PrimaryButton.tsx` | ✅ |
| Input | Built into forms | ✅ |
| Card | `src/components/Card.tsx` | ✅ |
| IconButton | `src/components/IconButton.tsx` | ✅ |
| DateTimeField | `src/components/DateTimeField.tsx` | ✅ |
| QuickLogButton | `src/components/QuickLogButton.tsx` | ✅ |
| LogRunningForm | `src/components/LogRunningForm.tsx` | ✅ |
| LogStrengthForm | `src/components/LogStrengthForm.tsx` | ✅ |
| DeleteConfirmationDialog | `src/components/DeleteConfirmationDialog.tsx` | ✅ |

### Accessibility Requirements (WCAG 2.1 AA)

- ✅ Color contrast: Minimum 4.5:1 for normal text, 3:1 for large text
- ✅ Touch targets: Minimum 44x44 points for all interactive elements
- ✅ Screen reader support: All elements have accessibility labels
- ✅ Error announcements: `accessibilityRole="alert"` for error messages
- ✅ Focus states: Visible for all interactive elements

See `docs/comms/UXUI_HANDOVER.md` and `docs/reqs/accessibility-guidelines.md` for complete design documentation.

---

## Current Status

### Implemented Features

- ✅ Project scaffolded with navigation structure
- ✅ Authentication flow (login/register with email validation, password hashing)
- ✅ Home screen with stats, progress tracking, quick actions, recent activity
- ✅ Workout logging with running and strength exercise forms
- ✅ Storage layer with AsyncStorage (users, auth, workouts)
- ✅ Backend sync server with security hardening (ADR-006)
- ✅ AI agent SDLC pipeline configured
- ✅ CI/CD pipelines (lint, test, build, deploy, security scan)
- ✅ Form validation with outlier detection
- ✅ Delete workout functionality with confirmation dialog
- ✅ Accessibility support (screen reader announcements)
- ✅ Comprehensive documentation (product vision, architecture, ASRs, ADRs, tasks)

### In Progress

- 🚧 Calendar view (basic implementation)
- 🚧 Achievements system (basic implementation)
- 🚧 Statistics dashboard enhancement

### Planned (Phase 2-3)

- ⏳ Progress charts and trend visualization
- ⏳ Enhanced achievement gallery
- ⏳ Onboarding flow
- ⏳ Dark mode support
- ⏳ Data export functionality
- ⏳ Cloud sync backend (Phase 3)

---

## Notes

- The app uses **Material Community Icons** via `@expo/vector-icons`
- Backend uses **lowdb** for JSON file storage and **nanoid** for ID generation
- CI/CD helpers available in `scripts/ci-helpers.sh` (Unix) and `scripts/ci-helpers.ps1` (Windows)
- Coverage parsing script: `scripts/parse-coverage.js`
- All dates stored as ISO 8601 strings
- Passwords are hashed client-side with SHA-256 before storage (demo purposes only; bcrypt in Phase 3)
- Email normalization: trimmed and lowercased before storage
- Password requirements: minimum 8 characters, at least one number
- **Critical Performance Metric**: Workout logging must complete in under 10 seconds (95th percentile)

---

## Documentation Index

### Product Documentation (`docs/reqs/`)

- `product-vision.md` - Vision statement, target users, success metrics
- `user-stories.md` - 25+ user stories with acceptance criteria
- `features.md` - Detailed feature specifications
- `roadmap.md` - 4-phase development plan
- `user-flows.md` - Primary user journey diagrams
- `wireframes.md` - Screen wireframes and layouts
- `design-system.md` - Color palette, typography, components
- `accessibility-guidelines.md` - WCAG 2.1 AA compliance checklist

### Technical Documentation (`docs/tech/`)

- `architecture.md` - System architecture overview (C4 diagrams)
- `asr.md` - Architecture Significant Requirements
- `technical-decisions.md` - Architecture Decision Records (ADRs)
- `CI-CD.md` - Complete CI/CD pipeline documentation

### Task Specifications (`docs/tasks/`)

- `task-001-authentication.md` - Authentication system implementation
- `task-002-workout-logging.md` - Workout logging system (CRITICAL)
- `task-003-calendar-history.md` - Calendar view implementation
- `task-004-statistics-achievements.md` - Statistics and achievements
- `task-005-backend-sync.md` - Backend sync server (Phase 3)

### Architecture Decision Records (`docs/adr/`)

- `ADR-006-backend-security.md` - Backend security hardening

### Handoff Documents (`docs/comms/`)

- `ARCHITECT_HANDOVER.md` - Architecture handoff request
- `developer-handoff.md` - Developer implementation guide
- `UXUI_HANDOVER.md` - UX/UI design handoff

### Reports (`docs/reports/`)

- `CI_CD_TEST_REPORT.md` - CI/CD pipeline test results
- `INTEGRATION_TEST_REPORT.md` - Integration test results
- `task-001-integration-test-report.md` - Task 001 test report

---

_Last Updated: March 16, 2026_
_Document Version: 2.0 (Comprehensive Update)_
