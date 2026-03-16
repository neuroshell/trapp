# Trapp Tracker - User Flows

**Version:** 1.0  
**Last Updated:** March 15, 2026  
**Platform:** React Native + Expo (iOS, Android, Web)

---

## Document Overview

This document details the complete user flows for Trapp Tracker, covering all primary user journeys from onboarding through core feature usage. Each flow includes:

- **Flow Diagram:** Visual representation of the user journey
- **Step Descriptions:** Detailed explanation of each step
- **Decision Points:** Branching logic and conditions
- **Error Paths:** Alternative flows for error scenarios
- **Success Criteria:** Expected outcomes

---

## Flow Legend

```
┌─────────────┐
│   Screen    │  Rectangle = Screen/View
└─────────────┘

     ▼          Arrow = Navigation/Flow direction

    ◇ ◇ ◇ ◇     Diamond = Decision point

    ( O )       Circle = Start/End point

    [Action]    Brackets = User action

   {System}     Braces = System process

    ─ ─ ─ ─      Dashed = Optional/Alternative path
```

---

## Flow 1: Onboarding & Authentication

### 1.1 First-Time User Flow

**Goal:** Guide new users from app download to first workout log  
**Entry Point:** App launch (first time)  
**Exit Point:** Home screen with first workout logged

```mermaid
flowchart TD
    A((App Launch)) --> B[Splash Screen]
    B --> C{First Launch?}
    C -->|Yes| D[Onboarding Screen 1: Welcome]
    C -->|No| E{Authenticated?}

    D --> F[Onboarding Screen 2: Features]
    F --> G[Onboarding Screen 3: Get Started]
    G --> H{Skip Onboarding?}
    H -->|No| I[Complete Onboarding]
    H -->|Yes| J[Mark Onboarding Complete]
    I --> J
    J --> K[Login/Register Screen]

    E -->|Yes| L[Home Screen]
    E -->|No| K

    K --> M{Has Account?}
    M -->|No| N[Register Screen]
    M -->|Yes| O[Login Screen]

    N --> P{Valid Input?}
    P -->|No| Q[Show Validation Errors]
    Q --> N
    P -->|Yes| R{Agree to Terms?}
    R -->|No| S[Enable Submit Button]
    R -->|Yes| T[Create Account]
    T --> U{Success?}
    U -->|No| V[Show Error]
    V --> N
    U -->|Yes| W[Store Session]

    O --> X{Valid Credentials?}
    X -->|No| Y[Show Error Message]
    Y --> O
    X -->|Yes| Z[Authenticate User]
    Z --> AA{Success?}
    AA -->|No| AB[Show Error]
    AB --> O
    AA -->|Yes| W

    W --> AC[Load User Data]
    AC --> AD{Data Loaded?}
    AD -->|No| AE[Show Empty State]
    AD -->|Yes| L

    L --> AF[Show Empty State CTA]
    AF --> AG[Log First Workout]
    AG --> AH((Flow Complete))
```

### 1.2 Returning User Flow

**Goal:** Authenticate returning users quickly  
**Entry Point:** App launch  
**Exit Point:** Home screen

```mermaid
flowchart TD
    A((App Launch)) --> B[Splash Screen]
    B --> C{Valid Session?}
    C -->|Yes| D[Load Cached Data]
    C -->|No| E[Login Screen]

    D --> F{Data Loaded?}
    F -->|Yes| G[Home Screen]
    F -->|No| H[Show Loading State]
    H --> I{Load Success?}
    I -->|Yes| G
    I -->|No| J[Show Error with Retry]
    J --> K{Retry?}
    K -->|Yes| D
    K -->|No| E

    E --> L{Enter Credentials}
    L --> M[Login Screen]
    M --> N{Valid?}
    N -->|No| O[Show Error]
    O --> M
    N -->|Yes| P[Authenticate]
    P --> Q{Success?}
    Q -->|No| R[Show Error]
    R --> M
    Q -->|Yes| S[Store Session]
    S --> G

    G --> T((Flow Complete))
```

### 1.3 Session Recovery Flow

**Goal:** Handle expired sessions gracefully  
**Entry Point:** Any authenticated screen  
**Exit Point:** Login screen or recovered session

