# Trapp Tracker - Accessibility Guidelines

**Version:** 1.0  
**Last Updated:** March 15, 2026  
**Platform:** React Native + Expo (iOS, Android, Web)

---

## Document Overview

This document outlines the accessibility requirements and implementation guidelines for Trapp Tracker. Our goal is to achieve **WCAG 2.1 Level AA compliance** across all platforms (iOS, Android, Web).

### Accessibility Mission Statement

> "Everyone deserves to track their fitness journey, regardless of ability. Trapp Tracker is committed to providing an inclusive experience that works for all users."

---

## 1. WCAG 2.1 AA Compliance

### 1.1 WCAG Principles

We adhere to the four WCAG principles:

| Principle          | Description                                      | Application                                       |
| ------------------ | ------------------------------------------------ | ------------------------------------------------- |
| **Perceivable**    | Information must be presentable to users' senses | Text alternatives, captions, adaptable content    |
| **Operable**       | Interface must be operable by all users          | Keyboard navigation, sufficient time, no seizures |
| **Understandable** | Information and operation must be clear          | Readable, predictable, input assistance           |
| **Robust**         | Content must work with assistive technologies    | Compatible with current and future tools          |

### 1.2 Success Criteria Checklist

#### Level A (Essential)

- [ ] 1.1.1 Non-text Content: All images have alt text
- [ ] 1.2.1 Audio-only and Video-only: Alternatives provided
- [ ] 1.3.1 Info and Relationships: Structure preserved
- [ ] 1.3.2 Meaningful Sequence: Correct reading order
- [ ] 1.3.3 Sensory Characteristics: Not solely color/shape-based
- [ ] 1.4.1 Use of Color: Color not only means of conveying info
- [ ] 1.4.2 Audio Control: User can control audio
- [ ] 2.1.1 Keyboard: All functions keyboard accessible
- [ ] 2.1.2 No Keyboard Trap: Can exit with keyboard
- [ ] 2.2.1 Timing Adjustable: Extend time limits
- [ ] 2.2.2 Pause/Stop/Hide: Control moving content
- [ ] 2.3.1 Three Flashes: No content flashes >3 times
- [ ] 2.4.1 Bypass Blocks: Skip navigation links
- [ ] 2.4.2 Page Titled: Descriptive titles
- [ ] 2.4.3 Focus Order: Logical focus sequence
- [ ] 2.4.4 Link Purpose: Clear link text
- [ ] 2.5.1 Pointer Gestures: Single pointer alternatives
- [ ] 2.5.2 Pointer Cancellation: No accidental activation
- [ ] 2.5.3 Label in Name: Visible label in accessible name
- [ ] 2.5.4 Motion Actuation: Motion can be disabled
- [ ] 3.1.1 Language of Page: Language specified
- [ ] 3.2.1 On Focus: No context change on focus
- [ ] 3.2.2 On Input: No context change on input
- [ ] 3.3.1 Error Identification: Errors clearly identified
- [ ] 3.3.2 Labels or Instructions: Input labels provided
- [ ] 4.1.1 Parsing: Valid markup
- [ ] 4.1.2 Name, Role, Value: Accessible names for UI

#### Level AA (Required for Trapp Tracker)

- [ ] 1.2.4 Captions (Live): Live captions provided
- [ ] 1.2.5 Audio Description: Audio description for video
- [ ] 1.4.3 Contrast (Minimum): 4.5:1 for normal text
- [ ] 1.4.4 Resize Text: Up to 200% without loss
- [ ] 1.4.5 Images of Text: Text used instead of images
- [ ] 1.4.10 Reflow: No horizontal scrolling at 320px
- [ ] 1.4.11 Non-text Contrast: 3:1 for UI components
- [ ] 1.4.12 Text Spacing: Custom spacing supported
- [ ] 1.4.13 Content on Hover/Focus: Dismissible, persistent
- [ ] 2.4.5 Multiple Ways: Multiple navigation methods
- [ ] 2.4.6 Headings and Labels: Descriptive headings
- [ ] 2.4.7 Focus Visible: Visible focus indicator
- [ ] 3.1.2 Language of Parts: Language changes marked
- [ ] 3.2.3 Consistent Navigation: Consistent order
- [ ] 3.2.4 Consistent Identification: Consistent labeling
- [ ] 3.3.3 Error Suggestion: Error correction suggestions
- [ ] 3.3.4 Error Prevention (Legal/Financial): Confirmation
- [ ] 4.1.3 Status Messages: Announced to assistive tech

