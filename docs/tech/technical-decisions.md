# Trapp Tracker - Technical Decisions (ADRs)

**Version:** 1.0  
**Last Updated:** 2026-03-15  
**Status:** Active

---

## Overview

This document captures Architecture Decision Records (ADRs) for Trapp Tracker. Each ADR documents a significant technical decision, its context, the chosen solution, alternatives considered, and consequences.

### ADR Status Definitions

| Status          | Meaning                                  |
| --------------- | ---------------------------------------- |
| **Proposed**    | Decision suggested, awaiting team review |
| **Accepted**    | Decision approved and being implemented  |
| **Deprecated**  | Decision no longer recommended           |
| **Superseded**  | Decision replaced by a newer ADR         |
| **Implemented** | Decision fully implemented in codebase   |

---

## ADR Index

| ADR                                                              | Title                                         | Status   | Date       |
| ---------------------------------------------------------------- | --------------------------------------------- | -------- | ---------- |
| [ADR-001](#adr-001-react-native--expo-for-cross-platform-mobile) | React Native + Expo for Cross-Platform Mobile | Accepted | 2026-03-15 |
| [ADR-002](#adr-002-asyncstorage-for-local-persistence)           | AsyncStorage for Local Persistence            | Accepted | 2026-03-15 |
| [ADR-003](#adr-003-context-api-for-state-management)             | Context API for State Management              | Accepted | 2026-03-15 |
| [ADR-004](#adr-004-expressjs--lowdb-for-backend)                 | Express.js + lowdb for Backend                | Accepted | 2026-03-15 |
| [ADR-005](#adr-005-typescript-for-type-safety)                   | TypeScript for Type Safety                    | Accepted | 2026-03-15 |

---

## ADR-001: React Native + Expo for Cross-Platform Mobile

### Status

**Accepted** - 2026-03-15

### Context

Trapp Tracker needs to support both iOS and Android platforms to reach the target audience (Product Vision: "Cross-Platform: Seamless experience across all devices"). The team is small (1-3 developers) and needs to ship an MVP within 8-12 weeks.

**Requirements:**

- Single codebase for iOS and Android (US-6.1, US-7.1)
- Fast iteration and deployment
- Access to native features (crypto, storage, notifications)
- Support for Expo managed workflow preferred (simplifies native dependencies)

**Constraints:**

- Small team with limited native mobile expertise
- Need to support both app stores
- OTA updates desirable for bug fixes

### Decision

**Use React Native with Expo (managed workflow) for mobile development.**

**Specific choices:**

- React Native 0.81.5 (via Expo SDK ~55.0.6)
- Expo managed workflow (not bare)
- React Navigation v6 for navigation
- expo-crypto for cryptographic operations
- @react-native-async-storage/async-storage for persistence

### Alternatives Considered

| Alternative                                      | Pros                                         | Cons                                               | Verdict                                           |
| ------------------------------------------------ | -------------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| **Native iOS (Swift) + Native Android (Kotlin)** | Best performance, full API access            | 2x development effort, requires native expertise   | Rejected - team too small                         |
| **React Native (bare workflow)**                 | More native module flexibility               | Complex setup, manual native dependency management | Rejected - MVP doesn't need custom native modules |
| **Flutter**                                      | Good performance, single codebase            | Dart language learning curve, smaller ecosystem    | Rejected - team has React experience              |
| **Ionic/Capacitor**                              | Web technologies, single codebase            | Performance limitations, less native feel          | Rejected - RN provides better UX                  |
| **Expo (managed)**                               | Fast setup, OTA updates, managed native deps | Limited native module access                       | **Selected** - best fit for MVP                   |

### Consequences

#### Positive

- **Single codebase**: ~60% code reuse between iOS and Android
- **Fast iteration**: Expo Go for instant testing, fast refresh
- **OTA updates**: Can push JS updates without app store review (expo-updates)
- **Simplified native deps**: Expo handles native module linking
- **Team alignment**: Leverages existing React/JavaScript skills

#### Negative

- **Limited native modules**: Cannot use arbitrary native libraries without ejecting
- **App size**: Expo apps are larger (~25-30MB) than bare RN
- **Build control**: Less control over native build configuration
- **Dependency on Expo**: Must follow Expo SDK release cycle

#### Mitigation Strategies

- **Native module limitation**: Evaluate bare workflow if required modules unavailable
- **App size**: Optimize assets, code split for Phase 2+
- **Expo dependency**: Maintain escape hatch to bare workflow if needed

### Compliance

| Requirement                       | Compliance                                |
| --------------------------------- | ----------------------------------------- |
| Cross-platform (US-6.1)           | ✓ Supported                               |
| Fast iteration                    | ✓ Supported                               |
| Native features (crypto, storage) | ✓ Supported via expo-crypto, AsyncStorage |
| OTA updates                       | ✓ Supported via expo-updates              |

### Related Decisions

- [ADR-003](#adr-003-context-api-for-state-management) - State management within RN
- [ADR-005](#adr-005-typescript-for-type-safety) - Type safety in RN development

### References

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Product Vision](../reqs/product-vision.md) - Cross-platform requirement

---

## ADR-002: AsyncStorage for Local Persistence

### Status

**Accepted** - 2026-03-15

### Context

Trapp Tracker is an offline-first application (US-6.1: "App must work offline"). All workout data must persist locally and be available immediately. The MVP does not require cloud sync (Phase 3 feature).

**Requirements:**

- Local data persistence for workouts, user profile, achievements (US-6.1)
- Fast read/write for workout logging (< 10 seconds, ASR-PERF-01)
- Simple API for CRUD operations
- Works in Expo managed workflow
- Sufficient capacity for expected data volume (< 10MB for MVP)

**Constraints:**

- Must work offline
- Must be available in Expo managed workflow
- Team has limited mobile database experience

### Decision

**Use @react-native-async-storage/async-storage for local data persistence in MVP.**

**Implementation approach:**

- Wrap AsyncStorage in `src/storage.ts` abstraction layer
- Store data as JSON strings
- Include schema version for future migrations
- Plan migration path to SQLite or expo-secure-store for Phase 2+

### Alternatives Considered

| Alternative                        | Pros                                       | Cons                                          | Verdict                                  |
| ---------------------------------- | ------------------------------------------ | --------------------------------------------- | ---------------------------------------- |
| **AsyncStorage**                   | Simple API, Expo-compatible, no setup      | ~6MB limit on some Android, no queries        | **Selected** - sufficient for MVP        |
| **expo-sqlite**                    | Full SQL queries, better for complex data  | More complex, larger bundle, overkill for MVP | Rejected - premature optimization        |
| **WatermelonDB**                   | Reactive, offline-first, good sync support | Complex setup, learning curve                 | Rejected - too complex for MVP           |
| **Realm**                          | Fast, object-oriented, built-in sync       | Larger bundle, MongoDB dependency             | Rejected - overkill for MVP              |
| **expo-secure-store**              | Encrypted, secure                          | Limited to small values (~2KB per item)       | Rejected - not suitable for workout data |
| **File system (expo-file-system)** | Full control, no size limits               | Manual serialization, more complex            | Rejected - unnecessary complexity        |

### Consequences

#### Positive

- **Simplicity**: Key-value API is straightforward
- **Expo compatibility**: Works out-of-box in managed workflow
- **Fast for small data**: Sub-100ms reads/writes for MVP data volume
- **No dependencies**: Part of React Native core ecosystem

#### Negative

- **Size limits**: ~6MB on some Android devices (RISK-001)
- **No queries**: Must load entire dataset to filter
- **No encryption**: Data stored in plaintext (mitigated in Phase 2)
- **Performance degrades**: Slower with large values (> 1MB)

#### Mitigation Strategies

- **Size limits**: Monitor storage usage; warn users at 80% capacity
- **No queries**: Keep dataset denormalized; use indexes in memory
- **No encryption**: Add expo-secure-store for sensitive data in Phase 2
- **Performance**: Split large datasets into multiple keys

### Migration Path (Phase 3)

When AsyncStorage limits are approached:

```
Phase 1 (MVP): AsyncStorage
    ↓
Phase 2: AsyncStorage + expo-secure-store (for sensitive data)
    ↓
Phase 3: SQLite or WatermelonDB (for workout data)
```

### Compliance

| Requirement                        | Compliance  |
| ---------------------------------- | ----------- |
| Offline persistence (US-6.1)       | ✓ Supported |
| Fast workout logging (ASR-PERF-01) | ✓ Supported |
| Expo managed workflow              | ✓ Supported |
| Data capacity (< 10MB MVP)         | ✓ Supported |

### Related Decisions

- [ADR-004](#adr-004-expressjs--lowdb-for-backend) - Cloud sync storage (Phase 3)
- [ADR-003](#adr-003-context-api-for-state-management) - State management with persistence

### References

- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [ASR-PERF-01](./asr.md#asr-perf-01-fast-workout-logging)
- [User Story US-6.1](./user-stories.md#us-61-local-data-persistence)

---

## ADR-003: Context API for State Management

### Status

**Accepted** - 2026-03-15

### Context

Trapp Tracker requires global state management for:

- User authentication state (AuthProvider)
- App-wide theme/settings
- Workout data (shared across screens)
- Achievement notifications

The team is small and values simplicity. The MVP has limited state complexity.

**Requirements:**

- Global state accessible from any screen
- Minimal boilerplate for small team
- TypeScript support
- No or low learning curve
- Sufficient for MVP scale (< 10 global state slices)

**Constraints:**

- Small team (1-3 developers)
- Need to ship MVP quickly
- Team has React experience

### Decision

**Use React Context API for global state management in MVP.**

**Implementation approach:**

- Create context providers for each domain (AuthContext, ThemeContext)
- Keep state slices separate (not one monolithic store)
- Use `useMemo` to prevent unnecessary re-renders
- Plan migration to Zustand if performance issues arise

### Alternatives Considered

| Alternative              | Pros                                    | Cons                                  | Verdict                            |
| ------------------------ | --------------------------------------- | ------------------------------------- | ---------------------------------- |
| **Context API**          | Built-in, no dependencies, simple       | Can cause re-renders, no devtools     | **Selected** - best for MVP        |
| **Redux Toolkit**        | Devtools, middleware, predictable       | Boilerplate, learning curve, overkill | Rejected - too complex for MVP     |
| **Zustand**              | Simple API, devtools, no boilerplate    | External dependency, newer library    | Rejected - not needed yet          |
| **Jotai/Recoil**         | Atomic updates, great for derived state | Newer, smaller community              | Rejected - team unfamiliar         |
| **MobX**                 | Reactive, minimal boilerplate           | Magic behavior, larger bundle         | Rejected - team prefers explicit   |
| **useReducer + Context** | More structured than plain Context      | Still requires careful optimization   | Considered - may adopt per-context |

### Consequences

#### Positive

- **Zero dependencies**: Built into React
- **Simple API**: Easy for team to understand
- **TypeScript support**: Full type inference
- **Flexible**: Can create multiple contexts for different domains

#### Negative

- **Re-render risk**: Context updates trigger re-renders in all consumers
- **No devtools**: Harder to debug state changes
- **No middleware**: Cannot easily add logging, persistence, etc.
- **Testing complexity**: Need to wrap components with providers

#### Mitigation Strategies

- **Re-renders**: Split contexts by domain; use `useMemo` for values
- **Devtools**: Add React DevTools for inspection
- **Testing**: Create test utilities with pre-wrapped providers
- **Performance**: Profile with React Performance Monitor; migrate if issues

### Migration Path

If Context API causes performance issues:

```
Phase 1 (MVP): Context API
    ↓
Phase 2 (if needed): Zustand (minimal migration effort)
    ↓
Phase 3: Redux Toolkit (only if complex state needed)
```

### Usage Guidelines

**Do:**

- Create separate contexts for unrelated state (AuthContext, ThemeContext)
- Use `useMemo` for context values
- Keep state slices small and focused

**Don't:**

- Create one monolithic app context
- Store frequently-updating state in Context (use local state instead)
- Pass complex objects without memoization

### Compliance

| Requirement             | Compliance  |
| ----------------------- | ----------- |
| Global state access     | ✓ Supported |
| Minimal boilerplate     | ✓ Supported |
| TypeScript support      | ✓ Supported |
| MVP scale (< 10 slices) | ✓ Supported |

### Related Decisions

- [ADR-001](#adr-001-react-native--expo-for-cross-platform-mobile) - React Native framework
- [ADR-002](#adr-002-asyncstorage-for-local-persistence) - Persistence layer

### References

- [React Context Documentation](https://react.dev/reference/react/useContext)
- [ASR-MOD-01](./asr.md#asr-mod-01-module-independence)

---

## ADR-004: Express.js + lowdb for Backend

### Status

**Accepted** - 2026-03-15

### Context

Phase 3 of the roadmap introduces cloud sync for multi-device users (US-6.2). The backend needs to:

- Store user accounts and workout data
- Provide sync API for mobile clients
- Handle conflict resolution
- Support 10,000+ users by Phase 4 (Product Vision)

The team is small with limited backend experience. The MVP (Phase 1-2) does not require a backend.

**Requirements:**

- Simple setup and deployment
- RESTful API for mobile clients
- User authentication
- Data sync endpoints
- Low operational overhead
- Cost-effective for early stages

**Constraints:**

- Small team (1-3 developers)
- Limited backend expertise
- Budget constraints (Phase 1-2)
- Need to focus on mobile experience first

### Decision

**Use Express.js with lowdb (JSON file storage) for Phase 3 backend.**

**Implementation approach:**

- Single Express.js server (`backend/index.js`)
- lowdb for JSON file-based persistence
- Simple user authentication (username + password hash)
- Sync endpoints: POST /sync (upload), GET /sync (download)
- Deploy to single server (Heroku, Railway, or similar)

### Alternatives Considered

| Alternative                 | Pros                                      | Cons                                        | Verdict                          |
| --------------------------- | ----------------------------------------- | ------------------------------------------- | -------------------------------- |
| **Express.js + lowdb**      | Simple, zero DB setup, single file deploy | Not scalable, file-based concurrency limits | **Selected** - best for Phase 3  |
| **Express.js + PostgreSQL** | Scalable, ACID transactions, mature       | More setup, DB management, overkill for MVP | Rejected - premature for Phase 3 |
| **Firebase**                | Managed, real-time sync, auth included    | Vendor lock-in, cost at scale, less control | Rejected - prefer self-hosted    |
| **Supabase**                | Open-source Firebase, PostgreSQL          | Still managed service, learning curve       | Rejected - team wants control    |
| **AWS Amplify**             | Full backend suite, managed               | Complex, AWS lock-in, cost                  | Rejected - too complex           |
| **Serverless (Lambda)**     | Pay-per-use, auto-scaling                 | Cold starts, more complex deployment        | Rejected - not needed yet        |

### Consequences

#### Positive

- **Simplicity**: Single file database, no DB setup
- **Fast prototyping**: Can iterate quickly on API design
- **Low cost**: Free/cheap hosting for early stages
- **Team alignment**: JavaScript/TypeScript across stack
- **Easy deployment**: Single Node.js process

#### Negative

- **Scalability limits**: File-based DB cannot handle high concurrency (RISK-005)
- **No ACID transactions**: Potential data corruption on concurrent writes
- **Single point of failure**: No built-in redundancy
- **Backup complexity**: Must manage file backups manually

#### Mitigation Strategies

- **Scalability**: Plan PostgreSQL migration at 1,000+ concurrent users
- **Concurrency**: Single-writer design; queue writes
- **Reliability**: Regular file backups; consider managed hosting
- **Monitoring**: Add health checks and alerting

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Mobile App    │────▶│  Express.js API  │────▶│   lowdb      │
│  (React Native) │◀────│   (backend/)     │◀────│  (data.json) │
└─────────────────┘     └──────────────────┘     └──────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   File System │
                        │   (JSON)      │
                        └──────────────┘
```

### API Endpoints (Phase 3)

| Method | Endpoint       | Purpose               |
| ------ | -------------- | --------------------- |
| POST   | /auth/register | User registration     |
| POST   | /auth/login    | User login            |
| POST   | /sync          | Upload sync payload   |
| GET    | /sync          | Download sync payload |
| GET    | /health        | Health check          |

### Migration Path (Phase 4)

When concurrent users exceed 1,000:

```
Phase 3: Express.js + lowdb
    ↓
Phase 4: Express.js + PostgreSQL (or managed DB)
    ↓
Phase 4+: Consider microservices if team scales
```

### Compliance

| Requirement              | Compliance           |
| ------------------------ | -------------------- |
| Cloud sync (US-6.2)      | ✓ Supported          |
| User authentication      | ✓ Supported          |
| 10,000 users (Phase 4)   | ○ Requires migration |
| Low operational overhead | ✓ Supported          |

### Related Decisions

- [ADR-002](#adr-002-asyncstorage-for-local-persistence) - Local storage (mobile)
- [ADR-005](#adr-005-typescript-for-type-safety) - Type safety (consider TypeScript for backend)

### References

- [Express.js Documentation](https://expressjs.com/)
- [lowdb Documentation](https://github.com/typicode/lowdb)
- [User Story US-6.2](./reqs/user-stories.md#us-62-cloud-sync-optional-backend)
- [Roadmap Phase 3](./reqs/roadmap.md)

---

## ADR-005: TypeScript for Type Safety

### Status

**Accepted** - 2026-03-15

### Context

Trapp Tracker is a cross-platform application with multiple layers (UI, domain, storage, backend). Type safety helps prevent runtime errors, improves IDE support, and makes refactoring safer.

The team values code quality and maintainability. TypeScript is widely adopted in the React Native ecosystem.

**Requirements:**

- Catch errors at compile time
- Better IDE autocomplete and refactoring
- Document code intent through types
- Support for React Native and Express.js
- Manageable learning curve

**Constraints:**

- Team has JavaScript/TypeScript experience
- Need to balance type safety with development speed
- Must work with Expo and React Native

### Decision

**Use TypeScript for all frontend and backend code.**

**Implementation approach:**

- Strict mode enabled in `tsconfig.json`
- Define interfaces for all domain models (`src/models.ts`)
- Type all function parameters and return values
- Use TypeScript in backend (`backend/` folder)
- Gradual migration for any existing JavaScript code

### Alternatives Considered

| Alternative            | Pros                                  | Cons                                 | Verdict                                 |
| ---------------------- | ------------------------------------- | ------------------------------------ | --------------------------------------- |
| **TypeScript**         | Type safety, IDE support, refactoring | Compile step, learning curve         | **Selected** - best for maintainability |
| **JavaScript (JSDoc)** | No compile step, flexible             | Less type safety, weaker IDE support | Rejected - team prefers types           |
| **JavaScript (plain)** | Fast prototyping, no setup            | Runtime errors, harder refactoring   | Rejected - not maintainable             |
| **Flow**               | Type checking for JS                  | Deprecated, smaller ecosystem        | Rejected - TypeScript is standard       |

### Consequences

#### Positive

- **Type safety**: Catch errors before runtime
- **IDE support**: Better autocomplete, go-to-definition, refactoring
- **Documentation**: Types serve as living documentation
- **Confidence**: Safer refactoring and code changes
- **Ecosystem**: TypeScript is the React Native standard

#### Negative

- **Compile step**: Adds build time (minimal with Expo)
- **Learning curve**: Team members need TypeScript knowledge
- **Boilerplate**: More code for type definitions
- **False security**: Types don't guarantee correctness

#### Mitigation Strategies

- **Compile time**: Use fast refresh; compile is incremental
- **Learning curve**: Provide TypeScript guidelines; pair programming
- **Boilerplate**: Use type inference where possible; avoid over-typing
- **False security**: Combine with tests; types + tests = confidence

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node"
  }
}
```

### Type Guidelines

**Do:**

- Define interfaces for domain models
- Use type inference for local variables
- Type function parameters and return values
- Use union types for constrained values

**Don't:**

- Use `any` unless absolutely necessary
- Over-engineer types (avoid excessive generics)
- Duplicate types between frontend and backend (consider shared package Phase 4)

### Example: Domain Model

```typescript
// src/models.ts
export type ActivityType =
  | "running"
  | "squats"
  | "pushups"
  | "pullups"
  | "other";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  date: string; // ISO date string
  quantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  entries: ActivityEntry[];
}
```

### Compliance

| Requirement                | Compliance            |
| -------------------------- | --------------------- |
| Type safety                | ✓ Supported           |
| IDE support                | ✓ Supported           |
| React Native compatibility | ✓ Supported           |
| Backend compatibility      | ✓ Supported (Phase 3) |

### Related Decisions

- [ADR-001](#adr-001-react-native--expo-for-cross-platform-mobile) - React Native framework
- [ADR-004](#adr-004-expressjs--lowdb-for-backend) - Backend technology

### References

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Expo TypeScript Guide](https://docs.expo.dev/guides/typescript/)

---

## Decision Log

| Date       | Decision                     | Author    | Status   |
| ---------- | ---------------------------- | --------- | -------- |
| 2026-03-15 | ADR-001: React Native + Expo | Architect | Accepted |
| 2026-03-15 | ADR-002: AsyncStorage        | Architect | Accepted |
| 2026-03-15 | ADR-003: Context API         | Architect | Accepted |
| 2026-03-15 | ADR-004: Express.js + lowdb  | Architect | Accepted |
| 2026-03-15 | ADR-005: TypeScript          | Architect | Accepted |

---

## Future ADRs (Proposed)

The following ADRs should be created as the project evolves:

| ADR     | Title                                           | Target Phase |
| ------- | ----------------------------------------------- | ------------ |
| ADR-006 | Data Export Format (JSON vs CSV)                | Phase 2      |
| ADR-007 | Chart Library Selection                         | Phase 2      |
| ADR-008 | Sync Conflict Resolution Strategy               | Phase 3      |
| ADR-009 | Backend Database Migration (lowdb → PostgreSQL) | Phase 4      |
| ADR-010 | Push Notification Strategy                      | Phase 3      |

---

## References

- [Product Vision](./reqs/product-vision.md)
- [Architecture](./tech/architecture.md)
- [ASR](./tech/asr.md)
- [Roadmap](./reqs/roadmap.md)

---

_This document should be updated when new significant technical decisions are made. Review quarterly._
