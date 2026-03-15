# Trapp Tracker - Wireframes

**Version:** 1.0  
**Last Updated:** March 15, 2026  
**Platform:** React Native + Expo (iOS, Android, Web)

---

## Document Overview

This document contains wireframes for all 20 MVP screens of Trapp Tracker. Each screen includes:
- **Default State:** Primary layout and content
- **Loading State:** Skeleton/placeholder representation
- **Error State:** Error message and recovery options
- **Empty State:** First-time user guidance
- **Success State:** Confirmation feedback

### Legend

```
┌─────────────────┐  Container/Card
│   Text Content  │  Text element
│  [Button Label] │  Button (tappable)
│  ┌───────────┐  │  Input field
│  │           │  │
│  └───────────┘  │
│  ○  Radio       │  Radio button
│  ☐  Checkbox    │  Checkbox
│  ▼  Dropdown    │  Dropdown selector
│  ●  Selected    │  Selected state
│  ○  Unselected  │  Unselected state
│  ━━━━  Progress │  Progress bar
│  ░░░░  Disabled │  Disabled/greyed out
│  [←] [→]        │  Navigation arrows
│  ⋮  More        │  More options menu
│  ✕  Close       │  Close/Dismiss
│  ✓  Check       │  Success/Complete
│  !  Alert       │  Warning/Error
│  🔥  Streak     │  Streak indicator
│  🏆  Trophy     │  Achievement
│  📅  Calendar   │  Calendar icon
│  📊  Chart      │  Statistics icon
│  🏃  Running    │  Running workout
│  🏋️  Squats     │  Strength workout
│  💪  Pushups    │  Pushup workout
│  🎯  Pullups    │  Pullup workout
```

---

## P0 Screens (Critical Path)

### SCR-02: Login Screen

**Purpose:** Authenticate returning users  
**Priority:** P0  
**User Story:** US-1.2

#### Default State

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│           🏃 TRAPP TRACKER              │
│                                         │
│                                         │
│  Welcome back!                          │
│  Sign in to continue your journey       │
│                                         │
│  Email                                  │
│  ┌─────────────────────────────────┐   │
│  │ chris@example.com               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Password                               │
│  ┌─────────────────────────────────┐   │
│  │ ••••••••••••                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ☐ Remember me                          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Sign In                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ──────────── or ────────────          │
│                                         │
│  [Create New Account]                   │
│                                         │
│  [Forgot Password?]                     │
│                                         │
└─────────────────────────────────────────┘
```

**Annotations:**
- Logo: 80×80px, centered
- Email/Password inputs: 48px height, 8px radius
- Sign In button: Primary, 44px height, full width
- "Remember me" checkbox: 24×24px touch target
- Links: Secondary text color, underlined on press

#### Loading State

```
┌─────────────────────────────────────────┐
│                                         │
│           ░░░░░░░░░░░░░░░               │
│           ░░░░░░░░░░░░░░░               │
│                                         │
│  ░░░░░░░░░░░░░░░░░░░                    │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░              │
│                                         │
│  ░░░░░░░░░                              │
│  ┌─────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ░░░░░░░░░                              │
│  ┌─────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         ░░░░░░░░                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### Error State

```
┌─────────────────────────────────────────┐
│                                         │
│           🏃 TRAPP TRACKER              │
│                                         │
│  Welcome back!                          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ! Invalid email or password     │   │
│  │   Please try again              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Email                                  │
│  ┌─────────────────────────────────┐   │
│  │ chris@example.com          ✕    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Password                               │
│  ┌─────────────────────────────────┐   │
│  │ ••••••••••••               ✕    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Sign In                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Create New Account]                   │
│                                         │
└─────────────────────────────────────────┘
```

#### Empty State (N/A)
*Login screen doesn't have an empty state*

---

### SCR-03: Register Screen

**Purpose:** Create new user account  
**Priority:** P0  
**User Story:** US-1.1

#### Default State

```
┌─────────────────────────────────────────┐
│  [←]                                    │
│                                         │
│  Create Account                         │
│                                         │
│  Join thousands building healthy        │
│  habits with Trapp Tracker              │
│                                         │
│  Email                                  │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Password                               │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  ✓ 8+ characters                      │
│  ○ Contains number                     │
│                                         │
│  Confirm Password                       │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ☐ I agree to Terms & Privacy Policy    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Create Account            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Already have an account? [Sign In]     │
│                                         │
└─────────────────────────────────────────┘
```

