# Backend Deployment Guide - Netlify Functions

## Overview

The Trapp Tracker backend is deployed to Netlify as serverless functions using `serverless-http` to wrap the Express application.

## Architecture

```
┌─────────────────┐
│   Netlify CDN   │
│  (Global Edge)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Netlify Func-  │
│  tions (AWS)    │
│  ┌───────────┐  │
│  │ api.js    │  │
│  │ (Express) │  │
│  └───────────┘  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  JSON File DB   │
│  (lowdb)        │
└─────────────────┘
```

## Quick Start

### 1. Create Netlify Account

1. Go to [Netlify](https://netlify.com)
2. Sign up with GitHub
3. Create a new site

### 2. Configure GitHub Secrets

Add these secrets to your GitHub repository:

```bash
# Netlify Authentication
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_site_id

# Backend Configuration
JWT_SECRET=your_64_char_random_secret
ALLOWED_ORIGINS=https://your-domain.com
```

### 3. Deploy

The backend will automatically deploy when you:
- Push to `main` branch (changes in `backend/`)
- Manually trigger the workflow from GitHub Actions

## Manual Deployment

### Using Netlify CLI

```bash
cd backend

# Install dependencies
npm install

# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Deploy to production
netlify deploy --prod --dir=netlify
```

### Set Environment Variables

```bash
# Via CLI
netlify env:set JWT_SECRET your_secret_here
netlify env:set NODE_ENV production
netlify env:set ALLOWED_ORIGINS https://your-domain.com

# Or via Netlify UI:
# Site Settings → Environment Variables → Add variable
```

## Project Structure

```
backend/
├── index.js                    # Express app
├── netlify/
│   ├── functions/
│   │   └── api.js             # Netlify function handler
│   └── data/
│       └── db.json            # Database (gitignored)
├── netlify.toml               # Netlify configuration
├── package.json               # Dependencies
└── routes/
    ├── auth.js                # Auth endpoints
    ├── sync.js                # Sync endpoints
    └── health.js              # Health endpoints
```

## Configuration

### netlify.toml

```toml
[build]
  install_command = "npm install"
  command = "echo 'Backend build complete'"
  publish = "netlify"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
  included_files = ["data/**"]
  external = ["lowdb", "bcryptjs", "jsonwebtoken", ...]

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200
  force = true
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | ✅ | - | Secret key for JWT signing (min 32 chars) |
| `NODE_ENV` | ✅ | `development` | Environment (`production`, `staging`) |
| `ALLOWED_ORIGINS` | ✅ | `*` | CORS allowed origins (comma-separated) |
| `JWT_EXPIRY` | ❌ | `30d` | JWT token expiration |
| `BCRYPT_ROUNDS` | ❌ | `10` | Password hashing rounds |
| `RATE_LIMIT_WINDOW_MS` | ❌ | `60000` | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | ❌ | `100` | Max requests per window |
| `LOG_LEVEL` | ❌ | `info` | Logging level |
| `DB_FILE` | ❌ | `/var/task/data/db.json` | Database file path |

## API Endpoints

All endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token

### Sync
- `GET /api/sync` - Download user data
- `POST /api/sync` - Upload user data
- `POST /api/sync/workout` - Sync single workout
- `PUT /api/sync/workout/:id` - Update workout
- `DELETE /api/sync/workout/:id` - Delete workout
- `POST /api/sync/achievement` - Sync achievement
- `POST /api/sync/device` - Register device

### Health
- `GET /api/health` - Health check
- `GET /api/health/ready` - Readiness check

## Testing

### Local Testing

```bash
cd backend

# Install Netlify CLI
npm install -g netlify-cli

# Run functions locally
netlify dev

# Test endpoints
curl http://localhost:8888/.netlify/functions/api/health
```

### Production Testing

```bash
# Get your Netlify URL
API_URL=https://your-site.netlify.app/api

# Test health endpoint
curl $API_URL/health

# Test authentication
curl -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Monitoring

### Logs

View logs in Netlify UI:
1. Go to your site dashboard
2. Navigate to **Functions** → **api**
3. Click **Logs** tab

Or use CLI:
```bash
netlify functions:log api
```

### Health Checks

The workflow automatically performs health checks after deployment.

Manual health check:
```bash
curl https://your-site.netlify.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-17T18:00:00.000Z",
  "uptime": 12345,
  "environment": "production",
  "version": "0.1.0"
}
```

## Database Management

### Backup

```bash
# Download database via SSH/FTP (if using persistent storage)
# Or export via API:

curl https://your-site.netlify.app/api/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o backup.json
```

### Restore

```bash
# Import database via API
curl -X POST https://your-site.netlify.app/api/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @backup.json
```

### Migration to PostgreSQL

When scaling beyond lowdb:

1. **Set up PostgreSQL** (Netlify PostgreSQL or external)
2. **Update backend** to use `pg` instead of `lowdb`
3. **Migrate data**:
   ```bash
   node scripts/migrate-to-postgres.js
   ```
4. **Update environment variables**:
   ```bash
   netlify env:set DATABASE_URL postgresql://...
   ```

## CI/CD Pipeline

### Automatic Deployment

The backend deploys automatically when:
- Pushing to `main` with changes in `backend/`
- Manually triggering the workflow

### Deployment Process

1. **Build & Test**
   - Install dependencies
   - Run tests
   - Build for Netlify

2. **Deploy**
   - Upload to Netlify
   - Set environment variables
   - Wait for propagation

3. **Health Check**
   - Verify `/api/health` returns 200
   - Retry up to 5 times
   - Report status

4. **Update Frontend**
   - Update `.env` with new API URL
   - Commit and push

### Rollback

If deployment fails:
1. Check workflow logs for errors
2. Fix issues in code
3. Push new commit (auto-redeploys)
4. Or manually trigger previous successful deploy

## Troubleshooting

### Function Timeout

**Problem:** Functions timing out

**Solution:**
- Check function execution time (max 10s on free tier)
- Optimize database queries
- Consider upgrading Netlify plan

### Database Not Persisting

**Problem:** Data lost after deployment

**Solution:**
- lowdb stores in `/var/task/` (ephemeral)
- Use external database (PostgreSQL, MongoDB)
- Or use Netlify Blobs for persistent storage

### CORS Errors

**Problem:** Frontend can't connect

**Solution:**
```bash
# Update ALLOWED_ORIGINS
netlify env:set ALLOWED_ORIGINS https://your-frontend-domain.com
```

### Cold Starts

**Problem:** Slow first request

**Solution:**
- Upgrade to Pro plan (dedicated instances)
- Use provisioned concurrency
- Optimize function initialization

## Cost Estimation

### Free Tier
- ✅ 125,000 function invocations/month
- ✅ 100GB-hours compute time
- ✅ Suitable for MVP

### Pro Plan ($19/month)
- ✅ 1M function invocations
- ✅ Dedicated instances (no cold starts)
- ✅ Better for production

### Team Plan ($49/month)
- ✅ Unlimited invocations
- ✅ Advanced monitoring
- ✅ For high-traffic apps

## Security

### Best Practices

1. **Use strong JWT_SECRET** (64+ characters)
2. **Enable CORS only for your domain**
3. **Rate limiting enabled** (100 req/min)
4. **HTTPS only** (automatic with Netlify)
5. **Regular dependency updates**
6. **Monitor logs for suspicious activity**

### Secrets Management

Never commit secrets! Use:
- GitHub Secrets for CI/CD
- Netlify Environment Variables for runtime
- `.env` file (gitignored) for local dev

## Support

- **Netlify Docs**: https://docs.netlify.com
- **Serverless-HTTP**: https://github.com/dougmoscrop/serverless-http
- **Issues**: GitHub repository issues

---

**Last Updated:** March 17, 2026
**Version:** 0.1.0