```mermaid
flowchart TD
    A((API Request)) --> B{Session Valid?}
    B -->|Yes| C[Proceed with Request]
    B -->|No| D[Session Expired]

    D --> E{Refresh Token Available?}
    E -->|Yes| F[Attempt Token Refresh]
    E -->|No| G[Clear Session]

    F --> H{Refresh Success?}
    H -->|Yes| I[Update Session]
    I --> C
    H -->|No| G

    G --> J[Store Redirect Path]
    J --> K[Navigate to Login]
    K --> L[Show Session Expired Message]
    L --> M[User Logs In]
    M --> N{Redirect Path Saved?}
    N -->|Yes| O[Navigate to Original Screen]
    N -->|No| P[Navigate to Home]

    O --> Q((Flow Complete))
    P --> Q
    C --> Q
```

---

## Flow 2: Workout Logging (Critical Path)

### 2.1 Quick Log Flow (<10 seconds)

**Goal:** Log a workout in under 10 seconds  
**Entry Point:** Home screen  
**Exit Point:** Success confirmation  
**Target:** Maximum 3-4 taps

```mermaid
flowchart TD
    A((Home Screen)) --> B[User Taps Quick Action]
    B --> C{Workout Type Selected?}
    C -->|Running| D[Running Form]
    C -->|Strength| E[Strength Form]

    D --> F{Defaults Available?}
    F -->|Yes| G[Pre-fill Last Values]
    F -->|No| H[Use Standard Defaults]

    G --> I[User Confirms/Adjusts Values]
    H --> I

    I --> J{Required Fields Complete?}
    J -->|No| K[Show Validation]
    K --> I
    J -->|Yes| L[User Taps Save]

    L --> M[Save to Local Storage]
    M --> N{Save Success?}
    N -->|No| O[Show Error with Retry]
    O --> P{Retry?}
    P -->|Yes| M
    P -->|No| Q[Return to Home]

    N -->|Yes| R[Check for Personal Record]
    R --> S{New PR?}
    S -->|Yes| T[Flag as PR]
    S -->|No| U[Standard Save]

    T --> V[Check Achievement Criteria]
    U --> V

    V --> W{Achievement Unlocked?}
    W -->|Yes| X[Queue Achievement Notification]
    W -->|No| Y[Show Success Toast]

    X --> Y
    Y --> Z[Update Home Screen Stats]
    Z --> AA((Return to Home))

    style L fill:#4CAF50,color:#fff
    style AA fill:#2196F3,color:#fff
```

**Step-by-Step Timing Analysis:**

| Step      | Action                     | Target Time     |
| --------- | -------------------------- | --------------- |
| 1         | Tap Quick Action button    | 0.5s            |
| 2         | Form appears with defaults | 0.2s            |
| 3         | Review/adjust values       | 3-5s            |
| 4         | Tap Save button            | 0.5s            |
| 5         | Save confirmation          | 0.3s            |
| **Total** |                            | **<10 seconds** |

### 2.2 Full Workout Log Flow

**Goal:** Log a detailed workout with all options  
**Entry Point:** Home screen or Calendar  
**Exit Point:** Success confirmation

```mermaid
flowchart TD
    A((Home Screen)) --> B[User Taps + Button]
    B --> C[Workout Type Selection]

    C --> D{Select Type}
    D -->|Running| E[Running Form]
    D -->|Squats| F[Strength Form]
    D -->|Pushups| F
    D -->|Pullups| F

    E --> G[Enter Date/Time]
    G --> H[Enter Distance]
    H --> I[Enter Duration]
    I --> J[Enter Notes Optional]
    J --> K{Validate}

    F --> L[Enter Date/Time]
    L --> M[Enter Sets]
    M --> N[Enter Reps]
    N --> O[Enter Weight Optional]
    O --> P[Enter Notes Optional]
    P --> K

    K -->|Invalid| Q[Show Inline Errors]
    Q --> G

    K -->|Valid| R[User Taps Save]
    R --> S[Save Workout]
    S --> T{Save Success?}

    T -->|No| U[Show Error]
    U --> V{Retry?}
    V -->|Yes| S
    V -->|No| W[Cancel]

    T -->|Yes| X[Check for PR]
    X --> Y{New PR?}
    Y -->|Yes| Z[Show PR Badge]
    Y -->|No| AA[Continue]

    Z --> AB[Check Achievements]
    AA --> AB

    AB --> AC{Achievement Unlocked?}
    AC -->|Yes| AD[Show Celebration Modal]
    AC -->|No| AE[Show Success Toast]

    AD --> AF[User Dismisses Modal]
    AF --> AG
    AE --> AG[Update UI]
    AG --> AH((Return to Source))
```

