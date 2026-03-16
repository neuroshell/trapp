# Task 003: Calendar & History View

**Priority:** Must Have (MVP)
**Phase:** Phase 1
**Related User Stories:** US-3.1, US-3.2
**Assigned To:** @expo-react-native-developer

---

## Overview

Implement a calendar-based workout history view that allows users to visualize their workout patterns and browse their fitness journey chronologically. The calendar view provides at-a-glance insight into workout consistency, while the history list offers detailed access to all logged activities.

This task covers the CalendarScreen implementation with monthly navigation, visual indicators for days with workouts, day detail views, and a chronological workout history list. The implementation must integrate with existing data models and storage, provide empty states for new users, and maintain full accessibility compliance.

The calendar serves as both a visualization tool and a navigation mechanism, allowing users to tap on days to view or add workouts for that specific date.

## Acceptance Criteria

- [ ] Calendar screen displays current month with standard grid layout (Sunday-Saturday)
- [ ] Days with workouts show visual indicators (dots or markers)
- [ ] Indicator intensity reflects workout count (1 workout vs. multiple)
- [ ] Current day is highlighted distinctly
- [ ] Users can navigate between months (previous/next)
- [ ] Quick "jump to today" functionality available
- [ ] Tapping a day with workouts shows day detail view
- [ ] Day detail view lists all workouts for selected date
- [ ] Day detail view includes "add workout" for that day
- [ ] Workout history list shows all workouts sorted by date (newest first)
- [ ] Each history item shows workout type, date, and key metrics
- [ ] Empty states display for months/days with no workouts
- [ ] Empty states include call-to-action to log first workout
- [ ] Calendar integrates with existing ActivityEntry data model
- [ ] All views meet WCAG 2.1 AA accessibility standards
- [ ] Touch targets meet 44x44pt minimum
- [ ] Screen reader support with proper date and workout announcements

## Technical Implementation

### Components/Screens

- **CalendarScreen.tsx** - Main calendar view container
  - Month/year header with navigation arrows
  - Calendar grid (7 columns for days of week)
  - Day cells with workout indicators
  - "Today" button for quick navigation
  - Month swipe gestures for navigation

- **CalendarMonth.tsx** - Month grid component
  - Weekday headers (Sun, Mon, Tue, etc.)
  - Day cells with proper date positioning
  - Workout indicator dots
  - Current day highlight
  - Selected day state

- **CalendarDay.tsx** - Individual day cell
  - Date number display
  - Workout indicator dots (1-3+ workouts)
  - Disabled state for future dates
  - Selected state styling
  - Touch target 44x44pt minimum

- **DayDetailModal.tsx** - Day detail view modal
  - Selected date header
  - List of workouts for the day
  - "Add Workout" button for selected date
  - Empty state if no workouts
  - Close button

- **WorkoutHistoryList.tsx** - Chronological workout list
  - FlatList with all workouts
  - Grouped by date (sectioned list)
  - Workout cards with type, metrics, date
  - Pull-to-refresh functionality
  - Infinite scroll or pagination for large datasets

- **WorkoutHistoryItem.tsx** - Individual workout list item
  - Workout type icon
  - Key metrics (distance/duration or reps/sets)
  - Date and time
  - Swipe actions (edit, delete)

### Data Models

```typescript
// From src/models.ts - existing
type ActivityType = "running" | "squats" | "pushups" | "pullups" | "other";

interface ActivityEntry {
  id: string;
  type: ActivityType;
  date: string; // ISO date string
  quantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Extended for calendar display
interface CalendarDayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  workoutCount: number;
  workouts: ActivityEntry[];
  hasWorkouts: boolean;
}

interface CalendarMonthData {
  year: number;
  month: number; // 0-11
  days: CalendarDayData[];
  totalWorkouts: number;
}

// History list sections
interface HistorySection {
  title: string; // e.g., "March 2026"
  date: string; // ISO date for sorting
  data: ActivityEntry[];
}
```

### Storage/API Integration

