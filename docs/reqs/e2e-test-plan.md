# Trapp Tracker - E2E Test Plan

**Document Version:** 1.0  
**Last Updated:** March 17, 2026  
**Test Framework:** Chrome Browser (Web Build)  
**Target Platform:** React Native Web (Expo)  
**Prepared For:** @ui-tester  

---

## Executive Summary

This document defines the comprehensive End-to-End (E2E) test plan for Trapp Tracker (FitTrack Pro), a cross-platform fitness tracking application. The test plan covers critical user flows across authentication, workout logging, calendar navigation, achievements, and error handling scenarios.

### Testing Scope

**In Scope:**
- Authentication flows (register, login, logout, session persistence)
- Workout logging (running, strength exercises, quick log, validation, delete)
- Navigation between screens (tabs, deep navigation)
- Calendar view interactions (month navigation, day detail)
- Statistics and achievements (stats display, achievement unlocking)
- Error states and recovery (validation, network, session)
- Accessibility compliance (WCAG 2.1 AA)

**Out of Scope (Phase 2+):**
- Backend sync operations (Phase 3)
- Multi-device synchronization (Phase 3)
- Social features (Phase 4)
- Wearable integrations (Phase 4)

### Test Environment

| Component | Configuration |
|-----------|--------------|
| **Browser** | Chrome (latest stable) |
| **Viewport** | Mobile (375x812), Tablet (768x1024), Desktop (1920x1080) |
| **Network** | Online, Offline (for offline-first validation) |
| **Storage** | Clear localStorage before test suites |
| **Test Users** | Pre-seeded test accounts (see Data Requirements) |

---

## Test Priority Matrix

| Priority | Description | Count | Coverage Target |
|----------|-------------|-------|-----------------|
| **P0 - Critical** | Core functionality, blocking issues | 12 | 100% automated |
| **P1 - High** | Important features, workarounds exist | 15 | 90% automated |
| **P2 - Medium** | Edge cases, nice-to-have validation | 10 | 70% automated |

**Total Test Scenarios:** 37

---

## Section 1: Authentication Flows

### E2E-AUTH-01: User Registration - Success Flow

**Priority:** P0 - Critical  
**User Story:** US-1.1  
**Pre-conditions:** 
- App is loaded on web browser
- User is not authenticated
- Test email is not already registered

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to app URL | Splash screen appears, then redirects to Login screen |
| 2 | Click "Create Account" or "Register" link | Register screen loads with email, password fields |
| 3 | Enter valid email: `testuser+e2e001@example.com` | Email field accepts input, no validation error |
| 4 | Enter valid password: `TestPass123` | Password field accepts input, strength indicator shows valid |
| 5 | Check "Accept Terms and Conditions" | Checkbox becomes checked |
| 6 | Click "Register" button | Loading state appears on button |
| 7 | Wait for registration to complete | Success toast appears: "Account created successfully" |
| 8 | Observe navigation | Automatically redirects to Home screen |
| 9 | Verify authentication state | User is logged in, Home screen shows user's email or welcome message |

**Post-conditions:**
- User account created in AsyncStorage
- Session persisted (user remains logged in)
- Home screen displays with empty state (no workouts)

**Success Criteria:**
- Registration completes in < 3 seconds
- User is automatically logged in
- Session persists across page refresh

**Edge Cases:**
- Email with plus addressing (`testuser+e2e001@example.com`)
- Password with exactly 8 characters (minimum)
- Rapid double-click on register button (should prevent duplicate submission)

---

### E2E-AUTH-02: User Registration - Validation Errors

**Priority:** P1 - High  
**User Story:** US-1.1  
**Pre-conditions:** 
- User is on Register screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Leave email field empty | Submit button is disabled or shows error on click |
| 2 | Enter invalid email: `notanemail` | Inline error: "Please enter a valid email address" |
| 3 | Enter email without TLD: `test@domain` | Inline error: "Please enter a valid email address" |
| 4 | Enter valid email but password empty | Inline error on password: "Password must be at least 8 characters" |
| 5 | Enter password with 7 characters: `Short1!` | Inline error: "Password must be at least 8 characters" |
| 6 | Enter password without number: `AllLetters` | Inline error or warning (if number validation enforced) |
| 7 | Enter valid credentials but don't accept terms | Error: "You must accept the terms to continue" |
| 8 | Submit form with multiple errors | All validation errors display simultaneously |