**Annotations:**
- Password requirements update in real-time
- Terms checkbox must be checked to enable Create Account button
- Create Account button disabled until all fields valid

#### Validation Error State

```
┌─────────────────────────────────────────┐
│  [←]                                    │
│                                         │
│  Create Account                         │
│                                         │
│  Email                                  │
│  ┌─────────────────────────────────┐   │
│  │ invalid-email                   │   │
│  └─────────────────────────────────┘   │
│  ! Please enter a valid email address   │
│                                         │
│  Password                               │
│  ┌─────────────────────────────────┐   │
│  │ pass                            │   │
│  └─────────────────────────────────┘   │
│  ! Password must be at least 8 chars    │
│                                         │
│  Confirm Password                       │
│  ┌─────────────────────────────────┐   │
│  │ different123                    │   │
│  └─────────────────────────────────┘   │
│  ! Passwords do not match               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Create Account            │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-04: Home Screen

**Purpose:** Main dashboard, quick access to logging  
**Priority:** P0  
**User Story:** US-2.3, US-4.4

#### Default State

```
┌─────────────────────────────────────────┐
│  Good morning, Chris!            [⚙️]   │
│  March 15, 2026                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔥 Current Streak              │   │
│  │                                 │   │
│  │       7 days                    │   │
│  │                                 │   │
│  │  Keep it up! 🎉                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Quick Actions                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  🏃     │ │  🏋️    │ │  💪    │  │
│  │ Running │ │ Squats  │ │ Pushups │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ┌─────────┐                          │
│  │  🎯     │                          │
│  │ Pullups │                          │
│  └─────────┘                          │
│                                         │
│  This Week                              │
│  ┌─────────┐ ┌─────────┐               │
│  │   5     │ │  12.5km │               │
│  │Workouts │ │ Total   │               │
│  └─────────┘ └─────────┘               │
│                                         │
│  Recent Workouts                   [→]  │
│  ┌─────────────────────────────────┐   │
│  │ 🏃 Running          2 hours ago │   │
│  │    5.0 km • 30 min              │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🏋️ Squats          Yesterday   │   │
│  │    3 sets × 15 reps             │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
│  [🏠]    [📅]    [📊]    [🏆]          │
└─────────────────────────────────────────┘
```

**Annotations:**
- Streak card: Primary gradient background
- Quick action buttons: 80×80px each, 44px touch target
- Week stats: Horizontal scroll if needed
- Recent workouts: Tap to view detail, swipe to delete

#### Empty State (No Workouts)

```
┌─────────────────────────────────────────┐
│  Good morning, Chris!            [⚙️]   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🔥 Current Streak              │   │
│  │                                 │   │
│  │       0 days                    │   │
│  │                                 │   │
│  │  Start your first streak!       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         🏃💨                    │   │
│  │                                 │   │
│  │  No workouts yet!               │   │
│  │                                 │   │
│  │  Start your fitness journey     │   │
│  │  by logging your first workout. │   │
│  │                                 │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │   Log First Workout     │   │   │
│  │  └─────────────────────────┘   │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Quick Actions                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │  🏃     │ │  🏋️    │ │  💪    │  │
│  │ Running │ │ Squats  │ │ Pushups │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│  ┌─────────┐                          │
│  │  🎯     │                          │
│  │ Pullups │                          │
│  └─────────┘                          │
│                                         │
└─────────────────────────────────────────┘
│  [🏠]    [📅]    [📊]    [🏆]          │
└─────────────────────────────────────────┘
```

#### Loading State

```
┌─────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░           ░░░   │
│  ░░░░░░░░░░░░░░░░░                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░        │   │
│  │                                 │   │
│  │       ░░░░░░░░░                 │   │
│  │                                 │   │
│  │  ░░░░░░░░░░░░░░░░░              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ░░░░░░░░░░░                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ ░░░░░░░ │ │ ░░░░░░░ │ │ ░░░░░░░ │  │
│  │ ░░░░░░░ │ │ ░░░░░░░ │ │ ░░░░░░░ │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│                                         │
│  ░░░░░░░░░░░                       [→] │
│  ┌─────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-05: Workout Type Select

**Purpose:** Choose workout type before logging  
**Priority:** P0  
**User Story:** US-2.3