### 2.3 Edit Workout Flow

**Goal:** Modify an existing workout  
**Entry Point:** Workout list item (swipe or tap)  
**Exit Point:** Updated workout or cancel

```mermaid
flowchart TD
    A((Workout List)) --> B[User Swipes or Long-Presses]
    B --> C[Show Action Menu]
    C --> D{Select Action}

    D -->|Edit| E[Open Edit Form]
    D -->|Delete| F[Delete Flow]
    D -->|Cancel| G[Dismiss Menu]

    E --> H[Pre-fill Current Values]
    H --> I[User Modifies Values]
    I --> J{Validate Changes}

    J -->|Invalid| K[Show Errors]
    K --> I

    J -->|Valid| L[User Taps Save]
    L --> M[Update Workout]
    M --> N{Update Success?}

    N -->|No| O[Show Error]
    O --> P{Retry?}
    P -->|Yes| M
    P -->|No| Q[Keep Original]

    N -->|Yes| R[Show Success Toast]
    R --> S[Refresh List]
    S --> T((Flow Complete))

    G --> U((Flow Complete))
    Q --> U
```

### 2.4 Delete Workout Flow

**Goal:** Remove a workout with confirmation  
**Entry Point:** Workout list item  
**Exit Point:** Deleted workout or cancel

```mermaid
flowchart TD
    A((Workout List)) --> B[User Swipes to Delete]
    B --> C[Show Delete Confirmation]

    C --> D{User Confirms?}
    D -->|Cancel| E[Dismiss Dialog]
    D -->|Delete| F[Show Warning]

    F --> G[User Confirms Again]
    G --> H[Delete from Storage]
    H --> I{Delete Success?}

    I -->|No| J[Show Error]
    J --> K[Keep Workout]

    I -->|Yes| L[Remove from List]
    L --> M[Show Undo Toast]
    M --> N{Undo Requested?}

    N -->|Yes| O[Restore Workout]
    N -->|No| P[Permanent Delete]

    O --> Q[Show Restored Toast]
    Q --> R((Flow Complete))

    E --> R
    K --> R
    P --> R
```

---

## Flow 3: Progress Review

### 3.1 View Statistics Flow

**Goal:** Review workout statistics and progress  
**Entry Point:** Tab bar or Home screen  
**Exit Point:** Stats screen

```mermaid
flowchart TD
    A((Any Screen)) --> B[User Taps Stats Tab]
    B --> C[Load Statistics Data]
    C --> D{Data Available?}

    D -->|No| E[Show Empty State]
    E --> F[Show CTA to Log Workout]
    F --> G{User Acts?}
    G -->|Yes| H[Navigate to Log Workout]
    G -->|No| I[Stay on Stats]

    D -->|Yes| J[Display Weekly Summary]
    J --> K[Display Personal Records]
    K --> L[Display Streak Info]

    L --> M{User Interacts?}
    M -->|View Details| N[Show Detailed Stats]
    M -->|Change Period| O[Show Period Selector]
    M -->|Exit| P[Stay on Screen]

    O --> Q{Select Period}
    Q -->|Week| R[Load Week Data]
    Q -->|Month| S[Load Month Data]
    Q -->|Year| T[Load Year Data]
    Q -->|All Time| U[Load All Data]

    R --> J
    S --> J
    T --> J
    U --> J

    N --> V[Show Charts/Graphs]
    V --> W{User Explores?}
    W -->|Yes| X[Interactive Chart View]
    W -->|No| Y[Return to Summary]

    X --> Y
    Y --> Z((Continue Browsing))
    H --> Z
    I --> Z
    P --> Z
```

### 3.2 View Calendar Flow

**Goal:** Browse workout history by date  
**Entry Point:** Tab bar  
**Exit Point:** Calendar screen

