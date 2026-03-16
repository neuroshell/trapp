# Trapp Tracker - Architecture Significant Requirements (ASR)

**Version:** 1.0  
**Last Updated:** 2026-03-15  
**Status:** Approved for MVP Development

---

## 1. Overview

This document identifies the Architecture Significant Requirements (ASRs) that drive key architectural decisions for Trapp Tracker. ASRs are requirements that have a measurable impact on the system's architecture and must be addressed through specific architectural strategies.

### 1.1 Relationship to Product Requirements

| Product Document                      | ASR Coverage                          |
| ------------------------------------- | ------------------------------------- |
| [Product Vision](./product-vision.md) | Success metrics → Performance ASRs    |
| [User Stories](./user-stories.md)     | Acceptance criteria → Functional ASRs |
| [Features.md](./features.md)          | Edge cases → Reliability ASRs         |
| [Roadmap.md](./roadmap.md)            | Phase goals → Evolution ASRs          |

---

## 2. Quality Attribute Scenarios

Quality attribute scenarios follow the format: **Source → Stimulus → Artifact → Environment → Response → Response Measure**

### 2.1 Performance

#### ASR-PERF-01: Fast Workout Logging

| Element              | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| **Source**           | User initiating workout log                                   |
| **Stimulus**         | Tap "Save Workout" button                                     |
| **Artifact**         | Workout logging feature                                       |
| **Environment**      | Normal operation (device has storage space)                   |
| **Response**         | Workout saved and confirmation shown                          |
| **Response Measure** | < 10 seconds (95th percentile), < 3 seconds (50th percentile) |

**Rationale:** Directly supports product goal "Log any workout in under 10 seconds" (Product Vision, Value Proposition).

**Architectural Drivers:**

- Local storage (AsyncStorage) for immediate persistence
- Optimistic UI updates (show success before async completes)
- Minimal validation overhead

**Verification:** Performance testing with 1000+ workout entries in storage.

---

#### ASR-PERF-02: Fast App Launch

| Element              | Description                                        |
| -------------------- | -------------------------------------------------- |
| **Source**           | User launching app                                 |
| **Stimulus**         | Tap app icon                                       |
| **Artifact**         | App startup sequence                               |
| **Environment**      | Cold start (app not in memory)                     |
| **Response**         | Home screen rendered and interactive               |
| **Response Measure** | < 3 seconds on mid-range devices (90th percentile) |

**Rationale:** First impression affects user retention (Product Vision: Day-7 Retention 60%).

**Architectural Drivers:**

- Lazy loading of screens via React Navigation
- Minimal initial data fetch (load only essential state)
- Splash screen during auth state initialization

**Verification:** Measure time-to-interactive on iPhone SE / Android mid-range.

---

#### ASR-PERF-03: Smooth Scroll Performance

| Element              | Description                            |
| -------------------- | -------------------------------------- |
| **Source**           | User scrolling workout history         |
| **Stimulus**         | Swipe gesture on FlatList              |
| **Artifact**         | Workout history list                   |
| **Environment**      | 100+ workout entries loaded            |
| **Response**         | Smooth scroll animation                |
| **Response Measure** | Maintain 60 FPS, no frame drops > 16ms |

**Rationale:** Poor scroll performance degrades user experience (US-3.2).

**Architectural Drivers:**

- FlatList with `windowSize` and `maxToRenderPerBatch`
- Key extraction for list items
- Image lazy loading (if workout photos added Phase 2+)

**Verification:** React Native Performance Monitor, FPS profiling.

---

### 2.2 Security

#### ASR-SEC-01: Password Protection

| Element              | Description                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ |
| **Source**           | User registering or logging in                                                       |
| **Stimulus**         | Submit credentials                                                                   |
| **Artifact**         | Authentication system                                                                |
| **Environment**      | Client-side (MVP), Client+Server (Phase 3)                                           |
| **Response**         | Password hashed before storage                                                       |
| **Response Measure** | Passwords never stored in plaintext; hash algorithm: SHA-256 (MVP), bcrypt (Phase 3) |

**Rationale:** Protects user accounts (US-1.1, US-1.2).

**Architectural Drivers:**

- expo-crypto for SHA-256 hashing (MVP)
- Password hash stored in AsyncStorage
- Phase 3: Move hashing to backend with bcrypt

**Trade-off:** Client-side hashing provides minimal security against device compromise but protects against casual inspection.

**Verification:** Code review, security audit of auth flow.

---

#### ASR-SEC-02: Session Persistence Security

