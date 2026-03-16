# Task 004: Statistics & Achievements

**Priority:** Must Have (MVP)
**Phase:** Phase 1
**Related User Stories:** US-4.1, US-4.2, US-4.4, US-5.1
**Assigned To:** @expo-react-native-developer

---

## Overview

Implement the statistics dashboard and achievement system that provides users with meaningful insights into their fitness progress and celebrates their milestones. This feature transforms raw workout data into actionable insights and motivational achievements that drive user retention and engagement.

The statistics system calculates weekly summaries, personal records, and streak tracking. The achievement system detects milestone completions automatically and displays celebration notifications. Together, these features provide the positive reinforcement that helps users build consistent fitness habits.

All calculations must be performant, accurate, and update in real-time as users log new workouts. Achievement detection must run automatically after each workout save.

## Acceptance Criteria

- [ ] Weekly summary shows total workouts for current week
- [ ] Weekly summary shows total duration/distance
- [ ] Weekly summary shows workouts breakdown by type
- [ ] Personal records display best performance for each exercise type
- [ ] Personal records show date achieved
- [ ] New PRs are flagged with celebration indicator
- [ ] Current workout streak displays consecutive day count
- [ ] Streak resets correctly when day is missed
- [ ] Longest streak ever is tracked and displayed
- [ ] Achievements unlock automatically when criteria met
- [ ] Achievement unlock shows celebration notification
- [ ] Achievement list shows unlocked achievements with dates
- [ ] Locked achievements show progress toward unlock
- [ ] HomeScreen displays key stats (streak, weekly summary)
- [ ] Achievement detection runs after every workout save
- [ ] All views meet WCAG 2.1 AA accessibility standards
- [ ] Touch targets meet 44x44pt minimum
- [ ] Screen reader support with proper stat announcements

## Technical Implementation

### Components/Screens

- **StatsScreen.tsx** - Main statistics dashboard
  - Weekly summary cards
  - Personal records section
  - Streak tracking display
  - Navigation to detailed stats

- **WeeklySummaryCard.tsx** - Week stats display
  - Total workouts count
  - Total duration (minutes)
  - Total distance (km, for running)
  - Workouts by type breakdown
  - Comparison to previous week (optional)

- **PersonalRecordsList.tsx** - PR display component
  - List of PRs by exercise type
  - PR value and date achieved
  - New PR badge for recently unlocked
  - Empty state if no PRs yet

- **StreakTracker.tsx** - Streak display component
  - Current streak (days)
  - Fire icon for visual emphasis
  - Longest streak ever
  - Streak history sparkline (optional)

- **AchievementsScreen.tsx** - Achievement gallery
  - Filtered list (all, unlocked, locked)
  - Category filters (consistency, streak, exercise)
  - Achievement cards with progress
  - Achievement detail modal

- **AchievementCard.tsx** - Individual achievement display
  - Icon and tier indicator (bronze, silver, gold, etc.)
  - Title and description
  - Progress bar for locked achievements
  - Unlock date for unlocked achievements
  - Locked state styling (grayscale, opacity)

- **AchievementCelebrationModal.tsx** - Unlock celebration
  - Full-screen modal with animation
  - Achievement details
  - Confetti effect (respect reduced motion)
  - Share button (optional)
  - Dismiss button

- **AchievementToast.tsx** - Quick unlock notification
  - Small toast for minor achievements
  - Auto-dismiss after 3 seconds
  - Queue multiple unlocks

### Data Models