---

## 2. Color & Contrast Requirements

### 2.1 Minimum Contrast Ratios

| Element Type                          | Minimum Ratio | WCAG Criterion |
| ------------------------------------- | ------------- | -------------- |
| Normal Text (<18px)                   | 4.5:1         | 1.4.3          |
| Large Text (≥18px or ≥14px bold)      | 3:1           | 1.4.3          |
| UI Components (buttons, inputs)       | 3:1           | 1.4.11         |
| Graphical Objects (icons, indicators) | 3:1           | 1.4.11         |
| Focus Indicators                      | 3:1           | 2.4.7          |

### 2.2 Approved Color Combinations

#### Light Theme

| Foreground              | Background              | Ratio  | Status                |
| ----------------------- | ----------------------- | ------ | --------------------- |
| `#212121` (neutral.900) | `#FFFFFF` (white)       | 16.1:1 | ✅ Pass               |
| `#757575` (neutral.600) | `#FFFFFF` (white)       | 4.6:1  | ✅ Pass               |
| `#F57300` (primary.500) | `#FFFFFF` (white)       | 3.5:1  | ✅ Pass (large text)  |
| `#FFFFFF` (white)       | `#F57300` (primary.500) | 3.5:1  | ✅ Pass (button text) |
| `#2E7D32` (success)     | `#FFFFFF` (white)       | 4.6:1  | ✅ Pass               |
| `#C62828` (error)       | `#FFFFFF` (white)       | 4.8:1  | ✅ Pass               |
| `#1565C0` (info)        | `#FFFFFF` (white)       | 4.5:1  | ✅ Pass               |

#### Dark Theme

| Foreground            | Background          | Ratio  | Status  |
| --------------------- | ------------------- | ------ | ------- |
| `#FFFFFF` (white)     | `#121212` (dark bg) | 18.6:1 | ✅ Pass |
| `#B0B0B0` (secondary) | `#121212` (dark bg) | 7.2:1  | ✅ Pass |
| `#F57300` (primary)   | `#121212` (dark bg) | 5.8:1  | ✅ Pass |
| `#81C784` (success)   | `#121212` (dark bg) | 6.1:1  | ✅ Pass |
| `#E57373` (error)     | `#121212` (dark bg) | 5.9:1  | ✅ Pass |

### 2.3 Color Blindness Considerations

**Never use color alone to convey information:**

```
❌ BAD: Only using red/green to indicate error/success
✅ GOOD: Using color + icon + text label

❌ BAD: "Fields in red are required"
✅ GOOD: "Required fields are marked with *"

❌ BAD: Red circle for error
✅ GOOD: Red circle with "!" icon and "Error" text
```

**Workout Type Differentiation:**

| Workout | Color  | Icon | Pattern   |
| ------- | ------ | ---- | --------- |
| Running | Orange | 🏃   | Solid     |
| Squats  | Purple | 🏋️   | Dotted    |
| Pushups | Blue   | 💪   | Striped   |
| Pullups | Green  | 🎯   | Checkered |

### 2.4 Contrast Testing Tools

- **Web:** Chrome DevTools Accessibility Inspector
- **iOS:** Xcode Accessibility Inspector
- **Android:** Android Studio Layout Inspector
- **Online:** WebAIM Contrast Checker (webaim.org/resources/contrastchecker)

---

## 3. Touch Target Requirements

### 3.1 Minimum Touch Target Sizes

| Platform    | Minimum Size | Recommended  |
| ----------- | ------------ | ------------ |
| iOS         | 44×44 points | 48×48 points |
| Android     | 48×48 dp     | 56×56 dp     |
| Web (touch) | 44×44 pixels | 48×48 pixels |
| Web (mouse) | 24×24 pixels | 36×36 pixels |

