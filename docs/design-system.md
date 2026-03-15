# Trapp Tracker - Design System

**Version:** 1.0  
**Last Updated:** March 15, 2026  
**Platform:** React Native + Expo (iOS, Android, Web)

---

## 1. Design Philosophy

### Core Principles

| Principle | Description | Application |
|-----------|-------------|-------------|
| **Speed First** | Every interaction optimized for <10 second workout logging | Minimize taps, use defaults, progressive disclosure |
| **Motivational** | Design that celebrates progress and encourages consistency | Bright accents, celebration states, visible streaks |
| **Accessible** | WCAG 2.1 AA compliance for all users | High contrast, large touch targets, screen reader support |
| **Consistent** | Unified experience across iOS, Android, Web | Shared components, platform-adaptive patterns |
| **Forgiving** | Clear error states and easy recovery | Helpful messages, undo options, no dead ends |

### Brand Personality

```
┌─────────────────────────────────────────────────────────┐
│                    TRAPP TRACKER                        │
│                                                         │
│   Energetic ─────●─────────────── Calm                  │
│   (Motivating without being aggressive)                 │
│                                                         │
│   Simple ────────●─────────────── Complex               │
│   (Clear hierarchy, minimal cognitive load)             │
│                                                         │
│   Friendly ──────●─────────────── Formal                │
│   (Encouraging, non-judgmental tone)                    │
│                                                         │
│   Bold ──────────●─────────────── Subtle               │
│   (Clear CTAs, confident visual weight)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Color Palette

### 2.1 Primary Colors

| Token | Hex | Usage | Contrast on White |
|-------|-----|-------|-------------------|
| `primary.50` | `#FEF3E2` | Light backgrounds | - |
| `primary.100` | `#FDE6C4` | Hover states, highlights | - |
| `primary.200` | `#FBC989` | Active states | - |
| `primary.300` | `#F9AD4E` | Secondary accents | - |
| `primary.400` | `#F79013` | Primary buttons (hover) | 2.8:1 |
| `primary.500` | `#F57300` | **Primary buttons, key actions** | 3.5:1 ✓ |
| `primary.600` | `#D65A00` | Pressed states | 4.2:1 ✓ |
| `primary.700` | `#A84500` | Dark theme primary | - |
| `primary.800` | `#7A3200` | Dark theme accents | - |
| `primary.900` | `#4C1F00` | Dark theme deep | - |

**Rationale:** Orange (`#F57300`) conveys energy, action, and motivation without the aggression of red. It's associated with enthusiasm and determination—perfect for fitness tracking.

### 2.2 Secondary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `secondary.50` | `#E8F5E9` | Success backgrounds |
| `secondary.100` | `#C8E6C9` | Success light |
| `secondary.200` | `#A5D6A7` | Success indicators |
| `secondary.300` | `#81C784` | Success medium |
| `secondary.400` | `#66BB6A` | Success buttons (hover) |
| `secondary.500` | `#4CAF50` | **Success actions, positive feedback** |
| `secondary.600` | `#43A047` | Success pressed |
| `secondary.700` | `#388E3C` | Dark theme success |

### 2.3 Semantic Colors

| Token | Hex | Usage | WCAG on White |
|-------|-----|-------|---------------|
| `success.main` | `#2E7D32` | Success states, completed | 4.6:1 ✓ |
| `success.light` | `#E8F5E9` | Success backgrounds | - |
| `error.main` | `#C62828` | Errors, destructive actions | 4.8:1 ✓ |
| `error.light` | `#FFEBEE` | Error backgrounds | - |
| `warning.main` | `#F57C00` | Warnings, cautions | 3.9:1 ✓ |
| `warning.light` | `#FFF3E0` | Warning backgrounds | - |
| `info.main` | `#1565C0` | Information, tips | 4.5:1 ✓ |
| `info.light` | `#E3F2FD` | Info backgrounds | - |

