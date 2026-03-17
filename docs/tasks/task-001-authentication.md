# Task 001: Authentication System

**Priority:** Must Have (MVP)
**Phase:** Phase 1
**Related User Stories:** US-1.1, US-1.2, US-1.3, US-1.4
**Assigned To:** @expo-react-native-developer

---

## Overview

Implement a complete authentication system that allows users to register, login, maintain persistent sessions, and logout securely. The authentication system is the foundation for user data isolation and personalized fitness tracking experiences.

This task covers the full authentication flow including account creation with validation, secure login with SHA-256 password hashing, session persistence across app restarts using AsyncStorage, and clean logout functionality. The implementation must leverage the existing `AuthContext` structure and integrate with the `storage.ts` layer for data persistence.

All authentication flows must provide clear error messages, handle edge cases gracefully, and maintain WCAG 2.1 AA accessibility compliance throughout.

## Acceptance Criteria

- [ ] Users can register with email and password (min 8 characters)
- [ ] Email validation enforces RFC 5322 format with clear error messages
- [ ] Password must be minimum 8 characters with inline validation feedback
- [ ] Successful registration automatically logs in the user
- [ ] Users can login with registered email and password
- [ ] Failed login shows generic "Invalid email or password" error (security best practice)
- [ ] Session persists across app restarts using AsyncStorage
- [ ] Users remain logged in until they explicitly logout
- [ ] Logout clears session and navigates to login screen
- [ ] All forms are fully accessible (WCAG 2.1 AA compliant)
- [ ] Touch targets meet 44x44pt minimum requirement
- [ ] Color contrast ratios meet 4.5:1 for text, 3:1 for UI components
- [ ] Screen reader support with proper labels and hints
- [ ] Error states announced to screen readers via `accessibilityRole="alert"`

## Technical Implementation

### Components/Screens

- **LoginScreen.tsx** - User login form with email/password fields
  - Email input with keyboard type `email-address`
  - Password input with `secureTextEntry` toggle
  - Login button with loading state
  - Link to registration screen
  - Error display with accessibility announcements

- **RegisterScreen.tsx** - New user registration form
  - Email input with real-time validation
  - Password input with strength indicator (min 8 chars)
  - Registration button with loading state
  - Link to login screen
  - Terms acceptance checkbox (required)
  - Inline validation errors

- **AuthContext.tsx** (existing - enhance) - Authentication state management
  - `signIn(email, password)` - Authenticate user
  - `signUp(email, password)` - Create new account
  - `signOut()` - Clear session
  - `user` - Current user object
  - `loading` - Authentication state flag
  - `error` - Last error message

### Data Models

```typescript
// From src/models.ts - extend as needed
interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Storage keys (from storage.ts)
const AUTH_STORAGE_KEY = '@trapp:auth';
const USER_STORAGE_KEY = '@trapp:user';
```

### Storage/API Integration

**Password Hashing:**
```typescript
import * as Crypto from 'expo-crypto';

async function hashPassword(password: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
}
```

**Session Storage:**
```typescript
// Using existing storage.ts functions
import { saveAuthState, loadAuthState, clearAuthState } from './storage';

// Save session on successful login/register
await saveAuthState({
  user: userData,
  token: sessionToken,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
});

// Load session on app startup
const authState = await loadAuthState();
if (authState && !isSessionExpired(authState)) {
  // Restore session
}

// Clear session on logout
await clearAuthState();
```

**AuthContext Implementation:**
```typescript
// src/auth/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Restore session on mount
  useEffect(() => {
    restoreSession();
  }, []);

  // ... implementation
}
```

## Validation Rules

| Field | Rules | Error Message |
|-------|-------|---------------|
| Email | Required, valid RFC 5322 format, unique | "Please enter a valid email address" |
| Password | Required, minimum 8 characters, at least 1 letter + 1 number (recommended) | "Password must be at least 8 characters" |
| Terms Acceptance | Required checkbox (registration only) | "You must accept the terms to continue" |