### 3.2 Component Touch Targets

| Component      | Minimum Size | Implementation                |
| -------------- | ------------ | ----------------------------- |
| Buttons        | 44×44pt      | Include padding in hit area   |
| Icon Buttons   | 44×44pt      | Invisible padding around icon |
| Tab Bar Items  | 48×48pt      | Full tab area tappable        |
| List Items     | 44pt height  | Full row tappable             |
| Checkboxes     | 44×44pt      | Include label in hit area     |
| Radio Buttons  | 44×44pt      | Include label in hit area     |
| Input Fields   | 48pt height  | Full field tappable           |
| Links (inline) | 44×44pt      | Padding around text           |

### 3.3 Touch Target Implementation

```tsx
// React Native Example - Icon Button with Proper Touch Target
import { TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function IconButton({ icon, onPress, accessibilityLabel }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
      style={{
        width: 44,
        height: 44,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <MaterialCommunityIcons name={icon} size={24} color="#F57300" />
    </TouchableOpacity>
  );
}
```

### 3.4 Spacing Between Touch Targets

| Situation           | Minimum Spacing    |
| ------------------- | ------------------ |
| Adjacent buttons    | 8px                |
| List items          | 0px (full row tap) |
| Icon buttons in row | 16px               |
| Form elements       | 16px vertical      |

---

## 4. Screen Reader Support

### 4.1 Accessibility Properties (React Native)

| Property             | Purpose                             | Example                                         |
| -------------------- | ----------------------------------- | ----------------------------------------------- |
| `accessibilityLabel` | Text description for screen readers | `"Log running workout"`                         |
| `accessibilityHint`  | Additional context about action     | `"Opens form to log running distance and time"` |
| `accessibilityRole`  | Type of UI element                  | `"button"`, `"link"`, `"image"`                 |
| `accessibilityState` | Current state                       | `{ disabled: true, selected: false }`           |
| `accessibilityValue` | Value for sliders, progress         | `{ min: 0, max: 100, now: 50 }`                 |
| `accessible`         | Makes element focusable             | `true` for custom components                    |

### 4.2 Screen Reader Label Guidelines

#### Buttons

```tsx
// ❌ BAD: Generic label
<TouchableOpacity accessibilityLabel="Button">

// ❌ BAD: Missing label
<TouchableOpacity onPress={handleLog}>

// ✅ GOOD: Descriptive label
<TouchableOpacity
  accessibilityLabel="Log running workout"
  accessibilityHint="Opens form to enter distance and duration"
>
```

#### Images & Icons

```tsx
// ❌ BAD: No label
<MaterialCommunityIcons name="run" size={24} />

// ✅ GOOD: Descriptive label
<View
  accessibilityRole="image"
  accessibilityLabel="Running workout icon"
>
  <MaterialCommunityIcons name="run" size={24} />
</View>

// ✅ GOOD: Decorative image (hidden from screen reader)
<View accessibilityRole="none">
  <MaterialCommunityIcons name="run" size={24} />
</View>
```

#### Form Inputs

```tsx
// ✅ GOOD: Complete form input accessibility
<View>
  <Text
    accessibilityLabel="Distance"
    accessibilityHint="Enter distance in kilometers"
  >
    Distance (km)
  </Text>
  <TextInput
    accessibilityLabel="Distance input"
    accessibilityHint="Enter your running distance"
    keyboardType="decimal-pad"
    value={distance}
    onChangeText={setDistance}
  />
  {error && <Text accessibilityRole="alert">{error}</Text>}
</View>
```

### 4.3 Screen Reader Flow

**Reading Order:**

```
┌─────────────────────────────────────────┐
│  1. Screen Title                        │
│  2. Streak Card                         │
│  3. Quick Actions (4 buttons)           │
│  4. Weekly Summary                      │
│  5. Recent Workouts List                │
│     - Workout 1                         │
│     - Workout 2                         │
│  6. Tab Bar (4 tabs)                    │
└─────────────────────────────────────────┘
```

**Implementation:**