```mermaid
flowchart TD
    A((Any Screen)) --> B[User Taps Calendar Tab]
    B --> C[Load Current Month]
    C --> D[Render Calendar Grid]
    D --> E[Mark Days with Workouts]

    E --> F{User Action?}
    F -->|Previous Month| G[Load Previous Month]
    F -->|Next Month| H[Load Next Month]
    F -->|Today| I[Jump to Current Month]
    F -->|Select Day| J[Show Day Detail]
    F -->|Add Workout| K[Quick Add for Day]

    G --> C
    H --> C
    I --> C

    J --> L[Load Day's Workouts]
    L --> M{Workouts Exist?}
    M -->|Yes| N[Show Workout List]
    M -->|No| O[Show Empty State]

    N --> P{User Action?}
    P -->|View Workout| Q[Show Workout Detail]
    P -->|Edit Workout| R[Edit Flow]
    P -->|Delete Workout| S[Delete Flow]
    P -->|Add Workout| T[Add to Day]
    P -->|Close| U[Return to Calendar]

    O --> V[Show Log Workout CTA]
    V --> W{User Acts?}
    W -->|Yes| K
    W -->|No| U

    K --> X[Open Workout Form]
    X --> Y[Pre-select Date]
    Y --> Z[Log Workout Flow]

    Q --> AA((Flow Complete))
    R --> AA
    S --> AA
    T --> AA
    U --> AA
    Z --> AA
```

### 3.3 View Achievements Flow

**Goal:** Browse unlocked and locked achievements  
**Entry Point:** Tab bar  
**Exit Point:** Achievements screen

```mermaid
flowchart TD
    A((Any Screen)) --> B[User Taps Achievements Tab]
    B --> C[Load Achievement Data]
    C --> D{Data Loaded?}

    D -->|No| E[Show Loading State]
    E --> F{Load Success?}
    F -->|No| G[Show Error with Retry]
    F -->|Yes| H
    G --> I{Retry?}
    I -->|Yes| C
    I -->|No| J[Return]

    D -->|Yes| H[Display Achievement List]
    H --> K{User Action?}

    K -->|View Unlocked| L[Show Unlocked Only]
    K -->|View All| M[Show All Achievements]
    K -->|Filter by Category| N[Show Filter Options]
    K -->|View Detail| O[Show Achievement Detail]

    L --> H
    M --> H

    N --> P{Select Category}
    P -->|Consistency| Q[Show Consistency Achievements]
    P -->|Streak| R[Show Streak Achievements]
    P -->|Exercise| S[Show Exercise Achievements]
    P -->|Clear| H

    Q --> H
    R --> H
    S --> H

    O --> T{Achievement Status?}
    T -->|Unlocked| U[Show Full Details]
    T -->|Locked| V[Show Requirements]

    U --> W[Show Share Option]
    W --> X{Share?}
    X -->|Yes| Y[Open Share Sheet]
    X -->|No| Z[Close Detail]

    V --> AA[Show Progress Toward Unlock]
    AA --> Z

    Y --> AB((Flow Complete))
    Z --> AB
    J --> AB
```

---

## Flow 4: Settings & Data Management

### 4.1 Settings Navigation Flow

**Goal:** Access and modify app settings  
**Entry Point:** Settings icon or Home screen  
**Exit Point:** Settings screen or return

```mermaid
flowchart TD
    A((Any Screen)) --> B[User Taps Settings Icon]
    B --> C[Open Settings Screen]
    C --> D[Display Settings Categories]

    D --> E{User Selects}
    E -->|Profile| F[Profile Settings]
    E -->|Notifications| G[Notification Settings]
    E -->|Units| H[Unit Preferences]
    E -->|Dark Mode| I[Toggle Theme]
    E -->|Export Data| J[Export Flow]
    E -->|Clear Data| K[Clear Data Flow]
    E -->|About| L[About Screen]
    E -->|Logout| M[Logout Flow]
    E -->|Back| N[Return]

    F --> O[Edit Profile]
    O --> P[Save Changes]
    P --> Q{Save Success?}
    Q -->|Yes| R[Show Success]
    Q -->|No| S[Show Error]
    R --> C
    S --> O

    G --> T[Toggle Notifications]
    T --> U[Request Permission if Needed]
    U --> C

    H --> V{Select Unit System}
    V -->|Metric| W[Set km/kg]
    V -->|Imperial| X[Set mi/lbs]
    W --> C
    X --> C

    I --> Y[Toggle Theme State]
    Y --> Z[Apply Theme]
    Z --> C

    J --> AA[Export Data Flow]
    K --> AB[Clear Data Flow]
    L --> AC[Show App Info]
    AC --> C

    M --> AD[Logout Flow]
    N --> AE((Return to Previous))
```

