# Task 005: Backend Sync Server

**Priority:** Must Have (MVP)
**Phase:** Phase 1
**Related User Stories:** US-6.1, US-6.2
**Assigned To:** @express-backend-engineer

---

## Overview

Implement the Express.js backend sync server that enables cloud synchronization for user workout data. The backend provides secure API endpoints for data sync, implements proper authentication, and uses lowdb for JSON file storage. This enables users to access their fitness data across multiple devices while maintaining an offline-first architecture.

The sync server is designed with security as a priority, including prototype pollution prevention, input sanitization, rate limiting, and secure session management. The implementation uses the existing backend skeleton and integrates with the frontend storage layer for seamless sync operations.

**Note:** The backend is optional for MVP - the app functions fully offline. Cloud sync is a value-add feature for multi-device users.

## Acceptance Criteria

- [ ] Express.js server runs on configurable port (default: 3000)
- [ ] POST /api/sync endpoint accepts workout data for upload
- [ ] GET /api/sync endpoint returns user's synced data
- [ ] Authentication required for all sync endpoints (JWT or session-based)
- [ ] Input validation and sanitization on all endpoints
- [ ] Prototype pollution prevention implemented
- [ ] Rate limiting configured (100 requests per minute per IP)
- [ ] CORS configured for React Native app origins
- [ ] lowdb used for JSON file storage
- [ ] Data stored in structured format by user ID
- [ ] Error responses follow consistent format
- [ ] Health check endpoint (/api/health) returns server status
- [ ] Server logs requests and errors
- [ ] Environment variables for configuration (port, JWT secret, etc.)
- [ ] Backend tests cover all endpoints
- [ ] Security headers configured (helmet middleware)

## Technical Implementation

### Server Structure

```
backend/
├── index.js              # Main server entry point
├── routes/
│   ├── sync.js           # Sync endpoints
│   ├── auth.js           # Authentication endpoints
│   └── health.js         # Health check
├── middleware/
│   ├── auth.js           # JWT authentication
│   ├── rateLimit.js      # Rate limiting
│   ├── validate.js       # Input validation
│   └── security.js       # Security headers, sanitization
├── db/
│   ├── index.js          # Database initialization
│   └── schema.js         # Data schema definitions
├── utils/
│   ├── logger.js         # Logging utility
│   └── errors.js         # Error handling utilities
├── tests/
│   ├── sync.test.js      # Sync endpoint tests
│   ├── auth.test.js      # Auth endpoint tests
│   └── security.test.js  # Security tests
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment template
├── package.json          # Dependencies
└── data/                 # Database files (gitignored)
    └── db.json
```

### Main Server (backend/index.js)

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const syncRoutes = require('./routes/sync');
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const { errorHandler } = require('./utils/errors');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:8081', // Expo
    'http://localhost:8082',
    'exp://localhost:8083',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing with size limits