```tsx
// Use accessibilityViewIsModal for modals
<Modal accessibilityViewIsModal={true}>
  <View>
    <Text accessibilityRole="header">Achievement Unlocked!</Text>
    {/* Content */}
  </View>
</Modal>

// Use importantForAccessibility for focus management
<View importantForAccessibility="yes">
  <Text>Priority content</Text>
</View>
<View importantForAccessibility="no">
  <Text>Decorative content</Text>
</View>
```

### 4.4 Dynamic Content Announcements

```tsx
// For live region announcements
import { AccessibilityInfo } from "react-native";

function showSuccess(message) {
  // Show toast
  setToast(message);

  // Announce to screen reader
  AccessibilityInfo.announceForAccessibility(message);
}

// For loading states
function setLoading(isLoading) {
  if (isLoading) {
    AccessibilityInfo.announceForAccessibility("Loading workouts...");
  }
}
```

---

## 5. Keyboard Navigation (Web)

### 5.1 Keyboard Shortcuts

| Key           | Action                             | Scope        |
| ------------- | ---------------------------------- | ------------ |
| `Tab`         | Move to next focusable element     | Global       |
| `Shift + Tab` | Move to previous focusable element | Global       |
| `Enter`       | Activate focused button/link       | Global       |
| `Space`       | Toggle checkbox/button             | Global       |
| `Arrow Keys`  | Navigate within components         | Lists, menus |
| `Escape`      | Close modal/dialog                 | Modals       |
| `H`           | Go to Home                         | Global       |
| `C`           | Go to Calendar                     | Global       |
| `S`           | Go to Stats                        | Global       |
| `A`           | Go to Achievements                 | Global       |
| `L`           | Log new workout                    | Global       |
| `?`           | Show keyboard shortcuts            | Global       |

### 5.2 Focus Management

```tsx
// Web: Skip to main content link
<a
  href="#main-content"
  className="skip-link"
  style={{
    position: 'absolute',
    top: '-40px',
    left: '0',
    zIndex: 9999,
  }}
  onFocus={(e) => e.target.style.top = '0'}
  onBlur={(e) => e.target.style.top = '-40px'}
>
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

### 5.3 Focus Indicators

```css
/* Default focus indicator */
:focus {
  outline: 2px solid #f57300;
  outline-offset: 2px;
}

/* Custom focus indicator */
.button:focus {
  outline: 3px solid #f57300;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(245, 115, 0, 0.3);
}

/* Remove default, add custom */
.button:focus:not(:focus-visible) {
  outline: none;
}

.button:focus-visible {
  outline: 3px solid #f57300;
  outline-offset: 2px;
}
```

### 5.4 Focus Trapping (Modals)

```tsx
// Trap focus within modal
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      firstElement.focus();

      const handleTabKey = (e) => {
        if (e.key === "Tab") {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleTabKey);
      return () => document.removeEventListener("keydown", handleTabKey);
    }
  }, [isOpen, onClose]);

  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

---

## 6. Motion & Animation

### 6.1 Reduced Motion Support

**Respect system preferences:**

```tsx
import { useReducedMotion } from "react-native-reanimated";

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();

  const animationConfig = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 300, easing: Easing.out };

  return (
    <Animated.View
      style={{
        opacity: animatedOpacity,
        transform: [{ scale: animatedScale }],
      }}
    >
      {/* Content */}
    </Animated.View>
  );
}
```

### 6.2 Animation Guidelines

| Animation Type  | Standard             | Reduced Motion      |
| --------------- | -------------------- | ------------------- |
| Page Transition | Fade + Slide (300ms) | Fade only (150ms)   |
| Modal Entry     | Scale + Fade (300ms) | Fade only (150ms)   |
| Button Press    | Scale 0.96 (150ms)   | Opacity change only |
| Achievement     | Confetti + Bounce    | Static display      |
| Loading Spinner | Rotating (1000ms)    | Pulsing opacity     |

### 6.3 Seizure Prevention

**Never create content that:**

- Flashes more than 3 times per second
- Has high contrast rapid changes
- Uses full-screen flashing effects

```tsx
// ❌ BAD: Flashing animation
<Animated.View style={{
  opacity: flashingOpacity // Rapidly changing
}} />

// ✅ GOOD: Gentle pulsing
<Animated.View style={{
  opacity: gentlePulse // Slow, subtle change
}} />
```