```typescript
// From src/models.ts - existing
type ActivityType = "running" | "squats" | "pushups" | "pullups" | "other";

interface ActivityEntry {
  id: string;
  type: ActivityType;
  date: string;
  quantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Statistics models
interface WeeklyStats {
  totalWorkouts: number;
  totalDuration: number; // minutes
  totalDistance: number; // km
  byType: Record<ActivityType, number>;
  weekStart: Date;
  weekEnd: Date;
}

interface PersonalRecord {
  type: ActivityType;
  value: number;
  unit: string;
  date: string;
  workoutId: string;
  isNew?: boolean; // Flag for new PRs
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  streakDates: string[]; // Array of dates in current streak
}

// Achievement models
interface Achievement {
  id: string;
  type: AchievementType;
  category: 'consistency' | 'streak' | 'exercise';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  title: string;
  description: string;
  requirement: number;
  icon: string; // Material Community Icons name
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

type AchievementType = 
  | 'first_workout'
  | 'workouts_5'
  | 'workouts_10'
  | 'workouts_25'
  | 'workouts_50'
  | 'workouts_100'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'streak_30'
  | 'streak_100'
  | 'runs_10'
  | 'squats_1000'
  | 'pushups_500'
  | 'pullups_200';

// Achievement definitions (from features.md)
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'progress' | 'unlockedAt'>[] = [
  // Consistency Achievements
  {
    id: 'first_step',
    type: 'first_workout',
    category: 'consistency',
    tier: 'bronze',
    title: 'First Step',
    description: 'Log your first workout',
    requirement: 1,
    icon: 'foot-print',
  },
  {
    id: 'getting_started',
    type: 'workouts_5',
    category: 'consistency',
    tier: 'bronze',
    title: 'Getting Started',
    description: 'Log 5 workouts',
    requirement: 5,
    icon: 'seedling',
  },
  {
    id: 'committed',
    type: 'workouts_10',
    category: 'consistency',
    tier: 'silver',
    title: 'Committed',
    description: 'Log 10 workouts',
    requirement: 10,
    icon: 'medal',
  },
  {
    id: 'dedicated',
    type: 'workouts_25',
    category: 'consistency',
    tier: 'silver',
    title: 'Dedicated',
    description: 'Log 25 workouts',
    requirement: 25,
    icon: 'trophy-outline',
  },
  {
    id: 'devoted',
    type: 'workouts_50',
    category: 'consistency',
    tier: 'gold',
    title: 'Devoted',
    description: 'Log 50 workouts',
    requirement: 50,
    icon: 'trophy',
  },
  {
    id: 'obsessed',
    type: 'workouts_100',
    category: 'consistency',
    tier: 'platinum',
    title: 'Obsessed',
    description: 'Log 100 workouts',
    requirement: 100,
    icon: 'crown',
  },
  // Streak Achievements
  {
    id: 'on_fire',
    type: 'streak_3',
    category: 'streak',
    tier: 'bronze',
    title: 'On Fire',
    description: '3-day workout streak',
    requirement: 3,
    icon: 'fire',
  },
  {
    id: 'hot_streak',
    type: 'streak_7',
    category: 'streak',
    tier: 'silver',
    title: 'Hot Streak',
    description: '7-day workout streak',
    requirement: 7,
    icon: 'flame',
  },
  {
    id: 'unstoppable',
    type: 'streak_14',
    category: 'streak',
    tier: 'gold',
    title: 'Unstoppable',
    description: '14-day workout streak',
    requirement: 14,
    icon: 'local-fire-department',
  },
  {
    id: 'legendary',
    type: 'streak_30',
    category: 'streak',
    tier: 'platinum',
    title: 'Legendary',
    description: '30-day workout streak',
    requirement: 30,
    icon: 'star-circle',
  },
  {
    id: 'immortal',
    type: 'streak_100',
    category: 'streak',
    tier: 'diamond',
    title: 'Immortal',
    description: '100-day workout streak',
    requirement: 100,
    icon: 'infinity',
  },
  // Exercise-Specific Achievements
  {
    id: 'runner',
    type: 'runs_10',
    category: 'exercise',
    tier: 'bronze',
    title: 'Runner',
    description: 'Complete 10 runs',
    requirement: 10,
    icon: 'run',
  },
  {
    id: 'squat_master',
    type: 'squats_1000',
    category: 'exercise',
    tier: 'silver',
    title: 'Squat Master',
    description: 'Complete 1000 squats total',
    requirement: 1000,
    icon: 'dumbbell',
  },
  {
    id: 'pushup_king',
    type: 'pushups_500',
    category: 'exercise',
    tier: 'gold',
    title: 'Pushup King',
    description: 'Complete 500 pushups total',
    requirement: 500,
    icon: 'arm-flex',
  },
  {
    id: 'pullup_champion',
    type: 'pullups_200',
    category: 'exercise',
    tier: 'platinum',
    title: 'Pullup Champion',
    description: 'Complete 200 pullups total',
    requirement: 200,
    icon: 'weight-lifter',
  },
];
```

### Statistics Calculations

**Weekly Summary:**
```typescript
function calculateWeeklyStats(workouts: ActivityEntry[]): WeeklyStats {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - dayOfWeek; // Sunday of this week
  
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  const weekWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    return workoutDate >= weekStart && workoutDate <= weekEnd;
  });
  
  const stats: WeeklyStats = {
    totalWorkouts: weekWorkouts.length,
    totalDuration: 0,
    totalDistance: 0,
    byType: { running: 0, squats: 0, pushups: 0, pullups: 0, other: 0 },
    weekStart,
    weekEnd,
  };
  
  weekWorkouts.forEach(workout => {
    stats.byType[workout.type]++;
    
    // Assuming quantity represents duration for running, reps for strength
    if (workout.type === 'running') {
      stats.totalDuration += workout.quantity;
      // If you store distance separately, add it here
    }
  });
  
  return stats;
}
```