### 4.2 Data Export Flow

**Goal:** Export user workout data  
**Entry Point:** Settings > Export Data  
**Exit Point:** Export complete or cancel

```mermaid
flowchart TD
    A((Settings)) --> B[User Taps Export Data]
    B --> C[Show Export Options]

    C --> D{Select Format}
    D -->|CSV| E[Select CSV Format]
    D -->|JSON| F[Select JSON Format]
    D -->|Cancel| G[Return]

    E --> H[Configure Export Options]
    F --> H

    H --> I{Select Date Range}
    I -->|All Time| J[Include All Data]
    I -->|Last Month| K[Include Last 30 Days]
    I -->|Custom| L[Select Date Range]

    J --> M[Preview Data Count]
    K --> M
    L --> M

    M --> N{User Confirms?}
    N -->|No| G
    N -->|Yes| O[Generate Export File]

    O --> P{Generation Success?}
    P -->|No| Q[Show Error]
    Q --> G

    P -->|Yes| R[Show Share Options]
    R --> S{Select Share Method}

    S -->|Save to Files| T[Save to Device]
    S -->|Share via App| U[Open Share Sheet]
    S -->|Email| V[Open Email Client]
    S -->|Cancel| W[Keep in App]

    T --> X[Show Save Confirmation]
    U --> X
    V --> X
    W --> X

    X --> Y((Flow Complete))
    G --> Y
```

### 4.3 Logout Flow

**Goal:** Securely log out user  
**Entry Point:** Settings > Logout  
**Exit Point:** Login screen

```mermaid
flowchart TD
    A((Settings)) --> B[User Taps Logout]
    B --> C[Show Logout Confirmation]

    C --> D{User Confirms?}
    D -->|Cancel| E[Return to Settings]
    D -->|Logout| F[Clear Session Data]

    F --> G[Clear Cached Data]
    G --> H[Clear Local Storage]
    H --> I{Clear Success?}

    I -->|No| J[Show Warning]
    J --> K{Force Logout?}
    K -->|No| E
    K -->|Yes| L

    I -->|Yes| L[Navigate to Login]
    L --> M[Show Logout Success Message]
    M --> N((Login Screen))

    E --> O((Flow Complete))
```

---

## Flow 5: Achievement System

### 5.1 Achievement Unlock Flow

**Goal:** Detect and celebrate achievement unlocks  
**Entry Point:** Workout save completion  
**Exit Point:** Achievement celebration or toast

```mermaid
flowchart TD
    A((Workout Saved)) --> B[Get User Statistics]
    B --> C[Check Achievement Criteria]

    C --> D{Check Consistency Achievements}
    D -->|First Workout| E{Unlocked First Step?}
    D -->|5 Workouts| F{Unlocked Getting Started?}
    D -->|10 Workouts| G{Unlocked Committed?}
    D -->|25 Workouts| H{Unlocked Dedicated?}
    D -->|50 Workouts| I{Unlocked Devoted?}
    D -->|100 Workouts| J{Unlocked Obsessed?}

    E -->|No| K[Unlock Achievement]
    E -->|Yes| L[Skip]
    F -->|No| K
    F -->|Yes| L
    G -->|No| K
    G -->|Yes| L
    H -->|No| K
    H -->|Yes| L
    I -->|No| K
    I -->|Yes| L
    J -->|No| K
    J -->|Yes| L

    C --> M{Check Streak Achievements}
    M -->|3-Day| N{Unlocked On Fire?}
    M -->|7-Day| O{Unlocked Hot Streak?}
    M -->|14-Day| P{Unlocked Unstoppable?}
    M -->|30-Day| Q{Unlocked Legendary?}
    M -->|100-Day| R{Unlocked Immortal?}

    N -->|No| K
    N -->|Yes| L
    O -->|No| K
    O -->|Yes| L
    P -->|No| K
    P -->|Yes| L
    Q -->|No| K
    Q -->|Yes| L
    R -->|No| K
    R -->|Yes| L

    C --> S{Check Exercise Achievements}
    S -->|10 Runs| T{Unlocked Runner?}
    S -->|1000 Squats| U{Unlocked Squat Master?}
    S -->|500 Pushups| V{Unlocked Pushup King?}
    S -->|200 Pullups| W{Unlocked Pullup Champion?}

    T -->|No| K
    T -->|Yes| L
    U -->|No| K
    U -->|Yes| L
    V -->|No| K
    V -->|Yes| L
    W -->|No| K
    W -->|Yes| L

    K --> X[Mark as Unlocked]
    X --> Y[Save to Storage]
    Y --> Z{Major Achievement?}

    Z -->|Yes| AA[Show Full Celebration Modal]
    Z -->|No| AB[Show Toast Notification]

    AA --> AC[Play Confetti Animation]
    AC --> AD[Queue for Achievement Screen]
    AD --> AE[User Dismisses]

    AB --> AF[Auto-dismiss after 3s]

    AE --> AG((Return to Flow))
    AF --> AG
    L --> AG
```