---

## 7. Text & Typography

### 7.1 Dynamic Type Support

**iOS Dynamic Type:**

```tsx
import { useDynamicType } from "react-native-dynamic-type";

function AccessibleText({ children, size = "medium" }) {
  const dynamicType = useDynamicType();

  const fontSizes = {
    small: 14 * dynamicType.scale,
    medium: 16 * dynamicType.scale,
    large: 18 * dynamicType.scale,
  };

  return <Text style={{ fontSize: fontSizes[size] }}>{children}</Text>;
}
```

**Android Font Scaling:**

```tsx
import { PixelRatio } from "react-native";

const fontScale = PixelRatio.getFontScale();

const styles = StyleSheet.create({
  body: {
    fontSize: 16 * fontScale,
    // Ensure line height scales too
    lineHeight: 24 * fontScale,
  },
});
```

### 7.2 Text Scaling Limits

| Element   | Min Scale | Max Scale |
| --------- | --------- | --------- |
| Body Text | 100%      | 200%      |
| Headings  | 100%      | 200%      |
| Buttons   | 100%      | 200%      |
| Labels    | 100%      | 200%      |
| Captions  | 100%      | 150%      |

### 7.3 Readable Text Guidelines

```tsx
// ✅ GOOD: Sufficient line height
<Text style={{
  fontSize: 16,
  lineHeight: 24, // 1.5x font size
}}>
  Body text with good readability
</Text>

// ✅ GOOD: Adequate letter spacing
<Text style={{
  fontSize: 11,
  letterSpacing: 0.5, // Helps small text
}}>
  Overline text
</Text>

// ✅ GOOD: Limited line length
<View style={{ maxWidth: 600 }}>
  <Text>Content with optimal line length</Text>
</View>
```

---

## 8. Form Accessibility

### 8.1 Label Associations

```tsx
// ✅ GOOD: Properly associated label
<View>
  <Text
    accessibilityLabel="Email address"
    style={styles.label}
  >
    Email
  </Text>
  <TextInput
    accessibilityLabel="Email address input"
    keyboardType="email-address"
    autoCapitalize="none"
  />
</View>

// ✅ GOOD: Required field indicator
<View>
  <Text>
    Password <Text accessibilityLabel="required">*</Text>
  </Text>
  <TextInput
    accessibilityLabel="Password input, required"
    secureTextEntry
  />
</View>
```

### 8.2 Error Handling

```tsx
// ✅ GOOD: Accessible error state
function AccessibleInput({ label, error, value, onChangeText }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        accessibilityLabel={label}
        accessibilityInvalid={!!error}
        accessibilityDescribedBy={error ? "error-message" : undefined}
        style={[styles.input, error && styles.inputError]}
      />
      {error && (
        <Text id="error-message" accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}
```

### 8.3 Input Types

| Input     | Keyboard Type   | Auto-capitalize |
| --------- | --------------- | --------------- |
| Email     | `email-address` | `none`          |
| Password  | `default`       | `none`          |
| Distance  | `decimal-pad`   | `none`          |
| Reps/Sets | `numeric`       | `none`          |
| Notes     | `default`       | `sentences`     |
| Name      | `default`       | `words`         |

---

## 9. Testing Checklist

### 9.1 Manual Testing

#### Visual Testing

- [ ] Color contrast meets 4.5:1 for text
- [ ] Color contrast meets 3:1 for UI components
- [ ] Focus indicators visible on all interactive elements
- [ ] Touch targets are 44×44pt minimum
- [ ] Text scales to 200% without breaking layout
- [ ] No information conveyed by color alone

#### Screen Reader Testing

- [ ] All images have alt text or are marked decorative
- [ ] All buttons have descriptive labels
- [ ] Form inputs have associated labels
- [ ] Error messages are announced
- [ ] Reading order is logical
- [ ] Modal content is trapped and announced

#### Keyboard Testing (Web)

- [ ] All elements reachable via Tab
- [ ] Focus order is logical
- [ ] Focus is visible on all elements
- [ ] No keyboard traps
- [ ] Shortcuts work as documented
- [ ] Modal focus is trapped