#### Default State

```
┌─────────────────────────────────────────┐
│  [←]  Log Workout                       │
│                                         │
│  Select Workout Type                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    🏃                           │   │
│  │                                 │   │
│  │    Running                      │   │
│  │                                 │   │
│  │  Track distance and time        │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    🏋️                          │   │
│  │                                 │   │
│  │    Squats                       │   │
│  │                                 │   │
│  │  Track sets and reps            │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    💪                           │   │
│  │                                 │   │
│  │    Pushups                      │   │
│  │                                 │   │
│  │  Track sets and reps            │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    🎯                           │   │
│  │                                 │   │
│  │    Pullups                      │   │
│  │                                 │   │
│  │  Track sets and reps            │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Annotations:**
- Each card: 120px height, tap to select
- Selected state: Primary border (3px), primary background tint
- Cards are full-width with 16px horizontal padding
- Icon: 48×48px centered in card

#### Selected State

```
┌─────────────────────────────────────────┐
│  [←]  Log Workout                       │
│                                         │
│  Select Workout Type                    │
│                                         │
│  ┌═════════════════════════════════┐   │
│  │  ═════════════════════════════  │   │
│  │    🏃                           │   │
│  │                                 │   │
│  │    Running                      │   │
│  │    ✓ Selected                   │   │
│  │                                 │   │
│  └═════════════════════════════════┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    🏋️  Squats                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    💪  Pushups                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │    🎯  Pullups                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Continue →                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-06: Running Form

**Purpose:** Log running workout  
**Priority:** P0  
**User Story:** US-2.1

#### Default State

```
┌─────────────────────────────────────────┐
│  [←]  Log Running                       │
│                                         │
│  🏃 Running Workout                     │
│                                         │
│  Date                                   │
│  ┌─────────────────────────────────┐   │
│  │ March 15, 2026 • 7:30 AM    ▼  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Distance (km) *                        │
│  ┌─────────────────────────────────┐   │
│  │ 5.0                             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Duration (minutes) *                   │
│  ┌─────────────────────────────────┐   │
│  │ 30                              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Pace (auto-calculated)                 │
│  ┌─────────────────────────────────┐   │
│  │ 6:00 min/km                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Notes (optional)                       │
│  ┌─────────────────────────────────┐   │
│  │ Morning run in the park         │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Save Workout              │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Annotations:**
- Date/Time: Defaults to current, tap to change
- Distance/Duration: Numeric keyboard
- Pace: Auto-calculated, read-only
- Notes: Multi-line, optional
- Save button: Disabled until required fields filled

#### Validation Error State

```
┌─────────────────────────────────────────┐
│  [←]  Log Running                       │
│                                         │
│  🏃 Running Workout                     │
│                                         │
│  Distance (km) *                        │
│  ┌─────────────────────────────────┐   │
│  │ -5                          ✕   │   │
│  └─────────────────────────────────┘   │
│  ! Distance must be greater than 0      │
│                                         │
│  Duration (minutes) *                   │
│  ┌─────────────────────────────────┐   │
│  │                             ✕   │   │
│  └─────────────────────────────────┘   │
│  ! Duration is required                 │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Save Workout              │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### Success State (Toast)

```
┌─────────────────────────────────────────┐
│                                         │
│     ┌─────────────────────────────┐    │
│     │ ✓ Workout saved!            │    │
│     │ 5.0 km in 30 min            │    │
│     │ New PR! 🎉                  │    │
│     └─────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-07: Strength Form

**Purpose:** Log strength workout (squats, pushups, pullups)  
**Priority:** P0  
**User Story:** US-2.2

#### Default State

```
┌─────────────────────────────────────────┐
│  [←]  Log Squats                        │
│                                         │
│  🏋️ Squats                             │
│                                         │
│  Date                                   │
│  ┌─────────────────────────────────┐   │
│  │ March 15, 2026 • 6:00 PM    ▼  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Sets *                                 │
│  ┌─────────────────────────────────┐   │
│  │ 3                               │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Reps per set *                         │
│  ┌─────────────────────────────────┐   │
│  │ 15                              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Weight (kg) - optional                 │
│  ┌─────────────────────────────────┐   │
│  │ 20                              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Total Reps: 45                         │
│                                         │
│  Notes (optional)                       │
│  ┌─────────────────────────────────┐   │
│  │ Felt strong today               │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Save Workout              │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Annotations:**
- Total Reps: Auto-calculated (sets × reps)
- Weight: Optional, for weighted exercises
- All numeric inputs use numeric keyboard

