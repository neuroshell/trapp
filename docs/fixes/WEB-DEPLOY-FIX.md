# Web Deploy Pipeline Fix

**Date:** March 16, 2026  
**Issue:** `expo export:web` command deprecated, causing web deploy to fail

---

## Problem

The web deployment pipeline was failing with:

```
Run npx expo export:web
CommandError: expo export:web can only be used with Webpack. 
Use expo export for other bundlers.
Error: Process completed with exit code 1.
```

---

## Root Cause

- `expo export:web` is **deprecated** in Expo SDK 55+
- Expo now uses Metro bundler by default (not Webpack)
- The new command is `npx expo export -p web`
- Output directory changed from `web-build/` to `dist/`

---

## Solution

Updated `.github/workflows/cd-web.yml` to use the new Expo export command:

### Changes Made

**1. Build Command**
```yaml
# Before (deprecated)
- name: Build Expo Web App
  run: npx expo export:web

# After (current)
- name: Build Expo Web App
  run: npx expo export -p web
```

**2. Output Directory**
```yaml
# Before
cp web-build/index.html web-build/404.html
path: web-build/

# After
cp dist/index.html dist/404.html
path: dist/
```

---

## Files Modified

| File | Changes |
|------|---------|
| `.github/workflows/cd-web.yml` | Updated build command and output paths |

---

## Verification

### Local Build Test ✅

```bash
npx expo export -p web

# Output:
Starting Metro Bundler
Web Bundled 1088ms node_modules\expo\AppEntry.js (736 modules)

› Assets (30):
   ...fonts, icons, images...

› web bundles (1):
   _expo/static/js/web/AppEntry-*.js (1.5MB)

› Files (2):
   index.html (1.2KB)
   metadata.json (49B)

Exported: dist/
```

### Workflow Validation ✅

```
✅ .github/workflows/cd-web.yml - VALID
```

---

## New Web Deploy Flow

```yaml
1. Checkout repository
2. Setup Node.js
3. Install dependencies
4. Build web app (npx expo export -p web)
   → Output: dist/
5. Create 404.html for SPA routing
6. Upload artifacts
7. Deploy to GitHub Pages
```

---

## Output Structure

**Old (web-build/):**
```
web-build/
├── index.html
├── static/
│   └── js/
│       └── AppEntry-*.js
└── ...
```

**New (dist/):**
```
dist/
├── index.html
├── _expo/
│   └── static/
│       └── js/
│           └── AppEntry-*.js
└── metadata.json
```

---

## Benefits

1. **Current Expo SDK** - Uses latest Expo export command
2. **Metro Bundler** - Better performance than Webpack
3. **Smaller Bundles** - Metro produces optimized builds
4. **Future-Proof** - Uses current Expo standards

---

## How to Deploy Web

### Automatic (CI/CD)
Push to `main` branch:
```bash
git push origin main
```
→ Triggers web deployment to GitHub Pages

### Manual
```bash
# Build locally
npx expo export -p web

# Serve locally for testing
npx serve dist

# Deploy manually
ghp-import -n -p -f dist
```

---

## Related Documentation

- [Expo Export Documentation](https://docs.expo.dev/deployment/export/)
- [Metro Bundler](https://docs.expo.dev/guides/customizing-metro/)
- `docs/CI-CD.md` - Full CI/CD pipeline documentation

---

**Status:** ✅ Fixed  
**Build Command:** `npx expo export -p web`  
**Output Directory:** `dist/`  
**Workflow:** Validated and ready