**Post-conditions:**
- No account created
- Form retains user input (doesn't clear on validation errors)

**Success Criteria:**
- All validation errors display inline
- Form submission prevented until all errors resolved
- Error messages are clear and actionable

**Accessibility Check:**
- Error messages announced to screen readers (`accessibilityRole="alert"`)
- Error fields have `aria-invalid="true"`

---

### E2E-AUTH-03: User Login - Success Flow

**Priority:** P0 - Critical  
**User Story:** US-1.2  
**Pre-conditions:** 
- User account exists: `testuser+e2e001@example.com` / `TestPass123`
- User is on Login screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter registered email: `testuser+e2e001@example.com` | Email field accepts input |
| 2 | Enter correct password: `TestPass123` | Password field masks input |
| 3 | Click "Login" button | Loading state appears |
| 4 | Wait for authentication | Success, redirects to Home screen |
| 5 | Verify authentication state | User is logged in, Home screen displays |
| 6 | Refresh browser page | User remains logged in (session persisted) |

**Post-conditions:**
- Session persisted in AsyncStorage
- User remains logged in across page refresh

**Success Criteria:**
- Login completes in < 2 seconds
- Session persists across page refresh
- Home screen loads with user's data

---

### E2E-AUTH-04: User Login - Invalid Credentials

**Priority:** P1 - High  
**User Story:** US-1.2  
**Pre-conditions:** 
- User is on Login screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter unregistered email: `notexist@example.com` | Email accepted |
| 2 | Enter any password: `WrongPass123` | Password accepted |
| 3 | Click "Login" | Loading state, then error message |
| 4 | Verify error message | Generic error: "Invalid email or password" (security best practice) |
| 5 | Enter registered email but wrong password | Same generic error message |
| 6 | Verify error accessibility | Error announced to screen readers |

**Post-conditions:**
- User remains on Login screen
- No session created
- Form fields cleared (security)

**Success Criteria:**
- Generic error message (doesn't reveal if email exists)
- Error is announced to screen readers
- Multiple failed attempts don't lock out (no rate limiting in MVP)

---

### E2E-AUTH-05: Session Persistence Across Refresh

**Priority:** P0 - Critical  
**User Story:** US-1.3  
**Pre-conditions:** 
- User is logged in

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify user is on Home screen | Home screen displays with user data |
| 2 | Refresh browser page (F5 or Ctrl+R) | Splash screen appears briefly |
| 3 | Wait for app to load | User remains on Home screen (not redirected to Login) |
| 4 | Verify authentication state | User data still displayed, no login prompt |
| 5 | Close browser tab completely | Tab closes |
| 6 | Reopen app in new tab | User is still logged in (session persists) |

**Post-conditions:**
- Session remains valid across browser sessions

**Success Criteria:**
- Session persists for 30 days (or configured expiry)
- No re-authentication required on refresh
- Session restoration completes in < 1 second

---

### E2E-AUTH-06: Logout Flow

**Priority:** P1 - High  
**User Story:** US-1.4  
**Pre-conditions:** 
- User is logged in

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Settings tab | Settings screen loads |
| 2 | Click "Logout" button | Confirmation dialog appears |
| 3 | Click "Confirm" or "Logout" | Session cleared, redirects to Login screen |
| 4 | Verify navigation | Login screen displays |
| 5 | Refresh browser page | User remains on Login screen (not logged in) |
| 6 | Click browser back button | Does not navigate back to authenticated screens |

**Post-conditions:**
- Session cleared from AsyncStorage
- User must re-authenticate to access app

**Success Criteria:**
- Logout completes in < 1 second
- All session data cleared
- Back button doesn't restore authenticated state

---

### E2E-AUTH-07: Session Expiry Handling

**Priority:** P2 - Medium  
**User Story:** US-1.3  
**Pre-conditions:** 
- User is logged in
- Test environment can simulate expired session

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Manually expire session in localStorage | Session token marked as expired |
| 2 | Navigate to any authenticated screen | Session check fails |
| 3 | Observe behavior | Redirected to Login screen |
| 4 | Verify message | Toast or message: "Session expired. Please log in again" |

**Post-conditions:**
- User logged out
- Redirected to Login screen

**Success Criteria:**
- Expired session detected and handled gracefully
- User informed of expiry reason
- No app crash or undefined behavior

---

## Section 2: Workout Logging Flows

### E2E-LOG-01: Quick Log Running Workout (<10 seconds)

**Priority:** P0 - Critical  
**User Story:** US-2.3  
**Pre-conditions:** 
- User is logged in
- User is on Home screen

**Test Steps:**

| Step | Action | Expected Result | Target Time |
|------|--------|-----------------|-------------|
| 1 | Click Quick Action button (Running) | Log form opens with pre-filled defaults | < 0.5s |
| 2 | Form appears with last/default values | Distance: ~5km, Duration: ~30min (or last values) | < 0.2s |
| 3 | Review values (no changes needed) | Values visible and valid | 2-3s |
| 4 | Click "Save" button | Loading state appears | < 0.5s |
| 5 | Wait for save confirmation | Success toast: "Workout logged!" | < 0.3s |
| 6 | Verify Home screen update | Stats updated, recent activity shows new workout | Immediate |

**Total Time:** < 10 seconds (CRITICAL METRIC)

**Post-conditions:**
- Workout saved to AsyncStorage
- Home screen stats updated
- Recent activity list shows new workout

**Success Criteria:**
- **Total flow completes in < 10 seconds** (95th percentile)
- Form pre-fills with sensible defaults
- Success confirmation visible
- UI updates immediately (optimistic update)

**Performance Measurement:**
```javascript
const startTime = performance.now();
// ... execute steps ...
const endTime = performance.now();
const duration = endTime - startTime;
expect(duration).toBeLessThan(10000); // < 10 seconds
```

---

### E2E-LOG-02: Log Full Running Workout

**Priority:** P1 - High  
**User Story:** US-2.1  
**Pre-conditions:** 
- User is logged in
- User is on Log screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Log tab | Log screen loads with workout type selector |
| 2 | Select "Running" workout type | Form shows distance and duration fields |
| 3 | Enter distance: `5.5` km | Field accepts decimal value |
| 4 | Enter duration: `35` minutes | Field accepts integer value |
| 5 | Select date/time (defaults to now) | DateTime picker works, defaults to current time |
| 6 | Enter optional notes: `Morning run in park` | Notes field accepts text |
| 7 | Click "Save" button | Loading state, then success |
| 8 | Verify save confirmation | Toast: "Running workout logged!" |
| 9 | Navigate to Home screen | Recent activity shows new workout with details |

**Post-conditions:**
- Workout saved with all fields
- Stats updated (weekly summary, personal records check)

**Success Criteria:**
- All fields saved correctly
- Decimal distance values supported
- Optional notes saved when provided

---

### E2E-LOG-03: Log Strength Workout (Squats)

**Priority:** P1 - High  
**User Story:** US-2.2  
**Pre-conditions:** 
- User is on Log screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select "Squats" workout type | Form shows reps and sets fields |
| 2 | Enter reps: `25` | Field accepts integer |
| 3 | Enter sets: `4` | Field accepts integer |
| 4 | Enter optional weight: `60` kg | Weight field accepts decimal |
| 5 | Click "Save" | Success confirmation |
| 6 | Verify workout saved | Workout appears in recent activity with reps/sets/weight |

**Post-conditions:**
- Strength workout saved
- Personal record checked (if reps > previous max)

**Success Criteria:**
- All strength fields saved correctly
- Optional weight field works
- Workout type correctly identified

---

### E2E-LOG-04: Workout Form Validation - Invalid Inputs

**Priority:** P1 - High  
**User Story:** US-2.1, US-2.2  
**Pre-conditions:** 
- User is on Log screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select Running, leave distance empty | Error on distance field when attempting save |
| 2 | Enter negative distance: `-5` | Error: "Please enter a valid distance (0-100 km)" |
| 3 | Enter unrealistic distance: `150` | Error or warning: "Please enter a valid distance (0-100 km)" |
| 4 | Enter zero duration: `0` | Error: "Please enter a valid duration (0-1440 min)" |
| 5 | Enter duration > 1440 min (24hrs): `1500` | Error: "Please enter a valid duration (0-1440 min)" |
| 6 | Select Squats, enter negative reps: `-10` | Error: "Please enter valid reps (1-1000)" |
| 7 | Enter reps > 1000: `1500` | Error: "Please enter valid reps (1-1000)" |
| 8 | Enter sets > 100: `150` | Error: "Please enter valid sets (1-100)" |
| 9 | Enter negative weight: `-20` | Error: "Please enter a valid weight (0-500 kg)" |
| 10 | Submit form with multiple errors | All errors display simultaneously, form not submitted |

**Post-conditions:**
- No workout saved
- Form retains invalid values for correction

**Success Criteria:**
- All validation rules enforced
- Inline errors display immediately
- Form submission prevented until valid

**Accessibility Check:**
- Errors announced to screen readers
- Invalid fields have `aria-invalid="true"`

---

### E2E-LOG-05: Delete Workout with Confirmation

**Priority:** P1 - High  
**User Story:** US-2.5  
**Pre-conditions:** 
- User has at least one logged workout
- User is on Home screen or Log screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to recent activity list | Workouts displayed |
| 2 | Swipe left on workout (or long-press) | Action menu appears with Edit/Delete |
| 3 | Click "Delete" | Confirmation dialog appears |
| 4 | Read warning message | Message: "Are you sure? This cannot be undone" |
| 5 | Click "Cancel" | Dialog closes, workout remains |
| 6 | Swipe and click "Delete" again | Dialog reappears |
| 7 | Click "Confirm Delete" | Workout removed from list |
| 8 | Verify deletion | Workout no longer appears in recent activity |
| 9 | Navigate to Calendar | Workout indicator removed from corresponding day |

**Post-conditions:**
- Workout deleted from AsyncStorage
- Stats recalculated (streak, weekly summary, PRs)

**Success Criteria:**
- Confirmation required before deletion
- Deletion is permanent
- UI updates immediately

---

### E2E-LOG-06: Delete Workout with Undo

**Priority:** P2 - Medium  
**User Story:** US-2.5  
**Pre-conditions:** 
- User has a logged workout

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Delete a workout (confirm deletion) | Workout removed, toast appears |
| 2 | Observe toast message | Toast: "Workout deleted" with "Undo" button |
| 3 | Click "Undo" within timeout (5s) | Workout restored to list |
| 4 | Verify restoration | Workout reappears in recent activity |
| 5 | Delete another workout | Toast appears |
| 6 | Wait for toast to auto-dismiss (5s) | Undo option disappears |
| 7 | Attempt to restore | No undo available (permanent deletion) |

**Post-conditions:**
- Workout restored if undo clicked
- Permanent deletion if undo not clicked

**Success Criteria:**
- Undo option available for 5 seconds
- Undo restores workout completely
- After timeout, deletion is permanent

---

### E2E-LOG-07: Form Pre-fills with Last Values

**Priority:** P2 - Medium  
**User Story:** US-2.3  
**Pre-conditions:** 
- User has previously logged a running workout (5km, 30min)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Log screen | Form loads |
| 2 | Select "Running" workout type | Distance and duration fields pre-fill |
| 3 | Verify pre-filled values | Distance: `5` (or last value), Duration: `30` (or last value) |
| 4 | Change values and save | New values saved |
| 5 | Open form again | Form now pre-fills with new values (most recent) |

**Post-conditions:**
- Form remembers user's last values

**Success Criteria:**
- Last values retrieved from storage
- Defaults used if no history exists
- Most recent workout values take precedence

---

### E2E-LOG-08: Log Workout with Future Date (Warning)

**Priority:** P2 - Medium  
**User Story:** US-2.1  
**Pre-conditions:** 
- User is on Log screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Select workout type | Form loads |
| 2 | Open date/time picker | Current date/time selected |
| 3 | Select tomorrow's date | Date updated to future date |
| 4 | Click "Save" | Warning dialog appears |
| 5 | Read warning | Message: "Workout date is in the future. Continue anyway?" |
| 6 | Click "Cancel" | Dialog closes, form remains |
| 7 | Change date back to today | Warning dismissed |
| 8 | Save with valid date | Workout saved successfully |

**Post-conditions:**
- Future dates allowed with explicit confirmation
- User warned about unusual date

**Success Criteria:**
- Future date detected
- Warning shown but allows override
- User can proceed with explicit confirmation

---

## Section 3: Navigation Flows

### E2E-NAV-01: Bottom Tab Navigation

**Priority:** P0 - Critical  
**User Story:** US-3.1, US-3.2  
**Pre-conditions:** 
- User is logged in

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify bottom tab bar visible | 5 tabs: Home, Log, Calendar, Achievements, Settings |
| 2 | Click "Home" tab | Home screen loads |
| 3 | Click "Log" tab | Log screen loads |
| 4 | Click "Calendar" tab | Calendar screen loads |
| 5 | Click "Achievements" tab | Achievements screen loads |
| 6 | Click "Settings" tab | Settings screen loads |
| 7 | Click active tab (already selected) | No change, screen remains (no error) |
| 8 | Rapidly click multiple tabs | App remains responsive, no crash |

**Post-conditions:**
- Navigation works smoothly between all tabs

**Success Criteria:**
- All tabs accessible
- Active tab visually indicated
- Navigation is instant (< 200ms)

**Accessibility Check:**
- Tabs have `accessibilityRole="tab"`
- Active tab announced to screen readers

---

### E2E-NAV-02: Deep Navigation from Home Screen

**Priority:** P1 - High  
**User Story:** US-2.3  
**Pre-conditions:** 
- User is on Home screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click Quick Action button on Home | Log screen opens with pre-selected workout type |
| 2 | Log a workout | Success, returns to Home |
| 3 | Click "View All" or similar on recent activity | Log screen or History screen opens |
| 4 | Click on a stat card (e.g., streak) | Navigate to Achievements or Stats screen |
| 5 | Use browser back button | Navigates back through history correctly |

**Post-conditions:**
- Deep links work from Home screen
- Back navigation works correctly

**Success Criteria:**
- Quick actions navigate correctly
- Back button respects navigation stack
- No broken links or 404s

---

### E2E-NAV-03: Navigation with Unsaved Changes

**Priority:** P2 - Medium  
**User Story:** US-2.1  
**Pre-conditions:** 
- User is on Log screen with partially filled form

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter some form values | Fields populated |
| 2 | Click different tab (e.g., Calendar) | Warning dialog or auto-save behavior |
| 3 | Verify behavior | Either: (a) Warning "Unsaved changes will be lost" OR (b) Auto-save draft |
| 4 | Click "Stay" (if warning shown) | Remain on Log screen |
| 5 | Click "Leave" (if warning shown) | Navigate away, changes discarded |

**Post-conditions:**
- User informed of unsaved changes
- No accidental data loss

**Success Criteria:**
- User warned before losing unsaved data
- Navigation doesn't silently discard input

---

## Section 4: Calendar Flows

### E2E-CAL-01: Calendar View - Current Month

**Priority:** P1 - High  
**User Story:** US-3.1  
**Pre-conditions:** 
- User has logged workouts on various dates
- User is on Calendar screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify calendar displays current month | Month/year header correct |
| 2 | Verify days with workouts have indicators | Dots or markers on days with workouts |
| 3 | Verify indicator intensity | Multiple workouts = more/bigger indicators |
| 4 | Verify current day highlighted | Today's date has distinct highlight |
| 5 | Verify weekday headers | Sun, Mon, Tue, Wed, Thu, Fri, Sat |
| 6 | Verify grid layout | 7 columns, 5-6 rows (standard calendar) |

**Post-conditions:**
- Calendar accurately reflects workout history

**Success Criteria:**
- Workout indicators accurate
- Current day clearly marked
- Grid layout correct

**Accessibility Check:**
- Calendar navigable via keyboard
- Day cells announce date and workout count

---

### E2E-CAL-02: Calendar Month Navigation

**Priority:** P1 - High  
**User Story:** US-3.1  
**Pre-conditions:** 
- User is on Calendar screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Previous Month" arrow | Calendar updates to previous month |
| 2 | Verify month/year updated | Header shows previous month |
| 3 | Click "Next Month" arrow | Calendar returns to original month |
| 4 | Click "Next Month" again | Calendar shows next month |
| 5 | Click "Today" button | Calendar jumps to current month |
| 6 | Navigate to month with no workouts | Empty state or no indicators |
| 7 | Swipe gesture (if supported) | Month changes with swipe |

**Post-conditions:**
- Month navigation works correctly
- Workout indicators update for visible month

**Success Criteria:**
- Navigation buttons responsive
- "Today" button works
- Swipe gestures smooth (if implemented)

---

### E2E-CAL-03: Day Detail View

**Priority:** P1 - High  
**User Story:** US-3.1  
**Pre-conditions:** 
- User is on Calendar screen
- Selected day has at least one workout

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click on a day with workouts | Day detail modal opens |
| 2 | Verify date header | Modal shows selected date |
| 3 | Verify workout list | All workouts for that day displayed |
| 4 | Verify workout details | Type, time, metrics visible for each workout |
| 5 | Click on a workout | Workout detail view or edit option |
| 6 | Click "Add Workout" in modal | Log screen opens with date pre-selected |
| 7 | Click close button or outside modal | Modal closes, returns to calendar |

**Post-conditions:**
- Day detail shows accurate workout list

**Success Criteria:**
- Modal opens on day click
- All workouts for day displayed
- Can add workout for selected day

---

### E2E-CAL-04: Day Detail - Empty State

**Priority:** P2 - Medium  
**User Story:** US-3.1  
**Pre-conditions:** 
- User is on Calendar screen
- Selected day has no workouts

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click on a day with no workouts | Day detail modal opens |
| 2 | Verify empty state | Message: "No workouts logged for this day" |
| 3 | Verify CTA | "Log Workout" button visible |
| 4 | Click "Log Workout" | Navigate to Log screen with date pre-selected |

**Post-conditions:**
- Empty state helpful and actionable

**Success Criteria:**
- Empty state displays for days without workouts
- CTA encourages logging

---

## Section 5: Statistics & Achievements

### E2E-STAT-01: Weekly Summary Stats

**Priority:** P1 - High  
**User Story:** US-4.1  
**Pre-conditions:** 
- User has logged workouts in current week
- User is on Home or Stats screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Stats section | Stats dashboard loads |
| 2 | Verify weekly summary card | Shows total workouts for current week |
| 3 | Verify total duration | Sum of all workout durations |
| 4 | Verify breakdown by type | Count per workout type (running, squats, etc.) |
| 5 | Verify week dates | Shows date range for current week |
| 6 | Log a new workout | Stats update immediately |
| 7 | Verify stats recalculation | Weekly summary includes new workout |

**Post-conditions:**
- Stats accurately reflect current week

**Success Criteria:**
- Calculations accurate
- Stats update in real-time
- Breakdown by type correct

---

### E2E-STAT-02: Personal Records Display

**Priority:** P1 - High  
**User Story:** US-4.2  
**Pre-conditions:** 
- User has logged multiple workouts

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Stats screen | Personal records section visible |
| 2 | Verify PRs for each exercise type | Best performance shown for running, squats, pushups, pullups |
| 3 | Verify PR includes date | Date achieved displayed |
| 4 | Log a workout that beats a PR | New PR detected |
| 5 | Verify PR celebration | "New Personal Record!" badge or animation |
| 6 | Verify PR updated | Stats screen shows new record |

**Post-conditions:**
- PRs accurately tracked
- New PRs celebrated

**Success Criteria:**
- PRs calculated correctly
- New PRs flagged immediately
- Celebration shown for new PRs

---

### E2E-STAT-03: Streak Tracking

**Priority:** P1 - High  
**User Story:** US-4.4  
**Pre-conditions:** 
- User has worked out on consecutive days

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to Stats or Home screen | Streak tracker visible |
| 2 | Verify current streak | Shows number of consecutive days |
| 3 | Verify longest streak | Shows historical best streak |
| 4 | Log workout on next day (consecutive) | Streak increments |
| 5 | Verify streak updated | Current streak +1 |
| 6 | Simulate missed day (change date or wait) | Streak resets to 0 |
| 7 | Verify streak reset | Current streak shows 0, longest streak preserved |

**Post-conditions:**
- Streak accurately tracked
- Resets correctly on missed day

**Success Criteria:**
- Consecutive days counted correctly
- Streak resets after missed day
- Longest streak preserved

---

### E2E-ACH-01: Achievement Unlock - First Workout

**Priority:** P1 - High  
**User Story:** US-5.1  
**Pre-conditions:** 
- User has no previous workouts
- User is about to log first workout

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log first workout | Workout saved |
| 2 | Wait for achievement check | Achievement notification appears |
| 3 | Verify achievement | "First Step" achievement unlocked |
| 4 | Verify celebration | Toast or modal with achievement details |
| 5 | Navigate to Achievements screen | Achievement shows as unlocked with date |

**Post-conditions:**
- Achievement unlocked and saved
- Progress tracked

**Success Criteria:**
- Achievement detected automatically
- Celebration shown
- Achievement persists

---

### E2E-ACH-02: Achievement Unlock - Streak Milestone

**Priority:** P2 - Medium  
**User Story:** US-5.1  
**Pre-conditions:** 
- User has 2-day streak
- User is about to log workout on day 3

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log workout on day 3 (consecutive) | Workout saved |
| 2 | Wait for achievement check | "On Fire" achievement unlocked (3-day streak) |
| 3 | Verify celebration | Achievement notification appears |
| 4 | Navigate to Achievements | Streak achievements show progress/unlocked |

**Post-conditions:**
- Streak achievement unlocked

**Success Criteria:**
- Streak-based achievements trigger correctly
- Progress toward locked achievements shown

---

### E2E-ACH-03: Achievement Gallery View

**Priority:** P2 - Medium  
**User Story:** US-5.2  
**Pre-conditions:** 
- User is on Achievements screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify achievement list | All achievements displayed (unlocked and locked) |
| 2 | Verify unlocked achievements | Show icon, title, description, unlock date |
| 3 | Verify locked achievements | Grayscale, show progress toward unlock |
| 4 | Click filter (All/Unlocked/Locked) | List filters correctly |
| 5 | Click category filter (Consistency/Streak/Exercise) | List filters by category |
| 6 | Click on locked achievement | Detail shows requirements to unlock |
| 7 | Click on unlocked achievement | Detail shows full info, maybe share option |

**Post-conditions:**
- Achievement gallery displays correctly

**Success Criteria:**
- Locked/unlocked clearly differentiated
- Filters work correctly
- Progress shown for locked achievements

---

## Section 6: Error States & Recovery

### E2E-ERR-01: Network Error - Offline Mode

**Priority:** P1 - High  
**User Story:** US-6.1  
**Pre-conditions:** 
- User is logged in
- Browser set to offline mode

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify offline indicator | "Offline" or network icon shows |
| 2 | Log a workout | Form works normally |
| 3 | Save workout | Success toast: "Saved locally. Will sync when online" |
| 4 | Verify workout appears | Workout in recent activity |
| 5 | Verify sync queue | Workout marked as pending sync (internal) |
| 6 | Restore network connection | Offline indicator disappears |
| 7 | Trigger sync (automatic or manual) | Sync completes, workout marked synced |

**Post-conditions:**
- Workout saved locally while offline
- Syncs when online restored

**Success Criteria:**
- App fully functional offline
- User informed of offline status
- Sync happens automatically when online

---

### E2E-ERR-02: Storage Error - Recovery

**Priority:** P2 - Medium  
**User Story:** US-7.3  
**Pre-conditions:** 
- Simulate storage failure (mock or corrupt)

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Attempt to save workout | Storage error occurs |
| 2 | Verify error handling | Error toast: "Failed to save. Please try again" |
| 3 | Form retains data | User input preserved |
| 4 | Click "Retry" | Save attempted again |
| 5 | Verify success (if retry works) | Workout saved |
| 6 | If retry fails | Option to copy data or contact support |

**Post-conditions:**
- No data loss
- User can retry or recover

**Success Criteria:**
- Graceful error handling
- Data preserved for retry
- Clear recovery options

---

### E2E-ERR-03: App Crash Recovery

**Priority:** P2 - Medium  
**User Story:** US-7.3  
**Pre-conditions:** 
- None

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Force close browser tab | Tab closes |
| 2 | Reopen app | App loads from last known state |
| 3 | Verify session | User still logged in (if session was active) |
| 4 | Verify unsaved data | Unsaved form data may be lost (expected) |
| 5 | Verify saved data | All saved workouts present |

**Post-conditions:**
- App recovers gracefully
- Saved data intact

**Success Criteria:**
- No corruption from crash
- Session persists
- Saved data not lost

---

### E2E-ERR-04: Validation Error Recovery

**Priority:** P2 - Medium  
**User Story:** US-7.3  
**Pre-conditions:** 
- User is on Log screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter invalid data in multiple fields | Multiple validation errors |
| 2 | Observe error display | All errors shown inline |
| 3 | Fix one field, leave others invalid | Fixed field error clears, others remain |
| 4 | Fix all errors | All errors clear, form submittable |
| 5 | Submit valid form | Workout saved successfully |

**Post-conditions:**
- Form validation works correctly
- Errors clear when fixed

**Success Criteria:**
- All errors shown simultaneously
- Errors clear individually as fixed
- Form submittable when all valid

---

## Section 7: Accessibility Flows

### E2E-ACC-01: Screen Reader Navigation - Login

**Priority:** P1 - High  
**User Story:** US-1.1, US-1.2  
**Pre-conditions:** 
- Screen reader enabled (ChromeVox or similar)
- User is on Login screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tab through form | Focus order: Email → Password → Login button → Register link |
| 2 | Verify labels announced | "Email address", "Password", "Login button" |
| 3 | Enter invalid credentials | Error announced: "Invalid email or password" |
| 4 | Verify error announcement | Error has `role="alert"` or `aria-live="assertive"` |

**Post-conditions:**
- Screen reader can navigate entire flow

**Success Criteria:**
- All elements labeled
- Errors announced
- Logical focus order

---

### E2E-ACC-02: Keyboard Navigation

**Priority:** P1 - High  
**User Story:** US-7.1  
**Pre-conditions:** 
- User is on any screen

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Press Tab | Focus moves to next interactive element |
| 2 | Press Shift+Tab | Focus moves to previous element |
| 3 | Press Enter on focused button | Button activates |
| 4 | Press Escape on modal | Modal closes |
| 5 | Navigate entire app with keyboard only | All features accessible without mouse |

**Post-conditions:**
- Full keyboard accessibility

**Success Criteria:**
- All interactive elements focusable
- Focus visible (outline)
- No keyboard traps

---

### E2E-ACC-03: Color Contrast

**Priority:** P2 - Medium  
**User Story:** US-7.1  
**Pre-conditions:** 
- App loaded

**Test Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Verify text contrast | All text meets 4.5:1 contrast ratio |
| 2 | Verify UI element contrast | Buttons, icons meet 3:1 contrast |
| 3 | Verify error states | Error text/icons clearly visible |
| 4 | Use contrast checker tool | All elements pass WCAG 2.1 AA |

**Post-conditions:**
- All elements meet contrast requirements

**Success Criteria:**
- Text: 4.5:1 minimum
- UI components: 3:1 minimum
- No reliance on color alone

---

## Section 8: Performance Scenarios

### E2E-PERF-01: App Launch Time

**Priority:** P1 - High  
**ASR:** ASR-PERF-02  
**Pre-conditions:** 
- Browser cache cleared

**Test Steps:**

| Step | Action | Expected Result | Target |
|------|--------|-----------------|--------|
| 1 | Navigate to app URL | App begins loading | - |
| 2 | Measure time to interactive | Home screen or Login screen usable | < 3 seconds |
| 3 | Verify splash screen | Shows during load (if implemented) | - |

**Success Criteria:**
- App launches in < 3 seconds on mid-range devices

---

### E2E-PERF-02: Workout Log Performance (CRITICAL)

**Priority:** P0 - Critical  
**ASR:** ASR-PERF-01  
**Pre-conditions:** 
- User is on Home screen

**Test Steps:**

| Step | Action | Expected Result | Target |
|------|--------|-----------------|--------|
| 1 | Start timer | - | - |
| 2 | Click Quick Action | Form opens | < 0.5s |
| 3 | Review pre-filled values | Values visible | 3-5s (user) |
| 4 | Click Save | Workout saved | < 0.5s |
| 5 | Stop timer on confirmation | Success visible | < 0.3s |
| 6 | **Total time** | **Complete flow** | **< 10 seconds** |

**Success Criteria:**
- **CRITICAL: Total time < 10 seconds** (95th percentile)

---

### E2E-PERF-03: Large Dataset Performance

**Priority:** P2 - Medium  
**ASR:** ASR-PERF-03  
**Pre-conditions:** 
- User has 100+ workouts in history

**Test Steps:**

| Step | Action | Expected Result | Target |
|------|--------|-----------------|--------|
| 1 | Navigate to Calendar | Calendar renders | < 500ms |
| 2 | Navigate to History list | List scrolls smoothly | 60 FPS |
| 3 | Scroll through 100+ items | No lag or jank | - |
| 4 | Navigate to Stats | Stats calculate | < 100ms |

**Success Criteria:**
- Smooth scroll at 60 FPS
- No UI blocking with large datasets

---

## Data Requirements

### Test Users

| User | Email | Password | Purpose |
|------|-------|----------|---------|
| **New User** | `testuser+new@example.com` | `TestPass123` | Registration tests |
| **Existing User** | `testuser+existing@example.com` | `TestPass123` | Login, workout tests |
| **Streak User** | `testuser+streak@example.com` | `TestPass123` | Streak tests (pre-seeded with 5-day streak) |
| **PR User** | `testuser+pr@example.com` | `TestPass123` | PR tests (pre-seeded with workout history) |
| **Empty User** | `testuser+empty@example.com` | `TestPass123` | Empty state tests (no workouts) |

### Sample Workouts

| Workout Type | Sample Data | Purpose |
|--------------|-------------|---------|
| **Running** | 5km, 30min | Standard running workout |
| **Running (PR)** | 10km, 55min | Personal record distance |
| **Squats** | 25 reps, 4 sets, 60kg | Standard strength workout |
| **Squats (PR)** | 50 reps, 5 sets, 80kg | Personal record reps |
| **Pushups** | 30 reps, 3 sets | Bodyweight exercise |
| **Pullups** | 15 reps, 4 sets | Bodyweight exercise |

### Test Data Setup Script

```javascript
// Seed test data before running E2E tests
async function seedTestData() {
  // Create test users
  await createUser('testuser+existing@example.com', 'TestPass123', {
    workouts: [
      { type: 'running', distance: 5, duration: 30, date: '2026-03-15' },
      { type: 'squats', reps: 25, sets: 4, weight: 60, date: '2026-03-16' },
    ]
  });

  // Create streak user (5 consecutive days)
  await createUser('testuser+streak@example.com', 'TestPass123', {
    workouts: [
      { type: 'running', distance: 3, duration: 20, date: '2026-03-11' },
      { type: 'squats', reps: 20, sets: 3, date: '2026-03-12' },
      { type: 'pushups', reps: 15, sets: 3, date: '2026-03-13' },
      { type: 'running', distance: 5, duration: 30, date: '2026-03-14' },
      { type: 'pullups', reps: 10, sets: 3, date: '2026-03-15' },
    ]
  });
}
```

---

## Test Execution Schedule

| Phase | Scenarios | Duration | Owner |
|-------|-----------|----------|-------|
| **Phase 1** | E2E-AUTH-01 to E2E-AUTH-07 | 2 days | @ui-tester |
| **Phase 2** | E2E-LOG-01 to E2E-LOG-08 | 3 days | @ui-tester |
| **Phase 3** | E2E-NAV-01 to E2E-CAL-04 | 2 days | @ui-tester |
| **Phase 4** | E2E-STAT-01 to E2E-ACH-03 | 2 days | @ui-tester |
| **Phase 5** | E2E-ERR-01 to E2E-ACC-03 | 2 days | @ui-tester |
| **Phase 6** | E2E-PERF-01 to E2E-PERF-03 | 1 day | @ui-tester |

**Total Estimated Duration:** 12 days

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Test Coverage** | 90% of critical flows | % of P0/P1 scenarios automated |
| **Pass Rate** | 95% | % of tests passing consistently |
| **Performance** | < 10s quick log | 95th percentile timing |
| **Accessibility** | WCAG 2.1 AA | All ACC tests passing |
| **Error Recovery** | 100% | All error scenarios handled |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Flaky tests due to timing | Medium | Use explicit waits, avoid fixed delays |
| Test data contamination | Medium | Clear/reset data between test runs |
| Browser compatibility | Low | Test on Chrome (primary), document issues |
| Performance variance | Medium | Run performance tests multiple times, use median |
| Accessibility tool limitations | Low | Use multiple tools (ChromeVox, axe, manual) |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-17 | Product Team | Initial E2E test plan |

---

**Next Steps:**
1. Review and approve test plan
2. Set up E2E test framework (Playwright or Cypress recommended for web)
3. Implement test data seeding scripts
4. Begin Phase 1 implementation (Authentication tests)
5. Integrate with CI/CD pipeline for automated execution

**Approval Required:**
- [ ] Product Owner review
- [ ] Engineering Lead review
- [ ] QA Lead review