| Element              | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| **Source**           | Authenticated user                                                        |
| **Stimulus**         | App backgrounded/terminated                                               |
| **Artifact**         | Session token storage                                                     |
| **Environment**      | Device with potential physical access by others                           |
| **Response**         | Session credentials protected                                             |
| **Response Measure** | Credentials encrypted at rest; unauthorized access requires device unlock |

**Rationale:** Protects user data on shared/lost devices (US-1.3, US-1.4).

**Architectural Drivers:**

- MVP: AsyncStorage (plaintext, acceptable for demo)
- Phase 2: Migrate to expo-secure-store (encrypted)
- Session timeout after 30 days of inactivity

**Verification:** Inspect stored credentials, verify encryption.

---

#### ASR-SEC-03: Input Validation

| Element              | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| **Source**           | User entering data                                              |
| **Stimulus**         | Submit form with invalid input                                  |
| **Artifact**         | Form validation logic                                           |
| **Environment**      | Any input scenario                                              |
| **Response**         | Invalid input rejected with clear error                         |
| **Response Measure** | 100% of required fields validated; SQL injection/ XSS prevented |

**Rationale:** Data integrity and security (US-2.1, US-2.2, FR-2 validation rules).

**Architectural Drivers:**

- Client-side validation before storage
- Numeric range checks (distance > 0, reps > 0)
- Email format validation (RFC 5322)

**Verification:** Unit tests for all validators, penetration testing.

---

### 2.3 Modifiability

#### ASR-MOD-01: Module Independence

| Element              | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| **Source**           | Developer adding new feature                               |
| **Stimulus**         | Change request for specific feature                        |
| **Artifact**         | Affected module                                            |
| **Environment**      | Development                                                |
| **Response**         | Changes isolated to module boundary                        |
| **Response Measure** | < 3 modules affected per feature; no circular dependencies |

**Rationale:** Supports team velocity and code maintainability (Product Principle: "Simplicity First").

**Architectural Drivers:**

- Clear module boundaries (auth, storage, domain, UI)
- Dependency direction enforced (UI → Domain → Storage)
- Context API for dependency injection

**Verification:** Dependency graph analysis, code review checklist.

---

#### ASR-MOD-02: Storage Abstraction

| Element              | Description                                                                     |
| -------------------- | ------------------------------------------------------------------------------- |
| **Source**           | Developer or technical debt trigger                                             |
| **Stimulus**         | Need to change storage mechanism                                                |
| **Artifact**         | Storage module                                                                  |
| **Environment**      | AsyncStorage limits hit or encryption required                                  |
| **Response**         | Storage implementation changed without UI changes                               |
| **Response Measure** | UI modules require zero changes when swapping AsyncStorage → SQLite/SecureStore |

**Rationale:** Enables Phase 2/3 evolution (Roadmap: Data export, Cloud sync).

**Architectural Drivers:**

- `storage.ts` provides abstraction layer
- Domain models don't import storage directly
- Service layer pattern for future storage types

**Verification:** Mock storage implementation test swap.

---

#### ASR-MOD-03: Backend Integration Readiness

| Element              | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| **Source**           | Phase 3 development                                        |
| **Stimulus**         | Enable cloud sync feature                                  |
| **Artifact**         | Sync service                                               |
| **Environment**      | Backend API available                                      |
| **Response**         | Sync integrated without rewriting core logic               |
| **Response Measure** | < 5 files modified to enable sync; domain models unchanged |

**Rationale:** Supports Roadmap Phase 3 (Cloud Sync, US-6.2).

**Architectural Drivers:**

- `ActivityEntry` includes `createdAt`/`updatedAt` for sync
- Sync service abstraction (not yet implemented)
- Backend API designed to match frontend data model

**Verification:** Integration test with backend stub.

---

### 2.4 Availability

#### ASR-AVA-01: Offline Operation

| Element              | Description                              |
| -------------------- | ---------------------------------------- |
| **Source**           | User without network connectivity        |
| **Stimulus**         | Attempt to log workout                   |
| **Artifact**         | Workout logging feature                  |
| **Environment**      | No network connection                    |
| **Response**         | Workout saved locally, sync queued       |
| **Response Measure** | 100% of core features functional offline |

**Rationale:** Core product requirement (US-6.1: "App must work offline").

**Architectural Drivers:**

- AsyncStorage for local persistence
- No network calls in critical path
- Sync queue for background synchronization (Phase 3)

**Verification:** Airplane mode testing, network throttling tests.

---

#### ASR-AVA-02: Graceful Error Handling