### 5.2 Personal Record Detection Flow

**Goal:** Detect and flag new personal records  
**Entry Point:** Workout save  
**Exit Point:** PR flag set or not

```mermaid
flowchart TD
    A((Workout Saved)) --> B{Workout Type?}

    B -->|Running| C[Get Previous Best Distance]
    C --> D{New Distance > Previous?}
    D -->|Yes| E[Flag as Distance PR]
    D -->|No| F[Check Duration PR]

    F --> G[Get Previous Best Duration]
    G --> H{New Duration > Previous?}
    H -->|Yes| I[Flag as Duration PR]
    H -->|No| J[No PR]

    B -->|Squats| K[Get Previous Best Reps]
    K --> L{New Reps > Previous?}
    L -->|Yes| M[Flag as Squats PR]
    L -->|No| J

    B -->|Pushups| N[Get Previous Best Reps]
    N --> O{New Reps > Previous?}
    O -->|Yes| P[Flag as Pushups PR]
    O -->|No| J

    B -->|Pullups| Q[Get Previous Best Reps]
    Q --> R{New Reps > Previous?}
    R -->|Yes| S[Flag as Pullups PR]
    R -->|No| J

    E --> T[Store PR Date]
    I --> T
    M --> T
    P --> T
    S --> T

    T --> U[Update PR Display]
    U --> V[Show PR Indicator]
    V --> W((Flow Complete))

    J --> X((No PR))
```

---

## Flow 6: Offline & Sync

### 6.1 Offline Workout Logging Flow

**Goal:** Log workouts while offline  
**Entry Point:** Home screen (offline state)  
**Exit Point:** Workout saved locally

```mermaid
flowchart TD
    A((Home Screen)) --> B{Network Available?}
    B -->|Yes| C[Normal Log Flow]
    B -->|No| D[Show Offline Indicator]

    D --> E[User Initiates Log Workout]
    E --> F[Open Workout Form]
    F --> G[User Enters Data]
    G --> H[User Taps Save]

    H --> I[Save to Local Storage]
    I --> J[Mark as Pending Sync]
    J --> K[Add to Sync Queue]

    K --> L[Show Success with Note]
    L --> M[Display 'Will sync when online']
    M --> N[Update UI Locally]

    N --> O{Network Becomes Available?}
    O -->|No| P[Stay Offline]
    O -->|Yes| Q[Trigger Sync]

    Q --> R[Process Sync Queue]
    R --> S{Sync Success?}
    S -->|Yes| T[Mark as Synced]
    S -->|No| U[Retry with Backoff]

    T --> V[Show Sync Complete Toast]
    V --> W((Flow Complete))

    U --> X{Max Retries Reached?}
    X -->|No| R
    X -->|Yes| Y[Show Sync Error]
    Y --> Z[Keep in Queue]
    Z --> P

    P --> AA((Offline Mode))
    C --> AB((Online Mode))
```

### 6.2 Sync Recovery Flow

**Goal:** Recover from sync failures  
**Entry Point:** Sync attempt failure  
**Exit Point:** Sync success or queued for retry

