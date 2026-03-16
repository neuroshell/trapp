# Task 002: Workout Logging System

**Priority:** Must Have (MVP) - CRITICAL
**Phase:** Phase 1
**Related User Stories:** US-2.1, US-2.2, US-2.3, US-2.5
**Assigned To:** @expo-react-native-developer

---

## Overview

Implement the core workout logging functionality that enables users to record running and strength workouts quickly and intuitively. **This is the core value proposition of Trapp Tracker: "Log any workout in under 10 seconds."** Performance and usability of this feature directly impact user retention and satisfaction.

The workout logging system must support four workout types (running, squats, pushups, pullups), provide quick-log functionality accessible from the home screen, include full form validation, and integrate seamlessly with the existing storage layer. The implementation must prioritize speed, accessibility, and error prevention.

All logging flows must complete in under 10 seconds from initiation to confirmation. This is a **critical success metric** that must be validated through performance testing.

## Acceptance Criteria

- [ ] Users can log running workouts with distance (km) and duration (minutes)
- [ ] Users can log strength workouts (squats, pushups, pullups) with reps and sets
- [ ] Quick log feature allows logging a workout in under 10 seconds (CRITICAL)
- [ ] Quick action buttons available on HomeScreen for one-tap access
- [ ] Form pre-fills with user's last values or sensible defaults
- [ ] All required fields validated before submission
- [ ] Invalid inputs show inline errors and prevent submission
- [ ] Successful save shows confirmation toast and updates home screen stats
- [ ] Users can delete workout entries with confirmation dialog
- [ ] Delete action includes undo option via toast
- [ ] Negative numbers and unrealistic values are rejected
- [ ] All forms meet WCAG 2.1 AA accessibility standards
- [ ] Touch targets meet 44x44pt minimum
- [ ] Screen reader support with proper labels and hints
- [ ] Performance: workout log completes in < 10 seconds end-to-end

## Technical Implementation

### Components/Screens

- **LogScreen.tsx** - Main workout logging form
  - Workout type selector (dropdown or segmented control)
  - Dynamic form fields based on selected type
  - Date/time picker (defaults to now)
  - Notes field (optional)
  - Save button with loading state
  - Form validation with inline errors

- **LogRunningForm.tsx** - Running-specific form fields
  - Distance input (km, decimal allowed)
  - Duration input (minutes, integer)
  - Pace auto-calculation display (min/km)
  - Validation: distance > 0, max 100km; duration > 0, max 1440min

- **LogStrengthForm.tsx** - Strength exercise form fields
  - Reps input (integer)
  - Sets input (integer)
  - Weight input (optional, kg)
  - Validation: reps > 0, max 1000; sets > 0, max 100; weight >= 0, max 500kg

- **QuickLogButton.tsx** - HomeScreen quick action component
  - Floating action button or prominent card
  - One-tap access to most-used workout type
  - Pre-filled with last values
  - Maximum 3-4 taps to complete log

- **DeleteConfirmationDialog.tsx** - Workout deletion confirmation
  - Warning message about permanent deletion
  - Cancel and Confirm buttons
  - Destructive action styling (red)

### Data Models

```typescript
// From src/models.ts
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

// Extended workout model for storage
interface WorkoutEntry {
  id: string;
  userId: string;
  type: ActivityType;
  timestamp: string; // ISO 8601
  data: {
    distance?: number;      // km, for running
    duration?: number;      // minutes, for running
    reps?: number;          // for strength exercises
    sets?: number;          // for strength exercises
    weight?: number;        // kg, optional for strength
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Quick log preset
interface QuickLogPreset {
  type: ActivityType;
  defaultValues: Partial<WorkoutEntry['data']>;
}
```

### Storage/API Integration

**Save Workout:**
```typescript
// Using existing storage.ts functions
import { saveWorkout, getWorkouts, deleteWorkout } from './storage';
import { nanoid } from 'nanoid';

async function logWorkout(workoutData: Omit<WorkoutEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkoutEntry> {
  const newWorkout: WorkoutEntry = {
    ...workoutData,
    id: nanoid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  await saveWorkout(newWorkout);
  return newWorkout;
}
```