| Element              | Description                                    |
| -------------------- | ---------------------------------------------- |
| **Source**           | System encountering error                      |
| **Stimulus**         | Exception during operation                     |
| **Artifact**         | Error handling system                          |
| **Environment**      | Any error scenario                             |
| **Response**         | User informed, app remains functional          |
| **Response Measure** | No full app crashes; error recovery rate > 90% |

**Rationale:** User experience requirement (US-7.3: "Clear error messages").

**Architectural Drivers:**

- React Error Boundaries for UI errors
- Try-catch around all async operations
- User-friendly error messages (not stack traces)

**Verification:** Chaos testing, forced error injection.

---

#### ASR-AVA-03: Data Recovery

| Element              | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| **Source**           | User with corrupted/lost data                                   |
| **Stimulus**         | App detects data corruption or user requests reset              |
| **Artifact**         | Data recovery system                                            |
| **Environment**      | Corrupted storage or factory reset                              |
| **Response**         | Data recovered or user can start fresh                          |
| **Response Measure** | Corruption detected and handled; reset completes in < 5 seconds |

**Rationale:** Data integrity (FR-6 edge cases: "Corrupted data").

**Architectural Drivers:**

- JSON.parse with try-catch
- Schema versioning for migrations
- Clear state option in Settings

**Verification:** Corrupt storage file test, migration tests.

---

### 2.5 Usability

#### ASR-USA-01: Intuitive Navigation

| Element              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| **Source**           | User navigating app                                  |
| **Stimulus**         | Tap navigation element                               |
| **Artifact**         | Bottom tab navigator                                 |
| **Environment**      | Any screen                                           |
| **Response**         | Navigate to target screen                            |
| **Response Measure** | < 3 taps to reach any screen from any starting point |

**Rationale:** Simplicity principle (Product Principle: "Respect Time").

**Architectural Drivers:**

- Bottom tab navigation (5 tabs max)
- Consistent iconography (Material Community Icons)
- No nested navigation deeper than 2 levels

**Verification:** Usability testing, tap count analysis.

---

#### ASR-USA-02: Empty State Guidance

| Element              | Description                                      |
| -------------------- | ------------------------------------------------ |
| **Source**           | New user with no data                            |
| **Stimulus**         | View screen requiring data                       |
| **Artifact**         | Empty state component                            |
| **Environment**      | First-time user scenario                         |
| **Response**         | Helpful message with call-to-action              |
| **Response Measure** | 100% of data-dependent screens have empty states |

**Rationale:** Onboarding experience (US-7.2: "Helpful empty states").

**Architectural Drivers:**

- Reusable EmptyState component
- Conditional rendering based on data presence
- Clear CTA buttons

**Verification:** UI test coverage for empty states.

---

## 3. Architectural Drivers

### 3.1 Primary Drivers

These requirements have the strongest influence on architectural decisions:

| Driver             | Description                                | Influences                             |
| ------------------ | ------------------------------------------ | -------------------------------------- |
| **Offline-First**  | App must work fully offline (US-6.1)       | AsyncStorage, local-first data model   |
| **Fast Logging**   | < 10 second workout entry (Product Vision) | Optimistic UI, minimal validation      |
| **Cross-Platform** | iOS + Android from single codebase         | React Native + Expo                    |
| **Small Team**     | 1-3 developers initially                   | Modular monolith, not microservices    |
| **Phased Rollout** | MVP → Enhancement → Sync (Roadmap)         | Abstraction layers, evolution strategy |

### 3.2 Secondary Drivers

| Driver               | Description                                           | Influences                      |
| -------------------- | ----------------------------------------------------- | ------------------------------- |
| **Data Ownership**   | Users control their data (Product Principles)         | Export feature, local storage   |
| **Celebration**      | Make achievements meaningful (Product Vision)         | Achievement system architecture |
| **Inclusive Design** | Accessible to all fitness levels (Product Principles) | Simple UI, clear error messages |

---

## 4. Constraints

### 4.1 Technical Constraints

| Constraint                   | Description                         | Impact                                                              |
| ---------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| **Expo Managed Workflow**    | Cannot use arbitrary native modules | Limited to Expo SDK modules; custom native modules require ejecting |
| **AsyncStorage Limits**      | ~6MB on some Android devices        | Must monitor data size; plan SQLite migration if exceeded           |
| **React Native Performance** | JavaScript thread bottleneck        | Avoid heavy computation on JS thread; use native modules for charts |
| **Client-Side Hashing**      | SHA-256 in expo-crypto (MVP)        | Less secure than server-side bcrypt; acceptable for demo            |

### 4.2 Business Constraints