---

### SCR-09: Calendar Screen

**Purpose:** View workout history by date  
**Priority:** P0  
**User Story:** US-3.1

#### Default State

```
┌─────────────────────────────────────────┐
│  [←]  Calendar                   [📅]   │
│                                         │
│  <    March 2026           >            │
│                                         │
│  Su  Mo  Tu  We  Th  Fr  Sa             │
│  ─────────────────────────────          │
│      1   2   3   4   5   6   7          │
│   8  ●9  10  ●11  12  ●13  14          │
│  15  16  17  18  19  20  21             │
│  22  23  24  25  26  27  28             │
│  29  30  31                             │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  March 15, 2026                         │
│  ┌─────────────────────────────────┐   │
│  │ 🏃 Running          7:30 AM    │   │
│  │    5.0 km • 30 min              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Legend:                                │
│  ● = 1 workout  ◐ = 2+ workouts         │
│                                         │
└─────────────────────────────────────────┘
│  [🏠]    [📅]    [📊]    [🏆]          │
└─────────────────────────────────────────┘
```

**Annotations:**
- Current day: Highlighted with primary color circle
- Days with workouts: Dot indicator below date
- Multiple workouts: Filled dot or number badge
- Tap day: Shows workouts in bottom panel
- Month navigation: Arrow buttons or swipe

#### Empty Month State

```
┌─────────────────────────────────────────┐
│  [←]  Calendar                   [📅]   │
│                                         │
│  <    April 2026           >            │
│                                         │
│  Su  Mo  Tu  We  Th  Fr  Sa             │
│  ─────────────────────────────          │
│       1   2   3   4   5   6             │
│   7   8   9  10  11  12  13             │
│  14  15  16  17  18  19  20             │
│  21  22  23  24  25  26  27             │
│  28  29  30                             │
│                                         │
│  ─────────────────────────────          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │       No workouts this month    │   │
│  │                                 │   │
│  │  Tap a day to log your first    │   │
│  │  workout!                       │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-11: Stats Dashboard

**Purpose:** View weekly summary and personal records  
**Priority:** P0  
**User Story:** US-4.1, US-4.2, US-4.4

#### Default State

```
┌─────────────────────────────────────────┐
│  Statistics                      [📊]   │
│                                         │
│  This Week (Mar 9-15)              ▼    │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │   5     │ │  12.5km │ │  135    │  │
│  │Workouts │ │ Running │ │ Reps    │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│                                         │
│  🔥 Current Streak                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│  ████████░░░░░░░░░░░░░░░  7 days       │
│                                         │
│  Personal Records                       │
│  ┌─────────────────────────────────┐   │
│  │ 🏃 Running      10.0 km         │   │
│  │    Mar 10, 2026                 │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🏋️ Squats      3 × 20 reps     │   │
│  │    Mar 8, 2026                  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 💪 Pushups     3 × 25 reps     │   │
│  │    Mar 12, 2026                 │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🎯 Pullups     3 × 12 reps     │   │
│  │    Mar 5, 2026                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [View Detailed Stats →]                │
│                                         │
└─────────────────────────────────────────┘
│  [🏠]    [📅]    [📊]    [🏆]          │
└─────────────────────────────────────────┘
```

#### Empty State (Insufficient Data)

```
┌─────────────────────────────────────────┐
│  Statistics                      [📊]   │
│                                         │
│  This Week (Mar 9-15)              ▼    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         📊                      │   │
│  │                                 │   │
│  │  Keep logging to see trends!    │   │
│  │                                 │   │
│  │  Your weekly summary will       │   │
│  │  appear here after you log      │   │
│  │  a few workouts.                │   │
│  │                                 │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │   Log a Workout         │   │   │
│  │  └─────────────────────────┘   │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Personal Records                       │
│  ┌─────────────────────────────────┐   │
│  │  No records yet                 │   │
│  │  Your first PR is waiting!      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-12: Achievements List

**Purpose:** View unlocked achievements  
**Priority:** P0  
**User Story:** US-5.1

#### Default State