### 9.2 Automated Testing

```tsx
// Example: Accessibility test with React Native Testing Library
import { render } from "@testing-library/react-native";

describe("Accessibility", () => {
  it("button has accessible label", () => {
    const { getByAccessibilityLabel } = render(
      <Button accessibilityLabel="Log workout" />,
    );
    expect(getByAccessibilityLabel("Log workout")).toBeTruthy();
  });

  it("image has alt text or is decorative", () => {
    const { toJSON } = render(<Icon name="run" />);
    const json = toJSON();
    expect(json.props.accessibilityRole).toBeDefined();
  });
});
```

### 9.3 Assistive Technology Testing

| Technology | Platform    | Test Scenarios              |
| ---------- | ----------- | --------------------------- |
| VoiceOver  | iOS         | Navigation, forms, gestures |
| TalkBack   | Android     | Navigation, forms, gestures |
| NVDA       | Windows Web | Keyboard, forms             |
| JAWS       | Windows Web | Keyboard, forms             |
| VoiceOver  | Mac Web     | Keyboard, gestures          |

### 9.4 Testing Schedule

| Phase         | Testing Type       | Frequency     |
| ------------- | ------------------ | ------------- |
| Development   | Automated tests    | Every commit  |
| Development   | Manual checklist   | Per component |
| Sprint Review | Screen reader test | Per sprint    |
| Pre-release   | Full audit         | Per release   |
| Post-launch   | User testing       | Quarterly     |

---

## 10. Implementation Examples

### 10.1 Accessible Button Component

```tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "tertiary";
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  accessibilityHint,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        styles.button,
        styles[variant],
        (disabled || loading) && styles.disabled,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#FFFFFF" : "#F57300"}
        />
      ) : (
        <Text
          style={[styles.text, styles[`${variant}Text`]]}
          accessibilityRole="text"
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    minWidth: 120,
  },
  primary: {
    backgroundColor: "#F57300",
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  disabled: {
    backgroundColor: "#E0E0E0",
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: "#212121",
  },
});
```

### 10.2 Accessible Card Component

```tsx
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

interface WorkoutCardProps {
  workoutType: "running" | "squats" | "pushups" | "pullups";
  title: string;
  details: string;
  date: string;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function WorkoutCard({
  workoutType,
  title,
  details,
  date,
  onPress,
  onLongPress,
}: WorkoutCardProps) {
  const icons = {
    running: "🏃",
    squats: "🏋️",
    pushups: "💪",
    pullups: "🎯",
  };

  const accessibilityLabel = `${workoutType} workout: ${title}, ${details}, ${date}`;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Tap to view details, long press for options"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.iconContainer} accessibilityRole="none">
        <Text style={styles.icon}>{icons[workoutType]}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.details} numberOfLines={1}>
          {details}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 72,
  },
  cardPressed: {
    backgroundColor: "#F5F5F5",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF0EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
  details: {
    fontSize: 14,
    color: "#757575",
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 4,
  },
});
```

---

## 11. Accessibility Statement

### Our Commitment

Trapp Tracker is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

### Conformance Status

The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. Trapp Tracker is committed to achieving **WCAG 2.1 Level AA** conformance.

### Feedback

We welcome your feedback on the accessibility of Trapp Tracker. Please let us know if you encounter accessibility barriers:

- **Email:** accessibility@trapptracker.com
- **Phone:** [Contact number]
- **Address:** [Mailing address]

We try to respond to feedback within 2 business days.

---

## 12. Resources

### Guidelines & Standards

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Evaluation Tool](https://wave.webaim.org/)
- [Lighthouse Accessibility Audit](https://developers.google.com/web/tools/lighthouse)

### Training Resources

- [WebAIM Accessibility Training](https://webaim.org/training/)
- [Deque University](https://dequeuniversity.com/)
- [Google Accessibility](https://developers.google.com/accessibility)

---

_This accessibility documentation should be referenced throughout development. Accessibility is not a feature—it's a fundamental requirement._

**Last Updated:** March 15, 2026  
**Next Review:** After each major release