| Constraint       | Description                   | Impact                                                  |
| ---------------- | ----------------------------- | ------------------------------------------------------- |
| **Timeline**     | MVP within 8-12 weeks         | Prioritize simplicity over optimality                   |
| **Team Size**    | 1-3 developers                | Avoid over-engineering; maintainable code > clever code |
| **Budget**       | Limited infrastructure budget | Use lowdb (file-based) before PostgreSQL                |
| **Target Users** | 10,000 users by Phase 4       | Architecture must scale but not prematurely             |

### 4.3 Regulatory Constraints

| Constraint               | Description                     | Impact                                             |
| ------------------------ | ------------------------------- | -------------------------------------------------- |
| **Data Privacy**         | User fitness data is sensitive  | Encrypt at rest (Phase 2), clear data deletion     |
| **App Store Guidelines** | iOS/Android review requirements | Follow platform-specific guidelines for auth, data |

---

## 5. Risk Assessment

### 5.1 High-Priority Risks

| Risk ID      | Risk                                                     | Probability | Impact | Mitigation                                                                     | Owner        |
| ------------ | -------------------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------------ | ------------ |
| **RISK-001** | AsyncStorage limits exceeded on Android                  | Medium      | High   | Monitor storage size; plan SQLite migration for Phase 3                        | Tech Lead    |
| **RISK-002** | Client-side password hashing insufficient for production | High        | High   | Move to backend bcrypt in Phase 3; add expo-secure-store Phase 2               | Tech Lead    |
| **RISK-003** | Sync conflicts between devices cause data loss           | Medium      | High   | Implement last-write-wins with merge strategy; user confirmation for conflicts | Backend Dev  |
| **RISK-004** | Context API causes performance issues at scale           | Low         | Medium | Profile re-renders; migrate to Zustand if needed                               | Frontend Dev |

### 5.2 Medium-Priority Risks

| Risk ID      | Risk                                           | Probability | Impact | Mitigation                                                    | Owner        |
| ------------ | ---------------------------------------------- | ----------- | ------ | ------------------------------------------------------------- | ------------ |
| **RISK-005** | lowdb cannot handle concurrent writes          | Medium      | Medium | Single-writer design; migrate to PostgreSQL at 1000+ users    | Backend Dev  |
| **RISK-006** | Expo limitations block required feature        | Low         | Medium | Evaluate bare workflow; maintain escape hatch                 | Tech Lead    |
| **RISK-007** | Achievement system becomes complex to maintain | Medium      | Low    | Configuration-driven achievements; clear criteria definitions | Frontend Dev |

### 5.3 Risk Matrix

```
Impact
  High │  RISK-001    RISK-002    RISK-003
       │
Medium │              RISK-005    RISK-004    RISK-006
       │
  Low  │                          RISK-007
       │
       └─────────────────────────────────────────
          Low       Medium       High
                  Probability
```

---

## 6. Quality Attribute Utility Trees

### 6.1 Performance Utility Tree

```
Performance
├── Workout Logging Latency
│   ├── < 3 seconds (50th percentile) ✓ Target
│   ├── < 10 seconds (95th percentile) ✓ Target
│   └── > 10 seconds ✗ Unacceptable
│
├── App Launch Time
│   ├── < 2 seconds (cold start, high-end device) ✓ Target
│   ├── < 3 seconds (cold start, mid-range device) ✓ Target
│   └── > 5 seconds ✗ Unacceptable
│
└── Scroll Performance
    ├── 60 FPS sustained ✓ Target
    ├── 30-60 FPS occasional drops ○ Acceptable
    └── < 30 FPS ✗ Unacceptable
```

### 6.2 Security Utility Tree

```
Security
├── Password Storage
│   ├── Hashed with bcrypt (Phase 3) ✓ Target
│   ├── Hashed with SHA-256 (MVP) ○ Acceptable
│   └── Plaintext ✗ Unacceptable
│
├── Session Management
│   ├── Encrypted storage (Phase 2+) ✓ Target
│   ├── AsyncStorage (MVP) ○ Acceptable
│   └── No session timeout ✗ Unacceptable
│
└── Input Validation
    ├── 100% of inputs validated ✓ Target
    ├── > 90% of inputs validated ○ Acceptable
    └── < 90% ✗ Unacceptable
```

### 6.3 Modifiability Utility Tree

```
Modifiability
├── Feature Addition
│   ├── < 3 modules affected ✓ Target
│   ├── 3-5 modules affected ○ Acceptable
│   └── > 5 modules affected ✗ Unacceptable
│
├── Storage Swap
│   ├── Zero UI changes required ✓ Target
│   ├── Minor UI tweaks required ○ Acceptable
│   └── Major rewrite needed ✗ Unacceptable
│
└── Backend Integration
    ├── < 5 files modified ✓ Target
    ├── 5-10 files modified ○ Acceptable
    └── > 10 files modified ✗ Unacceptable
```