**Load User's Last Values:**
```typescript
async function getLastWorkoutValues(type: ActivityType): Promise<Partial<WorkoutEntry['data']> | null> {
  const workouts = await getWorkouts();
  const userWorkouts = workouts.filter(w => w.type === type);
  
  if (userWorkouts.length === 0) {
    return getDefaultValues(type);
  }
  
  // Return most recent workout's data
  const latest = userWorkouts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];
  
  return latest.data;
}

function getDefaultValues(type: ActivityType): Partial<WorkoutEntry['data']> {
  switch (type) {
    case 'running':
      return { distance: 5.0, duration: 30 };
    case 'squats':
      return { reps: 20, sets: 3 };
    case 'pushups':
      return { reps: 15, sets: 3 };
    case 'pullups':
      return { reps: 10, sets: 3 };
    default:
      return {};
  }
}
```

**Delete Workout:**
```typescript
async function deleteWorkoutEntry(workoutId: string): Promise<void> {
  await deleteWorkout(workoutId);
  // Trigger UI refresh via context or state management
}
```

**Performance Optimization:**
```typescript
// Optimistic UI update for perceived performance
function handleSaveWorkout(workoutData: any) {
  // 1. Update UI immediately
  setWorkouts(prev => [optimisticWorkout, ...prev]);
  setShowSuccessToast(true);
  
  // 2. Save to storage in background
  saveWorkout(workoutData).catch(error => {
    // 3. Rollback on error
    setWorkouts(prev => prev.filter(w => w.id !== optimisticWorkout.id));
    showErrorToast('Failed to save workout');
  });
}
```

## Validation Rules

| Field | Type | Rules | Error Message |
|-------|------|-------|---------------|
| Workout Type | Enum | Required, one of: running, squats, pushups, pullups | "Please select a workout type" |
| Distance | Number | Required for running, > 0, max 100, decimal allowed | "Please enter a valid distance (0-100 km)" |
| Duration | Number | Required for running, > 0, max 1440 (24hrs), integer | "Please enter a valid duration (0-1440 min)" |
| Reps | Integer | Required for strength, > 0, max 1000 | "Please enter valid reps (1-1000)" |
| Sets | Integer | Required for strength, > 0, max 100 | "Please enter valid sets (1-100)" |
| Weight | Number | Optional for strength, >= 0, max 500 | "Please enter a valid weight (0-500 kg)" |
| Timestamp | DateTime | Required, cannot be in future (warn) | "Workout date cannot be in the future" |
| Notes | String | Optional, max 500 characters | "Notes cannot exceed 500 characters" |

**Validation Functions:**
```typescript
function validateRunningForm(data: { distance: string; duration: string }) {
  const errors: Record<string, string> = {};
  const distance = parseFloat(data.distance);
  const duration = parseFloat(data.duration);
  
  if (!data.distance || isNaN(distance) || distance <= 0 || distance > 100) {
    errors.distance = 'Please enter a valid distance (0-100 km)';
  }
  
  if (!data.duration || isNaN(duration) || duration <= 0 || duration > 1440) {
    errors.duration = 'Please enter a valid duration (0-1440 min)';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
}

function validateStrengthForm(data: { reps: string; sets: string; weight?: string }) {
  const errors: Record<string, string> = {};
  const reps = parseInt(data.reps, 10);
  const sets = parseInt(data.sets, 10);
  const weight = data.weight ? parseFloat(data.weight) : 0;
  
  if (!data.reps || isNaN(reps) || reps <= 0 || reps > 1000) {
    errors.reps = 'Please enter valid reps (1-1000)';
  }
  
  if (!data.sets || isNaN(sets) || sets <= 0 || sets > 100) {
    errors.sets = 'Please enter valid sets (1-100)';
  }
  
  if (data.weight && (isNaN(weight) || weight < 0 || weight > 500)) {
    errors.weight = 'Please enter a valid weight (0-500 kg)';
  }
  
  return { valid: Object.keys(errors).length === 0, errors };
}
```

## Error Handling

| Scenario | User Message | Technical Action |
|----------|--------------|------------------|
| Invalid numeric input | Inline error on field | Prevent submission, highlight field |
| Empty required fields | "Please fill in all required fields" | Inline errors on each field |
| Future timestamp | "Workout date cannot be in the future. Continue anyway?" | Warning dialog, allow with confirmation |
| Unrealistic values (e.g., 100km run) | "This value seems unusually high. Continue?" | Warning dialog for outlier detection |
| Storage write failure | "Failed to save workout. Please try again." | Retry mechanism, preserve form data |
| Network failure (offline mode) | "Saved locally. Will sync when online." | Save to local storage, queue for sync |
| Duplicate workout (same time) | Allow (user may have multiple sessions) | No blocking, allow duplicate |
| Delete without confirmation | Prevent via confirmation dialog | Require explicit confirmation |