**Personal Records:**
```typescript
function calculatePersonalRecords(workouts: ActivityEntry[]): PersonalRecord[] {
  const records: Record<ActivityType, PersonalRecord | null> = {
    running: null,
    squats: null,
    pushups: null,
    pullups: null,
    other: null,
  };
  
  workouts.forEach(workout => {
    const currentPR = records[workout.type];
    
    if (!currentPR || workout.quantity > currentPR.value) {
      records[workout.type] = {
        type: workout.type,
        value: workout.quantity,
        unit: getUnitForType(workout.type),
        date: workout.date,
        workoutId: workout.id,
        isNew: false,
      };
    }
  });
  
  return Object.values(records).filter((pr): pr is PersonalRecord => pr !== null);
}

function getUnitForType(type: ActivityType): string {
  switch (type) {
    case 'running': return 'minutes';
    case 'squats': return 'reps';
    case 'pushups': return 'reps';
    case 'pullups': return 'reps';
    default: return 'units';
  }
}
```

**Streak Calculation:**
```typescript
function calculateStreak(workouts: ActivityEntry[]): StreakData {
  if (workouts.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null,
      streakDates: [],
    };
  }
  
  // Get unique workout dates
  const uniqueDates = Array.from(
    new Set(workouts.map(w => w.date.split('T')[0]))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWorkoutDate = uniqueDates[0];
  const lastWorkout = new Date(lastWorkoutDate);
  lastWorkout.setHours(0, 0, 0, 0);
  
  // Check if streak is active (worked out today or yesterday)
  const isActiveStreak = 
    lastWorkout.getTime() === today.getTime() ||
    lastWorkout.getTime() === yesterday.getTime();
  
  if (!isActiveStreak) {
    return {
      currentStreak: 0,
      longestStreak: calculateLongestStreak(uniqueDates),
      lastWorkoutDate,
      streakDates: [],
    };
  }
  
  // Calculate current streak
  let currentStreak = 1;
  const streakDates: string[] = [lastWorkoutDate];
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    
    const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      currentStreak++;
      streakDates.push(uniqueDates[i]);
    } else {
      break;
    }
  }
  
  const longestStreak = calculateLongestStreak(uniqueDates);
  
  return {
    currentStreak,
    longestStreak,
    lastWorkoutDate,
    streakDates,
  };
}

function calculateLongestStreak(uniqueDates: string[]): number {
  if (uniqueDates.length === 0) return 0;
  
  let longest = 1;
  let current = 1;
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);
    
    const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  
  return longest;
}
```

### Achievement Detection

```typescript
// Achievement detection engine
async function checkAchievements(
  userId: string,
  workouts: ActivityEntry[],
  streak: StreakData
): Promise<Achievement[]> {
  const unlockedAchievements: Achievement[] = [];
  const userAchievements = await getUserAchievements(userId);
  
  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    // Skip if already unlocked
    if (userAchievements.find(a => a.id === definition.id)) {
      continue;
    }
    
    const progress = calculateAchievementProgress(definition, workouts, streak);
    const isUnlocked = progress >= definition.requirement;
    
    if (isUnlocked) {
      const newAchievement: Achievement = {
        ...definition,
        unlocked: true,
        unlockedAt: new Date().toISOString(),
        progress,
      };
      
      unlockedAchievements.push(newAchievement);
      await saveAchievement(userId, newAchievement);
    }
  }
  
  return unlockedAchievements;
}

function calculateAchievementProgress(
  achievement: typeof ACHIEVEMENT_DEFINITIONS[0],
  workouts: ActivityEntry[],
  streak: StreakData
): number {
  switch (achievement.category) {
    case 'consistency':
      return workouts.length;
    
    case 'streak':
      return streak.currentStreak;
    
    case 'exercise':
      const type = getExerciseTypeForAchievement(achievement.type);
      const relevantWorkouts = workouts.filter(w => w.type === type);
      
      if (achievement.type === 'squats_1000' || 
          achievement.type === 'pushups_500' || 
          achievement.type === 'pullups_200') {
        // Sum total reps
        return relevantWorkouts.reduce((sum, w) => sum + w.quantity, 0);
      } else {
        // Count workouts
        return relevantWorkouts.length;
      }
    
    default:
      return 0;
  }
}

function getExerciseTypeForAchievement(type: AchievementType): ActivityType {
  if (type === 'runs_10') return 'running';
  if (type === 'squats_1000') return 'squats';
  if (type === 'pushups_500') return 'pushups';
  if (type === 'pullups_200') return 'pullups';
  return 'other';
}
```

