# Backend CD - Quick Start Guide

## What We Built

✅ **Automated Backend Deployment** to Netlify Functions
✅ **Serverless Express** using `serverless-http`
✅ **CI/CD Pipeline** with health checks and rollback
✅ **Auto-update Frontend** with new API URL

## Architecture

```
Frontend (GitHub Pages)
         ↓
         │ HTTP Requests
         ↓
Backend (Netlify Functions)
         ↓
         │ JWT Auth + Rate Limiting
         ↓
lowdb (JSON File Storage)
```

## Setup (5 Minutes)

### 1. Create Netlify Account

1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"

### 2. Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

```bash
# Netlify Credentials
NETLIFY_AUTH_TOKEN=<get_from_netlify_user_settings>
NETLIFY_SITE_ID=<get_from_netlify_site_settings>

# Backend Configuration  
JWT_SECRET=<generate_random_64_char_string>
ALLOWED_ORIGINS=https://your-domain.com
```

### 3. Deploy

Push to main:
```bash
git add .
git commit -m "feat: add backend CD pipeline"
git push origin main
```

GitHub Actions will automatically:
- ✅ Build the backend
- ✅ Run tests
- ✅ Deploy to Netlify
- ✅ Health check
- ✅ Update frontend `.env` with API URL

## Manual Deployment

```bash
cd backend

# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=netlify
```

## Verify Deployment

```bash
# Get API URL from GitHub Actions output
API_URL=https://your-site.netlify.app/api

# Test health endpoint
curl $API_URL/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":123}
```

## Update Frontend

After backend deployment, update frontend `.env`:

```bash
EXPO_PUBLIC_API_URL=https://your-site.netlify.app/api
```

Then rebuild frontend:
```bash
npm run build:web
```

## Monitoring

### View Logs

Netlify Dashboard → Functions → api → Logs

### Check Health

```bash
curl https://your-site.netlify.app/api/health
```

### View Metrics

Netlify Dashboard → Analytics → Functions

## Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Common issues:
   - Missing secrets
   - Test failures
   - Build errors

### Function Errors

1. Check Netlify function logs
2. Common issues:
   - Missing environment variables
   - Database file not found
   - CORS errors

### Frontend Can't Connect

1. Verify `EXPO_PUBLIC_API_URL` is correct
2. Check CORS settings in Netlify env vars
3. Ensure HTTPS URLs

## Cost

**Free Tier:**
- ✅ 125,000 function invocations/month
- ✅ 100GB-hours compute
- ✅ Perfect for MVP

**Pro ($19/mo):**
- ✅ 1M invocations
- ✅ No cold starts
- ✅ Production ready

## Next Steps

1. ✅ Setup complete
2. ✅ Test sync functionality
3. ⏳ Configure custom domain (optional)
4. ⏳ Setup monitoring alerts
5. ⏳ Configure database backups

## Resources

- [Full Documentation](docs/tech/BACKEND-DEPLOYMENT-NETLIFY.md)
- [CD Workflow](.github/workflows/cd-backend.yml)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)

---

**Questions?** Check the full docs or open an issue!