**Error Boundary for Forms:**
```typescript
<ErrorBoundary fallback={
  <ErrorScreen 
    message="Something went wrong with the workout form"
    onRetry={() => resetForm()}
  />
}>
  <LogScreen />
</ErrorBoundary>
```

## Testing Requirements

### Unit Tests

- [ ] `validateRunningForm()` rejects invalid distances and durations
- [ ] `validateStrengthForm()` rejects invalid reps and sets
- [ ] `getDefaultValues()` returns appropriate defaults per type
- [ ] `getLastWorkoutValues()` retrieves most recent workout data
- [ ] `logWorkout()` creates entry with correct structure
- [ ] `deleteWorkoutEntry()` removes workout from storage
- [ ] Timestamp validation rejects future dates

### Component Tests

- [ ] LogScreen renders with workout type selector
- [ ] LogRunningForm shows distance and duration fields
- [ ] LogStrengthForm shows reps and sets fields
- [ ] Form validation errors display inline
- [ ] Loading state shows during save
- [ ] Success toast appears on save
- [ ] Delete confirmation dialog appears on delete request
- [ ] QuickLogButton navigates to log form with preset type

### Integration Tests

- [ ] Full workout log flow saves to AsyncStorage
- [ ] Quick log completes in under 10 seconds (TIMING TEST - CRITICAL)
- [ ] HomeScreen stats update after workout log
- [ ] Delete workout removes from storage and UI
- [ ] Undo delete restores workout
- [ ] Form pre-fills with last values
- [ ] Offline logging saves locally with sync queue

### Performance Tests (CRITICAL)

- [ ] **Quick log flow: < 10 seconds total** (measure from tap to confirmation)
  - Tap Quick Action: < 0.5s
  - Form appears with defaults: < 0.2s
  - User reviews/adjusts: 3-5s (user-dependent)
  - Tap Save: < 0.5s
  - Save confirmation: < 0.3s
  - **Total target: < 10 seconds**

- [ ] Full log flow: < 30 seconds total
- [ ] Storage write completes in < 500ms
- [ ] UI remains responsive during save (no blocking)

### Accessibility Tests

- [ ] All inputs have associated labels
- [ ] Error messages use `accessibilityRole="alert"`
- [ ] Screen reader can navigate entire log flow
- [ ] Touch targets meet 44x44pt minimum
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 UI)
- [ ] Dynamic content announcements for success/error states

### Timing Validation Test

```typescript
// Performance test for quick log
describe('Quick Log Performance', () => {
  it('completes workout log in under 10 seconds', async () => {
    const startTime = Date.now();
    
    // Navigate to quick log
    fireEvent.press(getByTestId('quick-log-button'));
    await waitFor(() => getByTestId('log-form'));
    
    // Fill form (using defaults)
    fireEvent.press(getByTestId('save-workout-button'));
    
    // Wait for confirmation
    await waitFor(() => getByTestId('success-toast'));
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(10000); // < 10 seconds
  });
});
```

## Definition of Done

- [ ] Code implemented following project conventions
- [ ] All unit tests passing (`npm run test:app`)
- [ ] All integration tests passing
- [ ] **Performance validated: quick log < 10 seconds** (CRITICAL)
- [ ] Accessibility verified (WCAG 2.1 AA) using checklist from `docs/reqs/accessibility-guidelines.md`
- [ ] Touch targets verified at 44x44pt minimum
- [ ] Color contrast validated using WebAIM Contrast Checker
- [ ] Screen reader tested on iOS (VoiceOver) and Android (TalkBack)
- [ ] Error handling covers all documented scenarios
- [ ] TypeScript types defined and no type errors
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] Documentation updated in QWEN.md if data models changed

---

## References

- **Design System:** `docs/reqs/design-system.md` - Input fields, buttons, cards, colors
- **Accessibility Guidelines:** `docs/reqs/accessibility-guidelines.md` - WCAG 2.1 AA requirements
- **User Stories:** `docs/reqs/user-stories.md` - US-2.1, US-2.2, US-2.3, US-2.5
- **User Flows:** `docs/reqs/user-flows.md` - Flow 2: Workout Logging (Critical Path)
- **Product Vision:** `docs/reqs/product-vision.md` - Core value proposition: < 10 second logging
- **Existing Code:** `src/models.ts`, `src/storage.ts`, `src/screens/`, `src/theme.ts`

---

_Document History:_
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-16 | Product Team | Initial task specification |