## Validation Rules

| Field | Rules | Error Message |
|-------|-------|---------------|
| Weekly Stats | Current week only (Monday-Sunday or Sunday-Saturday) | N/A |
| Personal Records | Must have at least one workout of type | N/A |
| Streak | Consecutive days only, resets after missed day | N/A |
| Achievement Progress | Must meet or exceed requirement | N/A |
| Celebration Display | Respect reduced motion preferences | N/A |

## Error Handling

| Scenario | User Message | Technical Action |
|----------|--------------|------------------|
| No workouts yet | "Keep logging to see your stats!" | Show empty state with encouragement |
| No personal records | "Log workouts to set personal records" | Show placeholder with CTA |
| Streak broken | Show previous streak, encourage rebuilding | Display "Previous streak: X days" |
| Achievement detection fails | Log error, retry on next workout | Queue for re-check |
| Multiple achievements unlocked | Queue notifications, show summary | Display all in celebration modal |
| Stats calculation slow | Show loading skeleton | Use optimistic cached values |
| Storage read failure | "Unable to load stats. Please try again." | Show error with retry |

## Testing Requirements

### Unit Tests

- [ ] `calculateWeeklyStats()` returns correct totals for current week
- [ ] `calculatePersonalRecords()` finds highest value per type
- [ ] `calculateStreak()` counts consecutive days correctly
- [ ] `calculateStreak()` resets to 0 when day is missed
- [ ] `calculateLongestStreak()` finds longest historical streak
- [ ] `checkAchievements()` detects all unlockable achievements
- [ ] `calculateAchievementProgress()` returns correct progress per type
- [ ] Achievement definitions match features.md specifications

### Component Tests

- [ ] WeeklySummaryCard displays correct totals
- [ ] PersonalRecordsList shows PRs with dates
- [ ] StreakTracker displays current and longest streak
- [ ] AchievementsScreen filters by unlocked/locked
- [ ] AchievementCard shows progress for locked achievements
- [ ] AchievementCelebrationModal displays on unlock
- [ ] AchievementToast auto-dismisses after 3 seconds
- [ ] Empty states display when no data available

### Integration Tests

- [ ] Stats update immediately after workout log
- [ ] New PR is flagged and celebrated
- [ ] Streak increments on consecutive day workout
- [ ] Streak resets after missed day
- [ ] Achievements unlock automatically
- [ ] Multiple achievements queue correctly
- [ ] Celebration respects reduced motion setting
- [ ] HomeScreen stats reflect latest data

### Accessibility Tests

- [ ] Stats are announced to screen readers
- [ ] Achievement cards have descriptive labels
- [ ] Progress bars have value announcements
- [ ] Celebration modal is accessible
- [ ] Touch targets meet 44x44pt minimum
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Screen reader can navigate entire stats flow

### Performance Tests

- [ ] Stats calculation completes in < 100ms
- [ ] Achievement detection completes in < 200ms
- [ ] UI remains responsive during calculations
- [ ] Large datasets (1000+ workouts) handled efficiently

## Definition of Done

- [ ] Code implemented following project conventions
- [ ] All unit tests passing (`npm run test:app`)
- [ ] All integration tests passing
- [ ] Accessibility verified (WCAG 2.1 AA) using checklist from `docs/reqs/accessibility-guidelines.md`
- [ ] Touch targets verified at 44x44pt minimum
- [ ] Color contrast validated using WebAIM Contrast Checker
- [ ] Screen reader tested on iOS (VoiceOver) and Android (TalkBack)
- [ ] Achievement detection validated against features.md criteria
- [ ] Error handling covers all documented scenarios
- [ ] TypeScript types defined and no type errors
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] Documentation updated in QWEN.md if data models changed

---

## References

- **Design System:** `docs/reqs/design-system.md` - Cards, colors, typography, achievement cards
- **Accessibility Guidelines:** `docs/reqs/accessibility-guidelines.md` - WCAG 2.1 AA requirements
- **User Stories:** `docs/reqs/user-stories.md` - US-4.1, US-4.2, US-4.4, US-5.1
- **Features:** `docs/reqs/features.md` - Feature 4: Statistics Dashboard, Feature 5: Achievement System
- **User Flows:** `docs/reqs/user-flows.md` - Flow 3.1, 3.3, Flow 5: Achievement System
- **Existing Code:** `src/models.ts`, `src/storage.ts`, `src/screens/`, `src/theme.ts`

---

_Document History:_
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-16 | Product Team | Initial task specification |