**Load Workouts for Month:**
```typescript
// Using existing storage.ts functions
import { getWorkouts, getWorkoutsByDateRange } from './storage';

async function loadCalendarMonth(year: number, month: number): Promise<CalendarMonthData> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month
  
  const workouts = await getWorkoutsByDateRange(
    startDate.toISOString(),
    endDate.toISOString()
  );
  
  const days = generateCalendarDays(year, month, workouts);
  const totalWorkouts = workouts.length;
  
  return { year, month, days, totalWorkouts };
}

function generateCalendarDays(
  year: number, 
  month: number, 
  workouts: ActivityEntry[]
): CalendarDayData[] {
  const days: CalendarDayData[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // First day of month
  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
  
  // Last day of month
  const lastDay = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDay.getDate();
  
  // Previous month days (fill grid)
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i);
    days.push(createDayData(date, false, workouts));
  }
  
  // Current month days
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push(createDayData(date, true, workouts));
  }
  
  // Next month days (fill grid to 35 or 42 cells)
  const remainingCells = 42 - days.length; // 6 rows max
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(year, month + 1, i);
    days.push(createDayData(date, false, workouts));
  }
  
  return days;
}

function createDayData(
  date: Date, 
  isCurrentMonth: boolean, 
  workouts: ActivityEntry[]
): CalendarDayData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dayWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    return (
      workoutDate.getDate() === date.getDate() &&
      workoutDate.getMonth() === date.getMonth() &&
      workoutDate.getFullYear() === date.getFullYear()
    );
  });
  
  return {
    date,
    isCurrentMonth,
    isToday: date.getTime() === today.getTime(),
    isSelected: false,
    workoutCount: dayWorkouts.length,
    workouts: dayWorkouts,
    hasWorkouts: dayWorkouts.length > 0,
  };
}
```

**Load History List:**
```typescript
async function loadWorkoutHistory(): Promise<HistorySection[]> {
  const workouts = await getWorkouts();
  
  // Sort by date descending (newest first)
  workouts.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Group by date
  const sectionsMap = new Map<string, ActivityEntry[]>();
  
  workouts.forEach(workout => {
    const dateKey = workout.date.split('T')[0]; // YYYY-MM-DD
    if (!sectionsMap.has(dateKey)) {
      sectionsMap.set(dateKey, []);
    }
    sectionsMap.get(dateKey)!.push(workout);
  });
  
  // Convert to sections array
  const sections: HistorySection[] = [];
  sectionsMap.forEach((data, date) => {
    sections.push({
      title: formatDateSection(date),
      date,
      data,
    });
  });
  
  return sections;
}

function formatDateSection(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
```

## Validation Rules

| Field | Rules | Error Message |
|-------|-------|---------------|
| Month Navigation | Valid month index (0-11) | N/A (handled internally) |
| Year Navigation | Reasonable year range (2000-2100) | N/A (handled internally) |
| Day Selection | Cannot select future dates for workout add | "Cannot log workouts for future dates" |
| Date Display | Use user's local timezone | N/A (automatic) |

**Date Utility Functions:**
```typescript
function isValidCalendarMonth(year: number, month: number): boolean {
  return (
    Number.isInteger(year) &&
    Number.isInteger(month) &&
    year >= 2000 &&
    year <= 2100 &&
    month >= 0 &&
    month <= 11
  );
}

function isFutureDate(date: Date): boolean {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return date.getTime() > today.getTime();
}
```

## Error Handling

| Scenario | User Message | Technical Action |
|----------|--------------|------------------|
| No workouts in month | "No workouts this month. Start your journey!" | Show empty state with CTA |
| No workouts on selected day | "No workouts logged for this day" | Show empty state in modal |
| Storage read failure | "Unable to load calendar. Please try again." | Show error with retry button |
| Invalid date selection | "Invalid date selected" | Ignore selection, log error |
| Future date selected for workout | "Cannot log workouts for future dates" | Show warning, prevent action |
| Timezone mismatch | Display in user's local timezone | Use device timezone for all dates |
| Large dataset (>1000 workouts) | Enable pagination/infinite scroll | Load in chunks of 50 |