### 2.4 Neutral Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral.0` | `#FFFFFF` | Backgrounds, cards |
| `neutral.50` | `#FAFAFA` | Alternate backgrounds |
| `neutral.100` | `#F5F5F5` | Borders, dividers |
| `neutral.200` | `#EEEEEE` | Disabled states |
| `neutral.300` | `#E0E0E0` | Placeholder text |
| `neutral.400` | `#BDBDBD` | Secondary icons |
| `neutral.500` | `#9E9E9E` | Secondary text |
| `neutral.600` | `#757575` | Body text (secondary) |
| `neutral.700` | `#616161` | Body text (primary) |
| `neutral.800` | `#424242` | Headings |
| `neutral.900` | `#212121` | **Primary text, high emphasis** |

### 2.5 Workout Type Colors

| Workout | Color | Hex | Icon Background |
|---------|-------|-----|-----------------|
| Running | `running` | `#FF6B35` | `#FFF0EB` |
| Squats | `squats` | `#9C27B0` | `#F3E5F5` |
| Pushups | `pushups` | `#2196F3` | `#E3F2FD` |
| Pullups | `pullups` | `#4CAF50` | `#E8F5E9` |

### 2.6 Dark Theme Colors

| Token | Light Mode | Dark Mode |
|-------|------------|-----------|
| `background.primary` | `#FFFFFF` | `#121212` |
| `background.secondary` | `#F5F5F5` | `#1E1E1E` |
| `background.elevated` | `#FFFFFF` | `#2C2C2C` |
| `text.primary` | `#212121` | `#FFFFFF` |
| `text.secondary` | `#757575` | `#B0B0B0` |
| `text.disabled` | `#9E9E9E` | `#6B6B6B` |
| `border.default` | `#E0E0E0` | `#424242` |

---

## 3. Typography

### 3.1 Font Family

**Primary Font:** System San-Serif (platform native)

```javascript
// React Native Implementation
const typography = {
  fontFamily: {
    primary: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    heading: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      web: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'Roboto Mono',
      web: 'ui-monospace, SFMono-Regular, "SF Mono", monospace',
    }),
  },
};
```

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `display` | 32px / 2rem | 700 (Bold) | 40px / 2.5rem | -0.5px | Hero text, big numbers |
| `h1` | 28px / 1.75rem | 700 (Bold) | 36px / 2.25rem | -0.5px | Screen titles |
| `h2` | 24px / 1.5rem | 600 (SemiBold) | 32px / 2rem | -0.25px | Section headers |
| `h3` | 20px / 1.25rem | 600 (SemiBold) | 28px / 1.75rem | 0 | Card titles |
| `h4` | 18px / 1.125rem | 600 (SemiBold) | 24px / 1.5rem | 0 | Subsection headers |
| `body.large` | 18px / 1.125rem | 400 (Regular) | 28px / 1.75rem | 0 | Emphasized body |
| `body.default` | 16px / 1rem | 400 (Regular) | 24px / 1.5rem | 0 | **Body text, inputs** |
| `body.small` | 14px / 0.875rem | 400 (Regular) | 20px / 1.25rem | 0.1px | Captions, labels |
| `caption` | 12px / 0.75rem | 400 (Regular) | 16px / 1rem | 0.2px | Helper text, timestamps |
| `overline` | 11px / 0.6875rem | 600 (SemiBold) | 16px / 1rem | 1px | Labels, tags |

### 3.3 Typography Hierarchy Example

```
┌─────────────────────────────────────────┐
│  Trapp Tracker                    [h1]  │
│                                         │
│  Welcome back, Chris!            [h3]   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  This Week               [h4]   │   │
│  │                                 │   │
│  │  5 Workouts              [body] │   │
│  │  Keep up the momentum!   [body] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Last workout: 2 hours ago      [caption]│
└─────────────────────────────────────────┘
```

### 3.4 Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Emphasized text, active states |
| SemiBold | 600 | Headings, buttons, labels |
| Bold | 700 | Display text, important numbers |

---

## 4. Spacing System

### 4.1 Base Scale (4px Grid)