```
┌─────────────────────────────────────────┐
│  Achievements                    [🏆]   │
│                                         │
│  8 Unlocked                             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🥉  First Step          Bronze │   │
│  │      Logged your first workout  │   │
│  │      Unlocked: Mar 1, 2026      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🥉  Getting Started     Bronze │   │
│  │      Logged 5 workouts          │   │
│  │      Unlocked: Mar 5, 2026      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🥈  Committed           Silver │   │
│  │      Logged 10 workouts         │   │
│  │      Unlocked: Mar 10, 2026     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🥈  On Fire             Silver │   │
│  │      7-day streak               │   │
│  │      Unlocked: Mar 14, 2026     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🥉  Runner              Bronze │   │
│  │      Completed 10 runs          │   │
│  │      Unlocked: Mar 12, 2026     │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
│  [🏠]    [📅]    [📊]    [🏆]          │
└─────────────────────────────────────────┘
```

#### Empty State (No Achievements)

```
┌─────────────────────────────────────────┐
│  Achievements                    [🏆]   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │         🏆                      │   │
│  │                                 │   │
│  │  No achievements yet!           │   │
│  │                                 │   │
│  │  Complete workouts to unlock    │   │
│  │  your first achievement.        │   │
│  │                                 │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │   Log a Workout         │   │   │
│  │  └─────────────────────────┘   │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-13: Achievement Unlock Modal

**Purpose:** Celebrate achievement unlock  
**Priority:** P0  
**User Story:** US-5.1, US-5.3

#### Default State

```
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════════╗ │
│  ║                                   ║ │
│  ║         🎉 🎊 🎉                  ║ │
│  ║                                   ║ │
│  ║    Achievement Unlocked!          ║ │
│  ║                                   ║ │
│  ║         🥈                        ║ │
│  ║                                   ║ │
│  ║       Committed                   ║ │
│  ║                                   ║ │
│  ║   Logged 10 workouts              ║ │
│  ║                                   ║ │
│  ║   ████████████████  10/10         ║ │
│  ║                                   ║ │
│  ║  ┌─────────┐ ┌─────────────┐     ║ │
│  ║  │  Share  │ │  Awesome!   │     ║ │
│  ║  └─────────┘ └─────────────┘     ║ │
│  ║                                   ║ │
│  ╚═══════════════════════════════════╝ │
│                                         │
│  [Confetti animation in background]     │
│                                         │
└─────────────────────────────────────────┘
```

**Annotations:**
- Modal: Centered, 320px max width
- Backdrop: 50% black, tap to dismiss
- Confetti: 2-second animation
- Medal icon: 64×64px, animated scale
- Buttons: Share (secondary), Awesome! (primary)

---

### SCR-16: Tab Navigation

**Purpose:** Main app navigation shell  
**Priority:** P0

#### Layout

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Screen Content Area            │   │
│  │                                 │   │
│  │  (Changes based on active tab)  │   │
│  │                                 │   │
│  │                                 │   │
│  │                                 │   │
│  │                                 │   │
│  │                                 │   │
│  │                                 │   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ┌───┐ ┌───┐ ┌───┐ ┌───┐      │   │
│  │  │ 🏠│ │ 📅│ │ 📊│ │ 🏆│      │   │
│  │  │Home│ │Cal │ │Sts │ │Ach │      │   │
│  │  └───┘ └───┘ └───┘ └───┘      │   │
│  │   ●                            │   │
│  └─────────────────────────────────┘   │
│  (Safe area padding below)              │
│                                         │
└─────────────────────────────────────────┘
```

**Specifications:**
- Tab bar height: 80px (including safe area)
- Icon size: 24×24px
- Label: 11px, caption style
- Active indicator: Dot below icon or color change
- Touch target per tab: 48×48px minimum

---

## P1 Screens (Secondary Priority)

### SCR-01: Splash Screen

**Purpose:** App launch screen  
**Priority:** P1

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│                                         │
│                                         │
│           🏃 TRAPP TRACKER              │
│                                         │
│                                         │
│              ░░░░░                      │
│           Loading...                    │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Annotations:**
- Logo: 120×120px centered
- Loading indicator: Primary color spinner
- Background: Primary color or white
- Duration: Until app is ready (<2 seconds target)

---

### SCR-08: Workout Success

**Purpose:** Confirmation after logging workout  
**Priority:** P1