**Email Validation Regex:**
```typescript
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
```

**Password Validation:**
```typescript
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password should contain at least one number' };
  }
  return { valid: true };
}
```

## Error Handling

| Scenario | User Message | Technical Action |
|----------|--------------|------------------|
| Invalid email format | "Please enter a valid email address" | Inline validation, prevent submission |
| Email already registered | "This email is already registered" | Check existing users in storage |
| Password too short | "Password must be at least 8 characters" | Inline validation |
| Incorrect login credentials | "Invalid email or password" | Generic error (security) |
| Network failure during registration | "Network error. Please try again." | Preserve form data, allow retry |
| Session expired | "Session expired. Please log in again." | Clear session, redirect to login |
| Storage write failure | "Unable to save session. Please try again." | Log error, retry mechanism |
| Concurrent session conflict | "Session conflict. Please log in again." | Clear all sessions, force re-auth |

**Error Boundary:**
```typescript
// Wrap auth flows in error boundary
<ErrorBoundary fallback={<ErrorScreen onRetry={retryAuth} />}>
  <AuthProvider>
    {/* App content */}
  </AuthProvider>
</ErrorBoundary>
```

## Testing Requirements

### Unit Tests

- [ ] `validateEmail()` returns true for valid emails, false for invalid
- [ ] `validatePassword()` rejects passwords < 8 characters
- [ ] `hashPassword()` produces consistent SHA-256 hashes
- [ ] `saveAuthState()` correctly persists to AsyncStorage
- [ ] `loadAuthState()` retrieves stored auth state
- [ ] `clearAuthState()` removes all auth data
- [ ] Session expiration check works correctly

### Component Tests

- [ ] LoginScreen renders with email and password fields
- [ ] RegisterScreen renders with all required fields
- [ ] Form validation errors display correctly
- [ ] Loading states show during async operations
- [ ] Error messages are announced to screen readers
- [ ] Touch targets meet 44x44pt minimum

### Integration Tests

- [ ] Full registration flow creates user and logs in
- [ ] Full login flow authenticates and persists session
- [ ] Session persists across app restart
- [ ] Logout clears session and redirects to login
- [ ] Duplicate email registration is rejected
- [ ] Invalid credentials show appropriate error

### Accessibility Tests

- [ ] All inputs have associated labels
- [ ] Error messages use `accessibilityRole="alert"`
- [ ] Screen reader can navigate entire auth flow
- [ ] Focus order is logical
- [ ] Color contrast meets WCAG 2.1 AA standards

### Performance Tests

- [ ] Login completes in < 2 seconds
- [ ] Registration completes in < 3 seconds
- [ ] Session restoration on app launch < 1 second

## Definition of Done

- [ ] Code implemented following project conventions
- [ ] All unit tests passing (`npm run test:app`)
- [ ] All integration tests passing
- [ ] Accessibility verified (WCAG 2.1 AA) using checklist from `docs/reqs/accessibility-guidelines.md`
- [ ] Color contrast validated using WebAIM Contrast Checker
- [ ] Touch targets verified at 44x44pt minimum
- [ ] Screen reader tested on iOS (VoiceOver) and Android (TalkBack)
- [ ] Error handling covers all documented scenarios
- [ ] TypeScript types defined and no type errors
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] Code reviewed and approved
- [ ] Documentation updated in QWEN.md if architecture changed

---

## References

- **Design System:** `docs/reqs/design-system.md` - Color palette, typography, component specs
- **Accessibility Guidelines:** `docs/reqs/accessibility-guidelines.md` - WCAG 2.1 AA requirements
- **User Stories:** `docs/reqs/user-stories.md` - US-1.1 through US-1.4
- **User Flows:** `docs/reqs/user-flows.md` - Flow 1: Onboarding & Authentication
- **Existing Code:** `src/auth/AuthContext.tsx`, `src/storage.ts`, `src/models.ts`

---

_Document History:_
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-16 | Product Team | Initial task specification |