All spacing uses a 4px base unit for consistency and alignment.

| Token | Value | Usage |
|-------|-------|-------|
| `space.1` | 4px | Tight spacing, icon gaps |
| `space.2` | 8px | Inline element spacing |
| `space.3` | 12px | Form field spacing |
| `space.4` | 16px | **Default padding, component gaps** |
| `space.5` | 20px | Section spacing |
| `space.6` | 24px | Card padding, modal padding |
| `space.8` | 32px | Section margins |
| `space.10` | 40px | Large section gaps |
| `space.12` | 48px | Page margins |
| `space.16` | 64px | Major section dividers |

### 4.2 Component Spacing Patterns

```
┌─────────────────────────────────────────┐
│  space.6 (24px)                         │
│  ┌─────────────────────────────────┐   │
│  │  space.4 (16px)                 │   │
│  │  ┌─────────────────────────┐   │   │
│  │  │  Content               │   │   │
│  │  └─────────────────────────┘   │   │
│  │  space.4 (16px)                 │   │
│  └─────────────────────────────────┘   │
│  space.6 (24px)                         │
└─────────────────────────────────────────┘
```

### 4.3 Layout Spacing

| Element | Top | Right | Bottom | Left |
|---------|-----|-------|--------|------|
| Screen padding | 16px | 16px | 16px | 16px |
| Card padding | 16px | 16px | 16px | 16px |
| Modal padding | 24px | 24px | 24px | 24px |
| Button padding (vertical) | 14px | - | 14px | - |
| Button padding (horizontal) | - | 24px | - | 24px |
| List item padding | 12px | 16px | 12px | 16px |

---

## 5. Component Specifications

### 5.1 Buttons