app.use(express.json({ 
  limit: '1mb',
  strict: true,
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb' 
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Prototype pollution prevention
app.use((req, res, next) => {
  // Block dangerous keys
  const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
  
  const checkObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;
    
    for (const key of Object.keys(obj)) {
      if (dangerousKeys.includes(key)) {
        logger.warn(`Prototype pollution attempt detected: ${key}`);
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid request format',
        });
      }
      checkObject(obj[key]);
    }
  };
  
  checkObject(req.body);
  checkObject(req.query);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
```

### Sync Routes (backend/routes/sync.js)

```javascript
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { validateSyncRequest } = require('../middleware/validate');
const logger = require('../utils/logger');
const { nanoid } = require('nanoid');

// GET /api/sync - Download user's synced data
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const since = req.query.since; // Optional: sync changes since timestamp
    
    logger.info(`Sync download requested for user ${userId}`);
    
    const userData = await db.getUserData(userId);
    
    // Filter by timestamp if provided
    let filteredData = userData;
    if (since) {
      const sinceDate = new Date(since);
      filteredData = {
        workouts: userData.workouts.filter(w => 
          new Date(w.updatedAt) > sinceDate
        ),
        achievements: userData.achievements.filter(a => 
          new Date(a.unlockedAt) > sinceDate
        ),
        profile: userData.profile,
      };
    }
    
    logger.info(`Sync download complete for user ${userId}: ${filteredData.workouts.length} workouts`);
    
    res.json({
      success: true,
      data: filteredData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sync - Upload workout data
router.post('/', authenticate, validateSyncRequest, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workouts, achievements, profile } = req.body;
    
    logger.info(`Sync upload requested for user ${userId}: ${workouts?.length || 0} workouts`);
    
    const result = await db.syncUserData(userId, {
      workouts: workouts || [],
      achievements: achievements || [],
      profile: profile || null,
    });
    
    logger.info(`Sync upload complete for user ${userId}: ${result.conflicts} conflicts resolved`);
    
    res.json({
      success: true,
      conflicts: result.conflicts,
      resolved: result.resolved,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/sync/workout - Sync single workout (optimized for quick log)
router.post('/workout', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const workout = req.body;
    
    // Validate workout structure
    if (!workout.type || !workout.timestamp || !workout.data) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Workout must include type, timestamp, and data',
      });
    }
    
    logger.info(`Single workout sync for user ${userId}: ${workout.type}`);
    
    const savedWorkout = await db.saveWorkout(userId, {
      ...workout,
      id: workout.id || nanoid(),
      createdAt: workout.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    res.json({
      success: true,
      workout: savedWorkout,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/sync/workout/:id - Delete synced workout
router.delete('/workout/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    logger.info(`Delete workout ${id} for user ${userId}`);
    
    await db.deleteWorkout(userId, id);
    
    res.json({
      success: true,
      deletedId: id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### Database Layer (backend/db/index.js)

```javascript
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const adapter = new FileSync(path.join(dataDir, 'db.json'));
const db = low(adapter);

// Initialize default data structure
db.defaults({
  users: {},
  syncQueue: [],
}).write();

// Get user data
function getUserData(userId) {
  const user = db.get(`users.${userId}`).value();
  
  if (!user) {
    return {
      workouts: [],
      achievements: [],
      profile: null,
      createdAt: new Date().toISOString(),
    };
  }
  
  return user;
}

// Sync user data (merge with existing)
async function syncUserData(userId, data) {
  const currentUser = getUserData(userId);
  const conflicts = [];
  const resolved = [];
  
  // Merge workouts (last-write-wins with merge for same timestamp)
  const workoutMap = new Map();
  
  // Add existing workouts
  currentUser.workouts?.forEach(w => {
    workoutMap.set(w.id, { ...w, source: 'server' });
  });
  
  // Merge new workouts
  data.workouts.forEach(w => {
    const existing = workoutMap.get(w.id);
    
    if (existing) {
      // Conflict: same ID, different update time
      const existingTime = new Date(existing.updatedAt).getTime();
      const newTime = new Date(w.updatedAt).getTime();
      
      if (newTime > existingTime) {
        conflicts.push({
          id: w.id,
          type: 'workout',
          resolution: 'client_wins',
        });
        resolved.push(w.id);
        workoutMap.set(w.id, { ...w, source: 'client' });
      } else {
        conflicts.push({
          id: w.id,
          type: 'workout',
          resolution: 'server_wins',
        });
      }
    } else {
      workoutMap.set(w.id, { ...w, source: 'client' });
    }
  });
  
  const mergedWorkouts = Array.from(workoutMap.values()).map(({ source, ...w }) => w);
  
  // Merge achievements (union of unlocked achievements)
  const achievementMap = new Map();
  
  currentUser.achievements?.forEach(a => {
    achievementMap.set(a.id, a);
  });
  
  data.achievements.forEach(a => {
    if (!achievementMap.has(a.id)) {
      achievementMap.set(a.id, a);
    }
  });
  
  const mergedAchievements = Array.from(achievementMap.values());
  
  // Update database
  db.set(`users.${userId}`, {
    workouts: mergedWorkouts,
    achievements: mergedAchievements,
    profile: data.profile || currentUser.profile,
    lastSync: new Date().toISOString(),
  }).write();
  
  logger.debug(`Sync complete for ${userId}: ${conflicts.length} conflicts`);
  
  return {
    conflicts: conflicts.length,
    resolved,
    mergedWorkouts: mergedWorkouts.length,
    mergedAchievements: mergedAchievements.length,
  };
}

// Save single workout
async function saveWorkout(userId, workout) {
  const user = getUserData(userId);
  
  const existingIndex = user.workouts.findIndex(w => w.id === workout.id);
  
  if (existingIndex >= 0) {
    user.workouts[existingIndex] = workout;
  } else {
    user.workouts.push(workout);
  }
  
  db.set(`users.${userId}`, user).write();
  
  return workout;
}

// Delete workout
async function deleteWorkout(userId, workoutId) {
  const user = getUserData(userId);
  user.workouts = user.workouts.filter(w => w.id !== workoutId);
  db.set(`users.${userId}`, user).write();
  
  return true;
}

// Save achievement
async function saveAchievement(userId, achievement) {
  const user = getUserData(userId);
  
  const existingIndex = user.achievements.findIndex(a => a.id === achievement.id);
  
  if (existingIndex >= 0) {
    user.achievements[existingIndex] = achievement;
  } else {
    user.achievements.push(achievement);
  }
  
  db.set(`users.${userId}`, user).write();
  
  return achievement;
}

module.exports = {
  db,
  getUserData,
  syncUserData,
  saveWorkout,
  deleteWorkout,
  saveAchievement,
};
```

### Authentication Middleware (backend/middleware/auth.js)

```javascript
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
      });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user exists
    const userData = db.getUserData(decoded.userId);
    if (!userData) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
      });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired',
      });
    }
    next(error);
  }
}

function generateToken(userId, email) {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

module.exports = {
  authenticate,
  generateToken,
};
```

### Input Validation Middleware (backend/middleware/validate.js)

```javascript
const { body, validationResult } = require('express-validator');

// Workout validation rules
const workoutRules = [
  body('type')
    .isIn(['running', 'squats', 'pushups', 'pullups', 'other'])
    .withMessage('Invalid workout type'),
  body('timestamp')
    .isISO8601()
    .withMessage('Invalid timestamp format'),
  body('data')
    .isObject()
    .withMessage('Data must be an object'),
  body('data.distance')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Distance must be between 0 and 100 km'),
  body('data.duration')
    .optional()
    .isFloat({ min: 0, max: 1440 })
    .withMessage('Duration must be between 0 and 1440 minutes'),
  body('data.reps')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('Reps must be between 0 and 1000'),
  body('data.sets')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Sets must be between 0 and 100'),
  body('data.weight')
    .optional()
    .isFloat({ min: 0, max: 500 })
    .withMessage('Weight must be between 0 and 500 kg'),
];

// Sync request validation
const validateSyncRequest = [
  body().isObject().withMessage('Request body must be an object'),
  body('workouts').optional().isArray().withMessage('Workouts must be an array'),
  body('achievements').optional().isArray().withMessage('Achievements must be an array'),
  body('profile').optional().isObject().withMessage('Profile must be an object'),
  ...workoutRules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: errors.array(),
      });
    }
    next();
  },
];

module.exports = {
  validateSyncRequest,
  workoutRules,
};
```

### Environment Variables (backend/.env.example)

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=30d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:8082,exp://localhost:8083

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=backend/logs/app.log

# Database
DB_FILE=backend/data/db.json
```

## Validation Rules

| Endpoint | Field | Rules | Error Message |
|----------|-------|-------|---------------|
| POST /sync | type | Required, one of: running, squats, pushups, pullups, other | "Invalid workout type" |
| POST /sync | timestamp | Required, valid ISO 8601 format | "Invalid timestamp format" |
| POST /sync | data | Required, object | "Data must be an object" |
| POST /sync | data.distance | Optional, 0-100 | "Distance must be between 0 and 100 km" |
| POST /sync | data.duration | Optional, 0-1440 | "Duration must be between 0 and 1440 minutes" |
| POST /sync | data.reps | Optional, 0-1000 | "Reps must be between 0 and 1000" |
| POST /sync | data.sets | Optional, 0-100 | "Sets must be between 0 and 100" |
| POST /sync | data.weight | Optional, 0-500 | "Weight must be between 0 and 500 kg" |
| All | Authorization | Required, valid JWT | "No authentication token provided" |

## Error Handling

| Scenario | HTTP Status | Response |
|----------|-------------|----------|
| Missing auth token | 401 | `{"error": "Unauthorized", "message": "No authentication token provided"}` |
| Invalid token | 401 | `{"error": "Unauthorized", "message": "Invalid token"}` |
| Token expired | 401 | `{"error": "Unauthorized", "message": "Token expired"}` |
| Validation error | 400 | `{"error": "Validation Error", "message": "Invalid request data", "details": [...]}` |
| Prototype pollution attempt | 400 | `{"error": "Bad Request", "message": "Invalid request format"}` |
| Rate limit exceeded | 429 | `{"error": "Too many requests", "message": "Rate limit exceeded"}` |
| User not found | 401 | `{"error": "Unauthorized", "message": "User not found"}` |
| Server error | 500 | `{"error": "Internal Server Error", "message": "An unexpected error occurred"}` |
| Route not found | 404 | `{"error": "Not Found", "message": "Route not found"}` |

**Error Handler Middleware:**
```javascript
// backend/utils/errors.js
const logger = require('./logger');

function errorHandler(err, req, res, next) {
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred'
    : err.message;
  
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = {
  errorHandler,
};
```

## Testing Requirements

### Unit Tests

- [ ] `getUserData()` returns correct user data structure
- [ ] `syncUserData()` merges workouts correctly
- [ ] `syncUserData()` resolves conflicts with last-write-wins
- [ ] `saveWorkout()` adds new workout to user data
- [ ] `deleteWorkout()` removes workout from user data
- [ ] `authenticate()` validates JWT tokens correctly
- [ ] `generateToken()` creates valid JWT tokens
- [ ] Input validation rejects invalid workout data
- [ ] Prototype pollution prevention blocks dangerous keys

### Integration Tests

- [ ] POST /api/sync uploads and stores workout data
- [ ] GET /api/sync returns user's synced data
- [ ] POST /api/sync/workout syncs single workout
- [ ] DELETE /api/sync/workout/:id removes workout
- [ ] Authentication required for all sync endpoints
- [ ] Rate limiting triggers after 100 requests/minute
- [ ] CORS allows configured origins only
- [ ] Health endpoint returns server status

### Security Tests

- [ ] Prototype pollution attempts are blocked
- [ ] SQL injection attempts are sanitized (N/A for lowdb, but test anyway)
- [ ] XSS attempts are sanitized
- [ ] Invalid JWT tokens are rejected
- [ ] Expired tokens are rejected
- [ ] Rate limiting prevents abuse
- [ ] Security headers are present in responses
- [ ] Input validation prevents oversized payloads

### Performance Tests

- [ ] Sync endpoint responds in < 500ms for typical payloads
- [ ] Server handles 100 concurrent requests without crashing
- [ ] Database operations complete in < 100ms
- [ ] Memory usage stays stable under load

## Definition of Done

- [ ] Server implemented following project conventions
- [ ] All endpoints functional and tested
- [ ] Security measures implemented (helmet, rate limiting, sanitization)
- [ ] Prototype pollution prevention verified
- [ ] Input validation on all endpoints
- [ ] Error handling covers all documented scenarios
- [ ] Environment variables configured
- [ ] Logging implemented for requests and errors
- [ ] All tests passing (`npm run test:backend`)
- [ ] Code reviewed and approved
- [ ] Documentation updated in QWEN.md
- [ ] Backend can run independently (`npm start` in backend/)
- [ ] Frontend integration tested with backend

---

## References

- **User Stories:** `docs/reqs/user-stories.md` - US-6.1, US-6.2
- **Features:** `docs/reqs/features.md` - Feature 6: Data Management
- **Existing Code:** `backend/index.js`, `backend/` directory structure
- **Tech Stack:** Express.js, lowdb, JWT, express-validator, helmet, cors

---

_Document History:_
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-16 | Product Team | Initial task specification |
