# Trapp Tracker - Project Context

## Project Overview

**Trapp Tracker** (also called **FitTrack Pro**) is a cross-platform fitness tracking application built with **React Native + Expo**. The app allows users to log workout activities (running, squats, pushups, pullups), track progress, view calendar history, and earn achievements.

### Tech Stack

- **Frontend**: React Native 0.81.5, Expo SDK 54.0.0
- **Language**: TypeScript 5.9.2
- **Navigation**: React Navigation 7.x (Bottom Tabs)
- **State Management**: React Context API (AuthContext)
- **Storage**: AsyncStorage for local persistence
- **Backend**: Express.js server with lowdb (optional sync server)
- **Testing**: Jest + jest-expo + React Native Testing Library

### Architecture

```
trapp/
├── App.tsx              # Main entry point, navigation setup
├── src/
│   ├── auth/            # Authentication context (AuthProvider, useAuth)
│   ├── components/      # Reusable UI components (Card, IconButton)
│   ├── navigation/      # Navigation types and configuration
│   ├── screens/         # Screen components (Home, Log, Calendar, etc.)
│   ├── models.ts        # TypeScript types (ActivityEntry, AppState)
│   ├── storage.ts       # AsyncStorage wrappers for app/auth state
│   └── theme.ts         # Design tokens (colors, spacing, typography)
├── backend/             # Optional Express.js sync server
├── __tests__/           # App-level tests
├── __mocks__/           # Jest mocks for Expo modules
├── scripts/             # Utility scripts including AI agent pipeline
└── .github/             # GitHub Actions workflows
```

## Building and Running

### Prerequisites

- Node.js LTS (https://nodejs.org/)
- npm (comes with Node.js)
- Expo CLI (optional, can use `npx expo`)

### Installation

```bash
cd trapp
npm install
```

### Development Commands

| Command                | Description                    |
| ---------------------- | ------------------------------ |
| `npm start`            | Start Expo dev server          |
| `npm run android`      | Run on Android device/emulator |
| `npm run ios`          | Run on iOS simulator           |
| `npm run web`          | Run in web browser             |
| `npm run build:web`    | Build for web deployment       |
| `npm run lint`         | Run ESLint                     |
| `npm run test:app`     | Run app tests (Jest)           |
| `npm run test:backend` | Run backend tests              |
| `npm test`             | Run all tests                  |

### Backend Server

```bash
cd backend
npm install
npm start
```

### AI Agent Pipeline

The project includes an automated SDLC pipeline for processing GitHub Issues:

| Command                               | Description               |
| ------------------------------------- | ------------------------- |
| `npm run agents:process`              | Process all backlog items |
| `npm run agents:watch`                | Continuous watch mode     |
| `npm run agents:issue -- --issue=123` | Process specific issue    |
| `npm run agents:setup`                | Initialize agent scripts  |

See `AGENTS.md` for full documentation on the AI agent pipeline.

## Key Features

### Authentication

- Simple username/password login (SHA-256 hashed via `expo-crypto`)
- Persistent auth state via AsyncStorage
- AuthContext provides `signIn`, `signOut`, `user`, `loading`

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
```

### Screens

- **HomeScreen**: Dashboard with stats, quick actions, recent activity
- **LogScreen**: Activity logging form
- **CalendarScreen**: Calendar view of workouts
- **AchievementsScreen**: Gamification/achievements
- **SettingsScreen**: App settings
- **LoginScreen**: User authentication
- **SplashScreen**: Loading screen

## Development Conventions

### Code Style

- ESLint with `eslint-config-universe` (Expo/React Native focused)
- TypeScript strict mode enabled
- React JSX transform (`react-jsx`)

### Testing

- Jest with `jest-expo` preset
- React Native Testing Library for component tests
- Mocks configured for Expo modules in `__mocks__/`
- Test files: `*.test.ts` or `*.test.tsx`
- JUnit XML output for CI integration

### Project Structure Patterns

- Screen components are named exports: `export function HomeScreen(...)`
- App entry uses default export: `export default function App()`
- Types/interfaces defined in `src/models.ts`
- Storage operations use async/await with error handling
- Theme constants defined in `src/theme.ts`

## Configuration Files

| File              | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `app.json`        | Expo configuration (name, platforms, assets)           |
| `package.json`    | Dependencies and scripts                               |
| `tsconfig.json`   | TypeScript configuration (extends expo/ts.config.base) |
| `babel.config.js` | Babel configuration                                    |
| `jest.config.js`  | Jest test configuration                                |
| `.eslintrc.json`  | ESLint rules                                           |
| `.env.example`    | Environment variable template for AI agents            |
| `eas.json`        | EAS Build configuration                                |

## Environment Variables

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

## Current Status

- ✅ Project scaffolded with navigation structure
- ✅ Authentication flow implemented
- ✅ Home screen with UI components
- ✅ Storage layer with AsyncStorage
- ✅ Backend sync server skeleton
- ✅ AI agent SDLC pipeline configured
- 🚧 Workout logging functionality (in development)
- 🚧 Calendar view and achievements (planned)

## Notes

- The app uses Material Community Icons via `@expo/vector-icons`
- Backend uses `lowdb` for JSON file storage and `nanoid` for ID generation
- CI/CD helpers available in `scripts/ci-helpers.sh` (Unix) and `scripts/ci-helpers.ps1` (Windows)
- Coverage parsing script: `scripts/parse-coverage.js`
