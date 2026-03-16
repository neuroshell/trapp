# Coverage Path Normalization Fix

**Date:** March 15, 2026  
**Issue:** Coverage summary showed full absolute Windows paths like `C:\Users\neuroshell\Documents\src\trapp\src\storage.ts`

---

## Problem

The GitHub Actions coverage summary was displaying file paths with:

- Full Windows absolute paths: `C:\Users\neuroshell\Documents\src\trapp\src\storage.ts`
- Full Linux absolute paths: `/home/runner/work/trapp/trapp/src/storage.ts`

This made the coverage report hard to read and platform-specific.

---

## Solution

Updated `scripts/parse-coverage.js` to normalize all file paths to relative paths from the project root.

### Before

```
❌ C:\Users\neuroshell\Documents\src\trapp\src\storage.ts | 42 stmts (9 funcs) | 10 (2) | 23.8%
```

### After

```
❌ trapp/src/storage.ts | 42 stmts (9 funcs) | 10 (2) | 23.8%
```

---

## Implementation

### normalizeFilePath() Function

```javascript
function normalizeFilePath(filePath) {
  // Normalize path separators to forward slashes
  const normalized = filePath.replace(/\\/g, "/");
  const parts = normalized.split("/");

  // Look for project indicators
  const projectIndex = parts.findIndex(
    (part) =>
      part === "trapp" ||
      part === "workspace" ||
      part === "work" ||
      part === "home",
  );

  if (projectIndex !== -1) {
    // Found 'trapp' - use that and everything after
    if (parts[projectIndex] === "trapp") {
      const result = parts.slice(projectIndex).join("/");
      // Handle GitHub Actions duplicate pattern: trapp/trapp/...
      if (result.startsWith("trapp/trapp/")) {
        return result.replace("trapp/trapp/", "trapp/");
      }
      return result;
    }

    // Handle GitHub Actions Linux runner pattern
    if (parts[projectIndex] === "home" && parts.includes("runner")) {
      const runnerIndex = parts.indexOf("runner");
      if (runnerIndex !== -1 && parts[runnerIndex + 2] === "trapp") {
        const result = parts.slice(runnerIndex + 2).join("/");
        if (result.startsWith("trapp/trapp/")) {
          return result.replace("trapp/trapp/", "trapp/");
        }
        return result;
      }
    }
  }

  // Fallback: show last 3 parts
  return parts.slice(-3).join("/");
}
```

---

## Path Transformations

| Input Path                                               | Output Path            | Environment              |
| -------------------------------------------------------- | ---------------------- | ------------------------ |
| `C:\Users\neuroshell\Documents\src\trapp\src\storage.ts` | `trapp/src/storage.ts` | Windows (local)          |
| `/home/runner/work/trapp/trapp/src/storage.ts`           | `trapp/src/storage.ts` | GitHub Actions (Linux)   |
| `D:/a/trapp/trapp/src/storage.ts`                        | `trapp/src/storage.ts` | GitHub Actions (Windows) |
| `src/storage.ts`                                         | `src/storage.ts`       | Relative (already clean) |

---

## Features

### 1. Cross-Platform Support

- ✅ Windows paths (`C:\Users\...`)
- ✅ Linux paths (`/home/runner/...`)
- ✅ UNC paths (`\\server\share\...`)
- ✅ Forward slash paths (`D:/a/...`)

### 2. GitHub Actions Handling

- ✅ Linux runner: `/home/runner/work/trapp/trapp/...`
- ✅ Windows runner: `D:/a/trapp/trapp/...`
- ✅ Removes duplicate `trapp/trapp/` pattern

### 3. Fallback Logic

- ✅ Shows last 3 path segments if project not found
- ✅ Handles relative paths unchanged
- ✅ Always uses forward slashes for consistency

---

## Testing

### Test Command

```bash
node scripts/parse-coverage.js ./coverage/coverage-final.json
```

### Sample Output

```
| File | Lines | Covered | % |
|------|-------|---------|---|
| ❌ trapp/src/storage.ts | 42 stmts (9 funcs) | 10 (2) | 23.8% |
| ✅ trapp/src/theme.ts | 4 stmts (0 funcs) | 4 (0) | 100.0% |
| ✅ trapp/src/components/Card.tsx | 2 stmts (1 funcs) | 2 (1) | 100.0% |
| ⚠️ trapp/src/components/DateTimeField.tsx | 15 stmts (6 funcs) | 8 (2) | 53.3% |
```

---

## CI/CD Integration

The fix is automatically applied in the GitHub Actions coverage summary job:

```yaml
- name: Generate coverage summary
  run: |
    # Copy parse script to temp location
    cp ./scripts/parse-coverage.js /tmp/parse-coverage.js
    node /tmp/parse-coverage.js "$FINAL_JSON" >> $GITHUB_STEP_SUMMARY
```

---

## Benefits

1. **Readability** - Clean, concise file paths
2. **Consistency** - Same format across all platforms
3. **Professional** - No exposed user names or system paths
4. **Portable** - Works on Windows, Linux, macOS
5. **CI/CD Ready** - Perfect for GitHub Actions reports

---

## Files Modified

| File                        | Changes                              |
| --------------------------- | ------------------------------------ |
| `scripts/parse-coverage.js` | Added `normalizeFilePath()` function |

---

## Related Documentation

- `docs/COVERAGE-SUMMARY-FIX.md` - Overall coverage summary implementation
- `.github/workflows/ci.yml` - CI workflow with coverage reporting

---

**Status:** ✅ Complete  
**Paths Normalized:** All platforms supported  
**CI Ready:** Yes