### 6.4 Availability Utility Tree

```
Availability
├── Offline Operation
│   ├── 100% core features work ✓ Target
│   ├── > 90% core features work ○ Acceptable
│   └── < 90% ✗ Unacceptable
│
├── Error Recovery
│   ├── > 90% errors recoverable ✓ Target
│   ├── 75-90% errors recoverable ○ Acceptable
│   └── < 75% ✗ Unacceptable
│
└── Data Integrity
    ├── Zero data loss on corruption ✓ Target
    ├── < 1% data loss ○ Acceptable
    └── > 1% ✗ Unacceptable
```

---

## 7. Non-Functional Requirements Summary

### 7.1 Measurable NFRs

| NFR ID  | Category      | Requirement           | Measure                           | Target                          |
| ------- | ------------- | --------------------- | --------------------------------- | ------------------------------- |
| NFR-001 | Performance   | Workout logging speed | Time from tap to confirmation     | < 10 seconds (95th %ile)        |
| NFR-002 | Performance   | App launch time       | Time from icon tap to interactive | < 3 seconds                     |
| NFR-003 | Performance   | Scroll FPS            | Frames per second during scroll   | 60 FPS                          |
| NFR-004 | Security      | Password storage      | Hash algorithm                    | SHA-256 (MVP), bcrypt (Phase 3) |
| NFR-005 | Security      | Session encryption    | Storage mechanism                 | SecureStore (Phase 2)           |
| NFR-006 | Availability  | Offline functionality | % features working offline        | 100%                            |
| NFR-007 | Availability  | Error recovery        | % errors with graceful handling   | > 90%                           |
| NFR-008 | Modifiability | Module coupling       | Modules changed per feature       | < 3                             |
| NFR-009 | Modifiability | Storage abstraction   | UI changes on storage swap        | 0                               |
| NFR-010 | Usability     | Navigation depth      | Max taps to any screen            | < 3                             |

### 7.2 NFR Prioritization

| Priority             | NFR IDs                            | Rationale                    |
| -------------------- | ---------------------------------- | ---------------------------- |
| **P0 (Must Have)**   | NFR-001, NFR-004, NFR-006          | Core product differentiators |
| **P1 (Should Have)** | NFR-002, NFR-005, NFR-007          | Important for user retention |
| **P2 (Could Have)**  | NFR-003, NFR-008, NFR-009, NFR-010 | Nice to have, can iterate    |

---

## 8. Verification Strategy

### 8.1 Performance Testing

| Test                      | Tool                             | Frequency   | Owner        |
| ------------------------- | -------------------------------- | ----------- | ------------ |
| Workout logging benchmark | Custom timing harness            | Per sprint  | Dev Team     |
| App launch profiling      | React Native Performance Monitor | Per release | Tech Lead    |
| Scroll FPS analysis       | Flipper, React DevTools          | Per release | Frontend Dev |

### 8.2 Security Testing

| Test                          | Tool                 | Frequency   | Owner     |
| ----------------------------- | -------------------- | ----------- | --------- |
| Password hashing verification | Code review          | Per change  | Tech Lead |
| Storage inspection            | Device file explorer | Per release | QA        |
| Input validation testing      | Unit tests, fuzzing  | Per sprint  | Dev Team  |

### 8.3 Availability Testing

| Test                     | Tool                   | Frequency   | Owner     |
| ------------------------ | ---------------------- | ----------- | --------- |
| Offline mode testing     | Airplane mode          | Per sprint  | QA        |
| Error injection testing  | Custom error handlers  | Per release | Dev Team  |
| Data corruption recovery | Manual corruption test | Per release | Tech Lead |

### 8.4 Modifiability Testing

| Test                      | Tool                      | Frequency  | Owner     |
| ------------------------- | ------------------------- | ---------- | --------- |
| Dependency graph analysis | madge, dependency-cruiser | Per PR     | Tech Lead |
| Module boundary audit     | Code review               | Per sprint | Dev Team  |
| Storage swap test         | Mock implementation       | Phase 2    | Tech Lead |

---

## 9. References

- [Product Vision](./product-vision.md) - Success metrics and goals
- [User Stories](./user-stories.md) - Acceptance criteria
- [Feature Specifications](./features.md) - Edge cases and validation
- [Architecture](./architecture.md) - System design
- [Technical Decisions](./technical-decisions.md) - ADRs

---

_This document should be reviewed when quality attribute requirements change or new risks are identified._
