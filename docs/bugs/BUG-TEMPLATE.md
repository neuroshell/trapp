# Bug Report Template

Use this template to document bugs found during E2E testing.

---

## Bug ID: BUG-E2E-XXX

### Title
[Brief descriptive title]

### Severity
- [ ] Critical (blocks core functionality)
- [ ] High (major feature broken, workaround exists)
- [ ] Medium (minor feature broken, workaround exists)
- [ ] Low (cosmetic issue)

### Description
[Clear description of the bug]

### Steps to Reproduce
1. [First step]
2. [Second step]
3. [And so on...]

### Expected Result
[What should happen]

### Actual Result
[What actually happens]

### Environment
- **OS:** [e.g., Windows 11, macOS Sonoma, Ubuntu 22.04]
- **Browser:** [e.g., Chrome 121, Firefox 122, Safari 17]
- **Device:** [e.g., Desktop, Pixel 5, iPhone 12]
- **App Version:** [e.g., 0.1.0]
- **Test URL:** [e.g., http://localhost:8081]

### Test Case
- **Test ID:** [e.g., E2E-AUTH-01]
- **Test File:** [e.g., __e2e__/tests/01-authentication.test.ts]

### Screenshots/Recordings
[Attach screenshots or video recordings]

### Console Errors
```
[Paste any console errors here]
```

### Network Errors
```
[Paste any network errors here]
```

### Additional Context
[Any other relevant information]

### Proposed Fix
[If known, suggest a fix]

### Related Issues
[Link to related GitHub issues]

---

## Example

### Bug ID: BUG-E2E-001

### Title
Login form accepts invalid email format without validation error

### Severity
- [ ] Critical
- [x] High
- [ ] Medium
- [ ] Low

### Description
The login form accepts email addresses without TLD (e.g., "test@domain") and attempts to authenticate instead of showing a validation error.

### Steps to Reproduce
1. Navigate to login screen
2. Enter email: `test@domain`
3. Enter password: `TestPass123`
4. Click "Sign In"

### Expected Result
Inline error message: "Please enter a valid email address"

### Actual Result
Form submits, authentication fails with generic error

### Environment
- **OS:** Windows 11
- **Browser:** Chrome 121
- **Device:** Desktop
- **App Version:** 0.1.0
- **Test URL:** http://localhost:3000

### Test Case
- **Test ID:** E2E-AUTH-02
- **Test File:** __e2e__/tests/01-authentication.test.ts

### Screenshots/Recordings
![screenshot](./screenshots/BUG-E2E-001.png)

### Console Errors
```
POST http://localhost:3000/api/auth/login 401 (Unauthorized)
```

### Additional Context
Validation regex in LoginScreen.tsx may be too permissive.

### Proposed Fix
Update email validation regex to require TLD:
```typescript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### Related Issues
- None
