# Trapp Tracker (FitTrack Pro) - Project Context

## Project Overview

**Trapp Tracker** (also branded as **FitTrack Pro**) is a cross-platform fitness tracking application built with **React Native + Expo**. The app enables users to log workout activities (running, squats, pushups, pullups), track progress over time, view calendar history, and earn achievements through gamification.

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native 0.81.5, Expo SDK 54.0.0 |
| **Language** | TypeScript 5.9.2 |
| **Navigation** | React Navigation 7.x (Bottom Tabs) |
| **State Management** | React Context API (AuthContext) |
| **Storage** | AsyncStorage (local persistence) |
| **Backend** | Express.js + lowdb (optional sync server) |
| **Testing** | Jest + jest-expo + React Native Testing Library |
| **CI/CD** | GitHub Actions (lint, test, build, deploy) |

### Key Features

- **Authentication**: Simple username/password login with SHA-256 hashing (via `expo-crypto`)
- **Activity Logging**: Track running, squats, pushups, pullups, and custom activities
- **Progress Tracking**: View workout history with timestamps and notes
- **Calendar View**: Visual calendar of workout history
- **Achievements**: Gamification system for motivation
- **Offline-First**: AsyncStorage for local persistence with optional backend sync

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

### Backend Server (Optional)

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

### Project Structure

```
trapp/
├── App.tsx              # Main entry point, navigation setup
├── src/
│   ├── auth/            # Authentication context (AuthProvider, useAuth)
│   ├── components/      # Reusable UI components (Card, IconButton, etc.)
│   ├── navigation/      # Navigation types and configuration
│   ├── screens/         # Screen components (Home, Log, Calendar, etc.)
│   ├── models.ts        # TypeScript types (ActivityEntry, AppState)
│   ├── storage.ts       # AsyncStorage wrappers for app/auth state
│   └── theme.ts         # Design tokens (colors, spacing, typography)
├── backend/             # Optional Express.js sync server
├── __tests__/           # App-level tests
├── __mocks__/           # Jest mocks for Expo modules
├── scripts/             # Utility scripts including AI agent pipeline
├── .github/             # GitHub Actions workflows
└── assets/              # App icons and splash images
```

### Data Models

```typescript
type ActivityType = "running" | "squats" | "pushups" | "pullups" | "other";

interface ActivityEntry {
  id: string;
  type: ActivityType;
  date: string; // ISO date string
  quantity: number; // reps, minutes, etc.
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  entries: ActivityEntry[];
}
```

### Screen Components

| Screen | Route | Description |
|--------|-------|-------------|
| `SplashScreen` | - | Loading screen during auth check |
| `LoginScreen` | - | User authentication |
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
| `cd-mobile.yml` | Push to main | Build and deploy mobile apps |
| `cd-web.yml` | Push to main | Deploy web version |
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

- `loadAppState()` / `saveAppState()` / `clearAppState()` - App data persistence
- `loadAuthState()` / `saveAuthState()` / `clearAuthState()` - Auth persistence
- `getDeviceId()` - Unique device identifier generation
- `useAppStorage()` - React hook for storage operations

Storage keys:
- `TRAPP_TRACKER_STATE_V1` - App state
- `TRAPP_TRACKER_AUTH_V1` - Auth state
- `TRAPP_TRACKER_DEVICE_ID` - Device ID

---

## Backend API (Optional Sync Server)

Express.js server with lowdb for JSON file storage.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/sync` | Upload sync payload |
| `GET` | `/sync` | Download sync payload |

### Security Features

- SHA-256 password hashing
- Prototype pollution prevention (Map-based storage)
- Input sanitization for usernames and device IDs
- Log injection prevention
- CORS enabled

---

## Current Status

- ✅ Project scaffolded with navigation structure
- ✅ Authentication flow implemented
- ✅ Home screen with UI components
- ✅ Storage layer with AsyncStorage
- ✅ Backend sync server with security hardening
- ✅ AI agent SDLC pipeline configured
- ✅ CI/CD pipelines (lint, test, build, deploy)
- ✅ Workout logging functionality implemented
- 🚧 Calendar view (basic implementation)
- 🚧 Achievements system (basic implementation)

---

## Notes

- The app uses **Material Community Icons** via `@expo/vector-icons`
- Backend uses **lowdb** for JSON file storage and **nanoid** for ID generation
- CI/CD helpers available in `scripts/ci-helpers.sh` (Unix) and `scripts/ci-helpers.ps1` (Windows)
- Coverage parsing script: `scripts/parse-coverage.js`
- All dates stored as ISO 8601 strings
- Passwords are hashed client-side before storage (demo purposes only)