```mermaid
flowchart TD
    A((Sync Attempt)) --> B{Sync Failure?}
    B -->|No| C[Sync Complete]
    B -->|Yes| D[Determine Failure Type]

    D -->|Network Error| E[Check Connectivity]
    D -->|Auth Error| F[Refresh Token]
    D -->|Server Error| G[Implement Backoff]
    D -->|Data Error| H[Log Error Details]

    E --> I{Network Available?}
    I -->|No| J[Queue for Retry]
    I -->|Yes| K[Retry Immediately]

    F --> L{Token Refresh Success?}
    L -->|Yes| K
    L -->|No| M[Require Re-authentication]

    G --> N{Retry Count < Max?}
    N -->|Yes| O[Wait with Exponential Backoff]
    N -->|No| P[Mark as Failed]

    O --> K
    K --> Q{Retry Success?}
    Q -->|Yes| R[Update Sync Status]
    Q -->|No| S[Increment Retry Count]

    S --> N
    R --> T[Show Success Notification]
    T --> U((Flow Complete))

    J --> V[Add to Pending Queue]
    V --> W[Show Offline Indicator]
    W --> X((Waiting for Network))

    M --> Y[Navigate to Login]
    Y --> Z((Re-auth Required))

    P --> AA[Show Sync Error]
    AA --> AB[User Can Manual Retry]
    AB --> AC((Manual Intervention))

    C --> AD((Sync Success))
```

---

## Flow 7: Error Handling

### 7.1 General Error Recovery Flow

**Goal:** Handle and recover from errors gracefully  
**Entry Point:** Any error state  
**Exit Point:** Recovery or graceful degradation

```mermaid
flowchart TD
    A((Error Occurs)) --> B[Categorize Error]

    B -->|Validation| C[Show Inline Error]
    B -->|Network| D[Show Network Error]
    B -->|Authentication| E[Show Auth Error]
    B -->|Data| F[Show Data Error]
    B -->|Unknown| G[Show Generic Error]

    C --> H[Highlight Problem Field]
    H --> I[Provide Correction Guidance]
    I --> J[User Corrects]
    J --> K[Re-validate]

    D --> L[Show Offline Mode Option]
    L --> M{Choose Offline?}
    M -->|Yes| N[Enable Offline Mode]
    M -->|No| O[Show Retry Button]

    E --> P[Clear Session]
    P --> Q[Navigate to Login]
    Q --> R[Show Session Expired Message]

    F --> S[Show Data Recovery Options]
    S --> T{Recovery Available?}
    T -->|Yes| U[Attempt Recovery]
    T -->|No| V[Show Reset Option]

    G --> W[Show Error Details]
    W --> X[Provide Support Contact]
    X --> Y[Show Retry Option]

    K --> Z{Valid Now?}
    Z -->|Yes| AA[Proceed with Action]
    Z -->|No| H

    O --> AB{Retry?}
    AB -->|Yes| AC[Retry Action]
    AB -->|No| AD[Cancel Action]

    AC --> AE{Success?}
    AE -->|Yes| AA
    AE -->|No| D

    N --> AF[Continue in Offline Mode]
    U --> AG{Recovery Success?}
    AG -->|Yes| AA
    AG -->|No| V

    V --> AH{User Confirms Reset?}
    AH -->|Yes| AI[Reset Data]
    AH -->|No| AJ[Keep Corrupted Data]

    Y --> AK{Retry?}
    AK -->|Yes| AC
    AK -->|No| AD

    AA --> AL((Flow Complete))
    AF --> AL
    AI --> AL
    AJ --> AL
    AD --> AM((Action Cancelled))
    R --> AN((Re-auth Required))
```

---

## Screen Transition Map