**Empty State Component:**
```typescript
function CalendarEmptyState({ onLogWorkout }: { onLogWorkout: () => void }) {
  return (
    <View style={styles.emptyState} accessibilityRole="summary">
      <MaterialCommunityIcons name="calendar-blank" size={64} color="#F57300" />
      <Text style={styles.emptyTitle}>No workouts yet</Text>
      <Text style={styles.emptySubtitle}>
        Start tracking your fitness journey by logging your first workout.
      </Text>
      <Button 
        title="Log First Workout" 
        onPress={onLogWorkout}
        accessibilityLabel="Log your first workout"
      />
    </View>
  );
}
```

## Testing Requirements

### Unit Tests

- [ ] `generateCalendarDays()` creates correct grid for any month
- [ ] `createDayData()` correctly identifies today, workouts, current month
- [ ] `loadWorkoutHistory()` groups workouts by date correctly
- [ ] `formatDateSection()` returns "Today", "Yesterday", or formatted date
- [ ] `isFutureDate()` correctly identifies future dates
- [ ] Calendar navigation updates month/year correctly
- [ ] Workout count aggregation per day is accurate

### Component Tests

- [ ] CalendarScreen renders month grid correctly
- [ ] CalendarDay shows workout indicators when present
- [ ] Current day is highlighted
- [ ] Month navigation buttons work (prev/next)
- [ ] "Today" button jumps to current month
- [ ] DayDetailModal opens on day tap
- [ ] DayDetailModal shows correct workouts for day
- [ ] WorkoutHistoryList displays workouts newest first
- [ ] Empty states display when no workouts exist
- [ ] Pull-to-refresh triggers data reload

### Integration Tests

- [ ] Calendar loads workouts from AsyncStorage
- [ ] New workout appears on calendar immediately
- [ ] Deleted workout removes from calendar
- [ ] Month navigation loads correct data
- [ ] Day detail shows accurate workout list
- [ ] History list syncs with storage changes
- [ ] Timezone handling displays correct dates

### Accessibility Tests

- [ ] Calendar grid is navigable via screen reader
- [ ] Day cells announce date and workout count
- [ ] Month navigation buttons have descriptive labels
- [ ] Workout history items have complete information
- [ ] Empty states are announced
- [ ] Touch targets meet 44x44pt minimum
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus order is logical

### Performance Tests

- [ ] Calendar renders in < 500ms
- [ ] Month navigation completes in < 200ms
- [ ] History list scrolls smoothly at 60fps
- [ ] Large datasets (1000+ workouts) handled with pagination

## Definition of Done

- [ ] Code implemented following project conventions
- [ ] All unit tests passing (`npm run test:app`)
- [ ] All integration tests passing
- [ ] Accessibility verified (WCAG 2.1 AA) using checklist from `docs/reqs/accessibility-guidelines.md`
- [ ] Touch targets verified at 44x44pt minimum
- [ ] Color contrast validated using WebAIM Contrast Checker
- [ ] Screen reader tested on iOS (VoiceOver) and Android (TalkBack)
- [ ] Empty states implemented for all scenarios
- [ ] Error handling covers all documented scenarios
- [ ] TypeScript types defined and no type errors
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] Documentation updated in QWEN.md if data models changed

---

## References

- **Design System:** `docs/reqs/design-system.md` - Cards, lists, colors, typography
- **Accessibility Guidelines:** `docs/reqs/accessibility-guidelines.md` - WCAG 2.1 AA requirements
- **User Stories:** `docs/reqs/user-stories.md` - US-3.1, US-3.2
- **User Flows:** `docs/reqs/user-flows.md` - Flow 3.2: View Calendar Flow
- **Existing Code:** `src/models.ts`, `src/storage.ts`, `src/screens/`, `src/theme.ts`

---

_Document History:_
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-16 | Product Team | Initial task specification |