#### Default State

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              ✓                          │
│           (48px circle)                 │
│                                         │
│       Workout Saved!                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🏃 Running                     │   │
│  │                                 │   │
│  │  5.0 km in 30 minutes           │   │
│  │  Pace: 6:00 min/km              │   │
│  │                                 │   │
│  │  March 15, 2026 • 7:30 AM       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🎉 New Personal Record!        │   │
│  │  Longest run this month         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     [View Stats]  [Done]        │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-10: Day Detail View

**Purpose:** View all workouts for a specific day  
**Priority:** P1

```
┌─────────────────────────────────────────┐
│  [←]  March 15, 2026            [+]    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Sunday, March 15               │   │
│  │                                 │   │
│  │  2 workouts • 45 minutes        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Morning                                │
│  ┌─────────────────────────────────┐   │
│  │ 🏃 Running          7:30 AM    │   │
│  │    5.0 km • 30 min              │   │
│  │    Morning run in the park      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Evening                                │
│  ┌─────────────────────────────────┐   │
│  │ 🏋️ Squats          6:00 PM    │   │
│  │    3 sets × 15 reps             │   │
│  │    Weight: 20 kg                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       [Add Another Workout]     │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-14: Edit Workout

**Purpose:** Modify existing workout  
**Priority:** P1

```
┌─────────────────────────────────────────┐
│  [←]  Edit Workout              [💾]   │
│                                         │
│  🏃 Running Workout                     │
│                                         │
│  Date                                   │
│  ┌─────────────────────────────────┐   │
│  │ March 15, 2026 • 7:30 AM    ▼  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Distance (km) *                        │
│  ┌─────────────────────────────────┐   │
│  │ 5.0                             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Duration (minutes) *                   │
│  ┌─────────────────────────────────┐   │
│  │ 30                              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Notes                                  │
│  ┌─────────────────────────────────┐   │
│  │ Morning run in the park         │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  [Cancel]     [Save Changes]    │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-15: Delete Confirmation

**Purpose:** Confirm workout deletion  
**Priority:** P1

```
┌─────────────────────────────────────────┐
│                                         │
│           ⚠️                            │
│                                         │
│  Delete Workout?                        │
│                                         │
│  This will permanently remove your      │
│  running workout from March 15, 2026.   │
│                                         │
│  This action cannot be undone.          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Cancel                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Delete                  │   │
│  │     (Error color background)    │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-17: Empty States

**Purpose:** Guide users when no data exists  
**Priority:** P1

#### Home - No Workouts

```
┌─────────────────────────────────────────┐
│                                         │
│           🏃💨                          │
│                                         │
│  No workouts yet!                       │
│                                         │
│  Start your fitness journey by          │
│  logging your first workout.            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     Log First Workout           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### Calendar - No Workouts in Month

```
┌─────────────────────────────────────────┐
│                                         │
│           📅                            │
│                                         │
│  No workouts this month                 │
│                                         │
│  Tap a day to log your first workout!   │
│                                         │
└─────────────────────────────────────────┘
```

#### Stats - Insufficient Data

```
┌─────────────────────────────────────────┐
│                                         │
│           📊                            │
│                                         │
│  Keep logging to see trends!            │
│                                         │
│  Your statistics will appear here       │
│  after you log a few workouts.          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Log a Workout             │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-18: Error States

**Purpose:** Handle errors gracefully  
**Priority:** P1

#### Network Error

```
┌─────────────────────────────────────────┐
│                                         │
│           📡                            │
│                                         │
│  Connection Issue                       │
│                                         │
│  We couldn't connect to the server.     │
│  Your data is saved locally and will    │
│  sync when you're back online.          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Try Again                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Continue Offline]                     │
│                                         │
└─────────────────────────────────────────┘
```

#### Sync Error

```
┌─────────────────────────────────────────┐
│                                         │
│           ⚠️                            │
│                                         │
│  Sync Failed                            │
│                                         │
│  We couldn't sync your recent workout.  │
│  It's saved locally and will retry      │
│  automatically.                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Retry Sync                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### General Error