#### Primary Button

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌─────────────────────┐         │
│         │   Save Workout      │         │
│         │   (44px height)     │         │
│         └─────────────────────┘         │
│                                         │
│   Background: primary.500 (#F57300)     │
│   Text: White (#FFFFFF)                 │
│   Font: body.default, SemiBold          │
│   Border Radius: 8px                    │
│   Min Width: 120px                      │
│   Min Height: 44px (touch target)       │
│                                         │
└─────────────────────────────────────────┘
```

**States:**

| State | Background | Text | Elevation |
|-------|------------|------|-----------|
| Default | `primary.500` | `#FFFFFF` | 2 |
| Hover | `primary.400` | `#FFFFFF` | 4 |
| Pressed | `primary.600` | `#FFFFFF` | 1 |
| Disabled | `neutral.300` | `neutral.500` | 0 |
| Loading | `primary.500` | Transparent | 2 |

#### Secondary Button

| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | Transparent | `neutral.300` | `neutral.700` |
| Hover | `neutral.50` | `neutral.400` | `neutral.800` |
| Pressed | `neutral.100` | `neutral.400` | `neutral.800` |
| Disabled | Transparent | `neutral.200` | `neutral.400` |

#### Tertiary Button (Text Button)

| State | Background | Text |
|-------|------------|------|
| Default | Transparent | `primary.500` |
| Hover | `primary.50` | `primary.600` |
| Pressed | `primary.100` | `primary.700` |
| Disabled | Transparent | `neutral.400` |

#### Button Sizes

| Size | Height | Padding-X | Font |
|------|--------|-----------|------|
| Small | 36px | 16px | body.small |
| Medium | 44px | 24px | body.default |
| Large | 52px | 32px | body.large |

### 5.2 Input Fields

```
┌─────────────────────────────────────────┐
│                                         │
│  Distance (km)                    [label]│
│  ┌─────────────────────────────────┐   │
│  │ 5.0                             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  States:                                │
│  - Default: border neutral.300          │
│  - Focus: border primary.500, 2px       │
│  - Error: border error.main, 2px        │
│  - Disabled: bg neutral.50, text neutral.500│
│                                         │
└─────────────────────────────────────────┘
```

**Input Specifications:**

| Property | Value |
|----------|-------|
| Height | 48px (minimum touch target) |
| Border Radius | 8px |
| Border Width | 1px (default), 2px (focus/error) |
| Padding | 14px horizontal |
| Font | body.default (16px) |
| Label | body.small, neutral.600, 8px above input |
| Helper Text | caption, neutral.500, 4px below input |
| Error Text | caption, error.main, 4px below input |

**Validation States:**

| State | Border | Helper Text | Icon |
|-------|--------|-------------|------|
| Default | `neutral.300` | - | - |
| Focus | `primary.500` | - | - |
| Valid | `success.main` | "Looks good!" (success.light bg) | ✓ |
| Error | `error.main` | "Please enter a valid value" | ! |
| Disabled | `neutral.200` | - | - |

### 5.3 Cards

#### Workout Card

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐ │
│  │ 🏃 Running                        │ │
│  │                                   │ │
│  │ 5.0 km • 30 min                   │ │
│  │ March 15, 2026 • 7:30 AM          │ │
│  │                                   │ │
│  │ Morning run in the park           │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Specifications:                        │
│  - Padding: 16px                        │
│  - Border Radius: 12px                  │
│  - Background: neutral.0                │
│  - Elevation: 2 (default), 4 (hover)    │
│  - Border: 1px neutral.100              │
└─────────────────────────────────────────┘
```

#### Stat Card

```
┌─────────────────────────────────────────┐
│  ┌──────────────┐ ┌──────────────┐     │
│  │    5         │ │   12.5km     │     │
│  │  Workouts    │ │   Total      │     │
│  └──────────────┘ └──────────────┘     │
│                                         │
│  Specifications:                        │
│  - Min Width: 140px                     │
│  - Padding: 20px                        │
│  - Border Radius: 12px                  │
│  - Background: primary.50 (light tint)  │
└─────────────────────────────────────────┘
```

#### Achievement Card

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐ │
│  │  🏆              Committed        │ │
│  │                                   │ │
│  │  Logged 10 workouts               │ │
│  │                                   │ │
│  │  ████████░░░░░░░░  10/10          │ │
│  │                                   │ │
│  │  Unlocked: March 15, 2026         │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Locked State:                          │
│  - Opacity: 0.6                         │
│  - Icon: Grayscale                      │
│  - Show: "5/10 workouts" progress       │
└─────────────────────────────────────────┘
```

### 5.4 Lists

#### Workout List Item

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐ │
│  │ 🏃  Running           Mar 15     │ │
│  │     5.0 km • 30 min    7:30 AM   │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │ 🏋️  Squats            Mar 14     │ │
│  │     3 sets × 15 reps   6:00 PM   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Specifications:                        │
│  - Height: 72px minimum                 │
│  - Padding: 12px vertical, 16px horiz.  │
│  - Border Bottom: 1px neutral.100       │
│  - Icon: 40×40px container              │
└─────────────────────────────────────────┘
```

### 5.5 Navigation

#### Tab Bar

```
┌─────────────────────────────────────────┐
│                                         │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ 🏠  │ │ 📅  │ │ 📊  │ │ 🏆  │      │
│  │Home │ │Cal. │ │Stats│ │Achv.│      │
│  └─────┘ └─────┘ └─────┘ └─────┘      │
│     ●                                   │
│  (active indicator)                     │
│                                         │
│  Specifications:                        │
│  - Height: 80px (with safe area)        │
│  - Icon Size: 24×24px                   │
│  - Label: caption (11px)                │
│  - Active: primary.500                  │
│  - Inactive: neutral.500                │
│  - Touch Target: 48×48px per tab        │
└─────────────────────────────────────────┘
```

#### Header

```
┌─────────────────────────────────────────┐
│  ←  Trapp Tracker             [⚙️]      │
│                                         │
│  Specifications:                        │
│  - Height: 56px (standard)              │
│  - Padding: 16px horizontal             │
│  - Title: h2 (24px, SemiBold)           │
│  - Back Button: 44×44px touch target    │
│  - Elevation: 2 (on scroll)             │
└─────────────────────────────────────────┘
```

### 5.6 Feedback Components

#### Toast/Snackbar

```
┌─────────────────────────────────────────┐
│                                         │
│     ┌─────────────────────────────┐    │
│     │ ✓ Workout saved!       [×]  │    │
│     └─────────────────────────────┘    │
│                                         │
│  Specifications:                        │
│  - Position: Bottom, 16px from edge     │
│  - Height: 48px minimum                 │
│  - Background: neutral.900 (dark)       │
│  - Text: White                          │
│  - Border Radius: 8px                   │
│  - Duration: 3 seconds auto-dismiss     │
│  - Animation: Slide up, fade out        │
└─────────────────────────────────────────┘
```

#### Modal

```
┌─────────────────────────────────────────┐
│  ╔═══════════════════════════════════╗ │
│  ║  ┌─────────────────────────────┐  ║ │
│  ║  │   🎉 Achievement Unlocked!  │  ║ │
│  ║  │                             │  ║ │
│  ║  │   Committed                 │  ║ │
│  ║  │   Logged 10 workouts        │  ║ │
│  ║  │                             │  ║ │
│  ║  │  [Share]  [Awesome!]       │  ║ │
│  ║  └─────────────────────────────┘  ║ │
│  ╚═══════════════════════════════════╝ │
│                                         │
│  Specifications:                        │
│  - Padding: 24px                        │
│  - Border Radius: 16px                  │
│  - Max Width: 320px                     │
│  - Backdrop: Black 50% opacity          │
│  - Animation: Scale up + fade in        │
└─────────────────────────────────────────┘
```

#### Progress Bar

```
┌─────────────────────────────────────────┐
│                                         │
│  10 workouts                           │
│  ━━━━━━━━━━━━░░░░░░░░  62%             │
│                                         │
│  Specifications:                        │
│  - Height: 8px                          │
│  - Border Radius: 4px                   │
│  - Track: neutral.200                   │
│  - Fill: primary.500                    │
│  - Animation: Smooth width transition   │
└─────────────────────────────────────────┘
```

---

## 6. Icon Guidelines

### 6.1 Icon Library

**Primary:** Material Community Icons via `@expo/vector-icons`

```javascript
import { MaterialCommunityIcons } from '@expo/vector-icons';
```

### 6.2 Icon Sizes

| Size | Value | Usage |
|------|-------|-------|
| Small | 16×16px | Inline with text, captions |
| Medium | 20×20px | List items, buttons |
| Large | 24×24px | Tab bar, headers |
| X-Large | 32×32px | Feature cards |
| XX-Large | 48×48px | Empty state illustrations |

### 6.3 Workout Type Icons

| Workout | Icon Name | Color |
|---------|-----------|-------|
| Running | `run` | `running` (#FF6B35) |
| Squats | `dumbbell` | `squats` (#9C27B0) |
| Pushups | `arm-flex` | `pushups` (#2196F3) |
| Pullups | `pull-up` | `pullups` (#4CAF50) |

### 6.4 Navigation Icons

| Tab | Icon Name | Active | Inactive |
|-----|-----------|--------|----------|
| Home | `home-outline` | primary.500 | neutral.500 |
| Calendar | `calendar-month-outline` | primary.500 | neutral.500 |
| Stats | `chart-line` | primary.500 | neutral.500 |
| Achievements | `trophy-outline` | primary.500 | neutral.500 |

### 6.5 Action Icons

| Action | Icon Name | Size |
|--------|-----------|------|
| Add/Create | `plus` | 24px |
| Edit | `pencil-outline` | 20px |
| Delete | `trash-can-outline` | 20px |
| Settings | `cog-outline` | 24px |
| Back | `arrow-left` | 24px |
| Close | `close` | 24px |
| Check | `check` | 20px |
| Error | `alert-circle-outline` | 20px |
| Share | `share-variant-outline` | 20px |

---

## 7. Elevation & Shadows

### 7.1 Elevation Scale

| Level | iOS Shadow | Android Elevation | Web Box-Shadow | Usage |
|-------|------------|-----------------|----------------|-------|
| 0 | None | 0 | None | Flat surfaces |
| 1 | 0 1px 2px rgba(0,0,0,0.1) | 1 | 0 1px 2px rgba(0,0,0,0.1) | Subtle separation |
| 2 | 0 2px 4px rgba(0,0,0,0.12) | 2 | 0 2px 4px rgba(0,0,0,0.12) | **Cards, default** |
| 3 | 0 4px 8px rgba(0,0,0,0.15) | 3 | 0 4px 8px rgba(0,0,0,0.15) | Floating elements |
| 4 | 0 6px 12px rgba(0,0,0,0.18) | 4 | 0 6px 12px rgba(0,0,0,0.18) | **Hover states** |
| 5 | 0 8px 16px rgba(0,0,0,0.2) | 5 | 0 8px 16px rgba(0,0,0,0.2) | Modals, dialogs |

### 7.2 Shadow Implementation

```javascript
// React Native StyleSheet
const shadows = {
  elevation1: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1, // Android
  },
  elevation2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  elevation4: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
```

---

## 8. Border Radius Standards

### 8.1 Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `radius.none` | 0px | Dividers, full-width elements |
| `radius.small` | 4px | Small buttons, chips |
| `radius.medium` | 8px | **Buttons, inputs, cards** |
| `radius.large` | 12px | Large cards, modals |
| `radius.xlarge` | 16px | Modal containers, bottom sheets |
| `radius.full` | 9999px | Circular buttons, avatars |

### 8.2 Component Border Radius

| Component | Radius |
|-----------|--------|
| Primary Button | 8px |
| Secondary Button | 8px |
| Input Field | 8px |
| Card | 12px |
| Modal | 16px |
| FAB (Floating Action Button) | 9999px (full) |
| Chip/Tag | 16px |
| Avatar | 9999px (full) |
| Progress Bar | 4px |

---

## 9. Animation Guidelines

### 9.1 Animation Principles

1. **Purposeful:** Every animation serves a functional purpose
2. **Subtle:** Animations should not distract from content
3. **Fast:** Keep animations under 300ms for UI feedback
4. **Consistent:** Use consistent easing curves throughout
5. **Respectful:** Honor reduced motion preferences

### 9.2 Duration Scale

| Token | Value | Usage |
|-------|-------|-------|
| `duration.fast` | 150ms | Micro-interactions, button states |
| `duration.normal` | 250ms | **Standard transitions, card expansions** |
| `duration.slow` | 350ms | Page transitions, modal animations |
| `duration.celebration` | 2000ms | Achievement animations |

### 9.3 Easing Curves

| Token | CSS Cubic-Bezier | Usage |
|-------|------------------|-------|
| `ease.in` | `cubic-bezier(0.4, 0.0, 1, 1)` | Exiting elements |
| `ease.out` | `cubic-bezier(0.0, 0.0, 0.2, 1)` | **Entering elements** |
| `ease.inOut` | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Bidirectional transitions |
| `ease.bounce` | Custom spring | Celebration animations |

### 9.4 Common Animations

#### Button Press

```javascript
// React Native Reanimated
const buttonPressAnimation = {
  transform: [{ scale: 0.96 }],
  duration: 150,
  easing: Easing.out,
};
```

#### Card Entry

```javascript
const cardEntryAnimation = {
  from: { opacity: 0, translateY: 20 },
  to: { opacity: 1, translateY: 0 },
  duration: 250,
  easing: Easing.out,
};
```

#### Modal Entry

```javascript
const modalEntryAnimation = {
  backdrop: {
    from: { opacity: 0 },
    to: { opacity: 0.5 },
    duration: 250,
  },
  content: {
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    duration: 300,
    easing: Easing.out,
  },
};
```

#### Achievement Celebration

```javascript
const celebrationAnimation = {
  confetti: {
    duration: 2000,
    iterations: 1,
  },
  scale: {
    from: { scale: 0.5 },
    to: { scale: 1 },
    duration: 400,
    easing: Easing.bounce,
  },
};
```

### 9.5 Reduced Motion

When users enable reduced motion in system settings:

```javascript
// Check reduced motion preference
const prefersReducedMotion = useReducedMotion();

// Apply conditional animations
const animationConfig = prefersReducedMotion
  ? { duration: 0 }
  : { duration: 250, easing: Easing.out };
```

**Reduced Motion Alternatives:**

| Original Animation | Reduced Motion Alternative |
|--------------------|---------------------------|
| Fade + slide | Fade only |
| Scale + fade | Opacity only |
| Bounce | Direct transition |
| Parallax | Static positioning |

---

## 10. Responsive Breakpoints

### 10.1 Breakpoint Definitions

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| `xs` | 320px | Small phones (iPhone SE) |
| `sm` | 375px | Standard phones (iPhone 13) |
| `md` | 768px | Tablets (iPad), Web small |
| `lg` | 1024px | Tablets (iPad Pro), Web medium |
| `xl` | 1440px | Desktop, Web large |

### 10.2 Layout Adaptations

| Element | Mobile (<768px) | Tablet (768-1024px) | Desktop (>1024px) |
|---------|-----------------|---------------------|-------------------|
| Screen Padding | 16px | 24px | 32px |
| Card Layout | Single column | 2 columns | 3-4 columns |
| Tab Bar | Bottom navigation | Bottom or top | Top navigation |
| Modal | Full screen | Centered, 90% width | Centered, 600px max |
| Stats Grid | 1 column | 2 columns | 4 columns |

### 10.3 Touch Target Adjustments

| Platform | Minimum Target | Recommended |
|----------|---------------|-------------|
| iOS | 44×44pt | 48×48pt |
| Android | 48×48dp | 56×56dp |
| Web (mouse) | 24×24px | 36×36px |
| Web (touch) | 44×44px | 48×48px |

---

## 11. Design Tokens (JSON Export)

```json
{
  "color": {
    "primary": {
      "500": { "value": "#F57300" },
      "600": { "value": "#D65A00" }
    },
    "secondary": {
      "500": { "value": "#4CAF50" }
    },
    "success": {
      "main": { "value": "#2E7D32" }
    },
    "error": {
      "main": { "value": "#C62828" }
    },
    "neutral": {
      "900": { "value": "#212121" },
      "700": { "value": "#616161" },
      "500": { "value": "#9E9E9E" },
      "300": { "value": "#E0E0E0" },
      "100": { "value": "#F5F5F5" },
      "0": { "value": "#FFFFFF" }
    }
  },
  "typography": {
    "h1": {
      "fontSize": "28px",
      "fontWeight": "700",
      "lineHeight": "36px"
    },
    "body": {
      "fontSize": "16px",
      "fontWeight": "400",
      "lineHeight": "24px"
    }
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "6": "24px",
    "8": "32px"
  },
  "radius": {
    "medium": "8px",
    "large": "12px"
  },
  "shadow": {
    "elevation2": {
      "shadowColor": "#000",
      "shadowOffset": { "width": 0, "height": 2 },
      "shadowOpacity": 0.12,
      "shadowRadius": 4,
      "elevation": 2
    }
  }
}
```

---

## 12. Quality Assurance Checklist

Before implementing any component, verify:

- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text)
- [ ] Touch targets are minimum 44×44 points
- [ ] Focus states are visible and distinct
- [ ] Disabled states are visually distinct
- [ ] Loading states are defined
- [ ] Error states include text (not just color)
- [ ] Animations respect reduced motion preferences
- [ ] Component works at all breakpoint sizes
- [ ] Screen reader labels are specified
- [ ] Dark theme variants are defined

---

*This design system should be referenced for all UI implementation. Any deviations must be documented and approved by the design lead.*

**Last Updated:** March 15, 2026  
**Next Review:** After MVP launch
