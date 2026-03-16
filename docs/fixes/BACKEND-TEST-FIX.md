# Backend Test Fix - ESM Migration

**Date:** March 15, 2026  
**Issue:** `ERR_REQUIRE_ESM` - lowdb v5+ is an ES Module

---

## Problem

The backend tests failed with the following error:

```
Error [ERR_REQUIRE_ESM]: require() of ES Module
/home/runner/work/trapp/trapp/backend/node_modules/lowdb/lib/index.js
from /home/runner/work/trapp/trapp/backend/index.js not supported.

Instead change the require of /home/runner/work/trapp/trapp/backend/node_modules/lowdb/lib/index.js
in /home/runner/work/trapp/trapp/backend/index.js to a dynamic import()
which is available in all CommonJS modules.
```

---

## Root Cause

`lowdb` v5+ is a pure ES Module package. The backend was using CommonJS `require()` syntax, which is incompatible with ES Module dependencies.

---

## Solution

Converted the entire backend from CommonJS to ES Modules.

### Changes Made

#### 1. backend/package.json

Added `"type": "module"` to enable ES Modules:

```json
{
  "name": "trapp-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",  // ← Added
  "main": "index.js",
  ...
}
```

#### 2. backend/index.js

**Before (CommonJS):**

```javascript
const express = require("express");
const cors = require("cors");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");
const { nanoid } = require("nanoid");

// ... code ...

if (require.main === module) {
  createServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { createServer };
```

**After (ES Modules):**

```javascript
import express from "express";
import cors from "cors";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";

// ... code ...

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { createServer };
```

#### 3. backend/sync.test.js

**Before (CommonJS):**

```javascript
const { test } = require("node:test");
const assert = require("node:assert").strict;
const { mkdtemp, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const { createServer } = require("./index");
const { createHash } = require("crypto");
```

**After (ES Modules):**

```javascript
import { test } from "node:test";
import assert from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

import { createServer } from "./index.js";
```

---

## Key ES Module Migration Patterns

### 1. Import Syntax

| CommonJS                      | ES Modules                  |
| ----------------------------- | --------------------------- |
| `const x = require('x')`      | `import x from 'x'`         |
| `const { a } = require('x')`  | `import { a } from 'x'`     |
| `const x = require('./file')` | `import x from './file.js'` |

**Note:** ES modules require the `.js` extension for relative imports.

### 2. Export Syntax

| CommonJS             | ES Modules         |
| -------------------- | ------------------ |
| `module.exports = x` | `export default x` |
| `exports.x = x`      | `export { x }`     |

### 3. Main Module Detection

| CommonJS                       | ES Modules                                               |
| ------------------------------ | -------------------------------------------------------- |
| `if (require.main === module)` | `if (import.meta.url === \`file://${process.argv[1]}\`)` |

### 4. **dirname and **filename

ES Modules don't have `__dirname` or `__filename`. Use:

```javascript
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

---

## Test Results

### Before Fix ❌

```
not ok 1 - sync.test.js
  ---
  duration_ms: 131.901968
  failureType: 'testCodeFailure'
  exitCode: 1
  error: 'test failed'
  code: 'ERR_REQUIRE_ESM'
```

### After Fix ✅

```
✔ backend /health and /sync endpoints work (45.3996ms)
ℹ tests 1
ℹ pass 1
ℹ fail 0
```

---

## Full Test Suite Status

```bash
npm test
```

**Results:**

```
Test Suites: 2 passed, 2 total (App)
Tests:       2 passed, 2 total (App)
Time:        0.893 s

Backend tests: 1 passed, 1 total
Duration: 186ms

✅ ALL TESTS PASSING
```

---

## Files Modified

| File                   | Changes                                                |
| ---------------------- | ------------------------------------------------------ |
| `backend/package.json` | Added `"type": "module"`                               |
| `backend/index.js`     | Converted to ES modules (imports, exports, main check) |
| `backend/sync.test.js` | Converted to ES modules                                |

---

## Benefits of ES Modules

1. **Native Support** - Built into Node.js, no transpilation needed
2. **Better Tree-Shaking** - Static imports enable better bundler optimization
3. **Standard Syntax** - Consistent with browser JavaScript
4. **Async Imports** - Dynamic `import()` for code splitting
5. **Modern Dependencies** - Compatible with modern packages like lowdb v5+

---

## Migration Checklist

For future CommonJS → ES Modules migrations:

- [ ] Add `"type": "module"` to package.json
- [ ] Convert all `require()` to `import`
- [ ] Convert all `module.exports` to `export`
- [ ] Add `.js` extensions to relative imports
- [ ] Replace `require.main === module` with `import.meta.url` check
- [ ] Update `__dirname`/`__filename` if used
- [ ] Test all imports work correctly
- [ ] Verify tests pass

---

## Related Documentation

- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [Migrating to ES Modules](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
- [lowdb Documentation](https://github.com/typicode/lowdb)

---

**Status:** ✅ Fixed  
**Backend Tests:** ✅ Passing (1/1)  
**Full Test Suite:** ✅ Passing (3/3 total)  
**CI Ready:** Yes