### Complete Navigation Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                        APP NAVIGATION MAP                       │
└─────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │   Splash    │
                              └──────┬──────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
              │ Onboarding│   │   Login   │   │   Home    │
              └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
                    │               │               │
                    │               │       ┌───────┼───────┐
                    │               │       │       │       │
                    │         ┌─────▼─────┐ │ ┌─────▼─────┐ │
                    │         │ Register  │ │ │  Workout  │ │
                    │         └───────────┘ │ │   Type    │ │
                    │                       │ └─────┬─────┘ │
                    │                       │       │       │
                    │                       │ ┌─────▼─────┐ │
                    │                       │ │  Running  │ │
                    │                       │ │   Form    │ │
                    │                       │ └─────┬─────┘ │
                    │                       │       │       │
                    │                       │ ┌─────▼─────┐ │
                    │                       │ │ Strength  │ │
                    │                       │ │   Form    │ │
                    │                       │ └─────┬─────┘ │
                    │                       │       │       │
                    │                       │ ┌─────▼─────┐ │
                    │                       │ │  Success  │ │
                    │                       │ └───────────┘ │
                    │                       │               │
                    │                       │    ┌──────────▼──────────┐
                    │                       │    │   Tab Navigation    │
                    │                       │    └──────────┬──────────┘
                    │                       │               │
                    │                       │    ┌──────────┼──────────┐
                    │                       │    │          │          │
                    │                       │ ┌──▼──┐  ┌───▼───┐  ┌───▼───┐
                    │                       │ │Home │  │Calendar│  │ Stats │
                    │                       │ └──┬──┘  └───┬───┘  └───┬───┘
                    │                       │    │        │        │
                    │                       │    │   ┌────▼────┐   │
                    │                       │    │   │Day Detail│   │
                    │                       │    │   └─────────┘   │
                    │                       │    │                 │
                    │                       │ ┌──▼─────────────────▼──┐
                    │                       │ │    Achievements       │
                    │                       │ └──────────┬────────────┘
                    │                       │            │
                    │                       │      ┌─────▼─────┐
                    │                       │      │  Unlock   │
                    │                       │      │   Modal   │
                    │                       │      └───────────┘
                    │                       │
                    │                       │ ┌─────────────────┐
                    │                       └─│    Settings     │
                    │                         └────────┬────────┘
                    │                                  │
                    │                         ┌────────┼────────┐
                    │                         │        │        │
                    │                    ┌────▼────┐ ┌─▼─┐ ┌────▼────┐
                    │                    │ Profile │ │...│ │  Logout │
                    │                    └─────────┘ └───┘ └─────────┘
                    │
              ┌─────▼─────┐
              │   Home    │
              └───────────┘
```

---

## Key Performance Metrics

### Flow Timing Targets

| Flow              | Target Time | Critical Path               |
| ----------------- | ----------- | --------------------------- |
| Quick Log Workout | <10 seconds | Home → Form → Save          |
| Full Log Workout  | <30 seconds | Home → Select → Form → Save |
| View Statistics   | <3 seconds  | Tab → Load → Display        |
| View Calendar     | <2 seconds  | Tab → Load → Display        |
| Login             | <5 seconds  | Enter → Submit → Home       |
| Register          | <30 seconds | Enter → Submit → Home       |
| Edit Workout      | <15 seconds | Select → Edit → Save        |
| Delete Workout    | <5 seconds  | Select → Confirm → Delete   |

### Tap Count Targets

| Flow           | Maximum Taps | Optimal Taps |
| -------------- | ------------ | ------------ |
| Quick Log      | 4            | 3            |
| Full Log       | 8            | 6            |
| View Stats     | 2            | 1            |
| View Calendar  | 2            | 1            |
| Login          | 3            | 2            |
| Register       | 6            | 5            |
| Edit Workout   | 5            | 4            |
| Delete Workout | 3            | 2            |

---

## Edge Cases & Error Scenarios

### Network-Related

| Scenario                  | User Impact    | Recovery                      |
| ------------------------- | -------------- | ----------------------------- |
| No network on launch      | Can't login    | Offline mode, cached session  |
| Network drops during sync | Data queued    | Auto-retry when reconnected   |
| Slow network              | Loading delays | Show skeletons, optimistic UI |
| Server error              | Action fails   | Retry with backoff            |

### Data-Related

| Scenario              | User Impact   | Recovery                    |
| --------------------- | ------------- | --------------------------- |
| Corrupted local data  | App crash     | Reset option, cloud restore |
| Sync conflict         | Data mismatch | Last-write-wins with merge  |
| Storage full          | Can't save    | Cleanup suggestions         |
| Invalid import format | Import fails  | Specific error message      |

### User Error

| Scenario           | User Impact    | Recovery                     |
| ------------------ | -------------- | ---------------------------- |
| Wrong credentials  | Can't login    | Clear error, forgot password |
| Invalid form input | Can't submit   | Inline validation            |
| Accidental delete  | Data loss      | Undo toast (5 seconds)       |
| Wrong workout type | Incorrect data | Easy edit flow               |

---

_This user flow documentation should be referenced during implementation to ensure all paths are covered. Any changes to flows must be documented and approved._

**Last Updated:** March 15, 2026  
**Next Review:** After MVP development complete