```
┌─────────────────────────────────────────┐
│                                         │
│           😕                            │
│                                         │
│  Something went wrong                   │
│                                         │
│  We encountered an unexpected error.    │
│  Please try again.                      │
│                                         │
│  Error: Unable to load data             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │       Retry                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Contact Support]                      │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-19: Loading States

**Purpose:** Show loading progress  
**Priority:** P1

#### Skeleton Screen (Home)

```
┌─────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░           ░░░   │
│  ░░░░░░░░░░░░░░░░░                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░        │   │
│  │                                 │   │
│  │       ░░░░░░░░░                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ░░░░░░░░░░░                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ ░░░░░░░ │ │ ░░░░░░░ │ │ ░░░░░░░ │  │
│  │ ░░░░░░░ │ │ ░░░░░░░ │ │ ░░░░░░░ │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│                                         │
│  ░░░░░░░░░░░                       [→] │
│  ┌─────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### Spinner (Action Loading)

```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│              ⟳                        │
│         (Spinning indicator)            │
│                                         │
│         Saving Workout...               │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

---

### SCR-20: Settings

**Purpose:** Basic app settings  
**Priority:** P1

```
┌─────────────────────────────────────────┐
│  [←]  Settings                          │
│                                         │
│  Account                                │
│  ┌─────────────────────────────────┐   │
│  │ 👤 Profile                      │   │
│  │ chris@example.com           →   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Preferences                            │
│  ┌─────────────────────────────────┐   │
│  │ 🔔 Notifications            →   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 📏 Units                    →   │   │
│  │ Kilometers                  →   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🌙 Dark Mode                ○   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Data                                   │
│  ┌─────────────────────────────────┐   │
│  │ 📤 Export Data              →   │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🗑️ Clear All Data           →   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  About                                  │
│  ┌─────────────────────────────────┐   │
│  │ ℹ️ About Trapp Tracker      →   │   │
│  │ Version 1.0.0               →   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Log Out                 │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

## Screen State Summary

| Screen ID | Default | Loading | Error | Empty | Success |
|-----------|---------|---------|-------|-------|---------|
| SCR-01 Splash | ✓ | - | - | - | - |
| SCR-02 Login | ✓ | ✓ | ✓ | N/A | - |
| SCR-03 Register | ✓ | ✓ | ✓ | N/A | ✓ |
| SCR-04 Home | ✓ | ✓ | ✓ | ✓ | - |
| SCR-05 Workout Select | ✓ | - | - | - | - |
| SCR-06 Running Form | ✓ | ✓ | ✓ | N/A | ✓ |
| SCR-07 Strength Form | ✓ | ✓ | ✓ | N/A | ✓ |
| SCR-08 Success | ✓ | - | - | - | N/A |
| SCR-09 Calendar | ✓ | ✓ | ✓ | ✓ | - |
| SCR-10 Day Detail | ✓ | ✓ | ✓ | ✓ | - |
| SCR-11 Stats | ✓ | ✓ | ✓ | ✓ | - |
| SCR-12 Achievements | ✓ | ✓ | ✓ | ✓ | - |
| SCR-13 Unlock Modal | ✓ | - | - | - | N/A |
| SCR-14 Edit | ✓ | ✓ | ✓ | N/A | ✓ |
| SCR-15 Delete Confirm | ✓ | - | - | - | - |
| SCR-16 Tab Nav | ✓ | - | - | - | - |
| SCR-17 Empty States | ✓ | - | - | N/A | - |
| SCR-18 Error States | ✓ | - | N/A | - | - |
| SCR-19 Loading | ✓ | N/A | - | - | - |
| SCR-20 Settings | ✓ | ✓ | ✓ | - | - |

---

## Interaction Notes

### Gesture Support

| Gesture | Action | Screen |
|---------|--------|--------|
| Tap | Select/Activate | All |
| Swipe Left | Delete workout | Home, Calendar, History |
| Swipe Right | Edit workout | Home, Calendar, History |
| Pull Down | Refresh data | Home, Calendar, Stats |
| Pinch | Zoom calendar (web) | Calendar |

### Keyboard Shortcuts (Web)

| Shortcut | Action |
|----------|--------|
| `H` | Go to Home |
| `C` | Go to Calendar |
| `S` | Go to Stats |
| `A` | Go to Achievements |
| `L` | Log new workout |
| `?` | Show keyboard shortcuts |

---

*These wireframes should be referenced during implementation. Any deviations must be documented and approved.*

**Last Updated:** March 15, 2026  
**Next Review:** After developer implementation begins
