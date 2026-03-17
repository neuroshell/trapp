#!/bin/bash
# Backend Netlify Deployment Setup Script
# Automates initial setup and configuration

set -e

echo "🚀 Trapp Tracker Backend - Netlify Setup"
echo "========================================="
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found"
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
fi

echo "✅ Netlify CLI installed"
echo ""

# Check if logged in
echo "Checking Netlify authentication..."
if ! netlify api --listSites &> /dev/null; then
    echo "🔐 Please login to Netlify"
    netlify login
fi

echo "✅ Authenticated with Netlify"
echo ""

# Initialize site
echo "📦 Initialize Netlify site"
netlify init

# Get site ID
SITE_ID=$(netlify api --listSites | jq -r '.[0].id')
echo "✅ Site ID: $SITE_ID"
echo ""

# Set environment variables
echo "🔧 Setting environment variables..."

# Generate JWT secret if not exists
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo "Generated new JWT_SECRET"
fi

# Set required env vars
netlify env:set JWT_SECRET "$JWT_SECRET"
netlify env:set NODE_ENV production
netlify env:set ALLOWED_ORIGINS "*"
netlify env:set BCRYPT_ROUNDS 12
netlify env:set JWT_EXPIRY 30d
netlify env:set LOG_LEVEL info

echo "✅ Environment variables configured"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd backend
npm install
npm install serverless-http

# Create netlify directory structure
mkdir -p netlify/functions
cp netlify/functions/api.js netlify/functions/api.js 2>/dev/null || true

echo "✅ Dependencies installed"
echo ""

# Test deployment
echo "🧪 Testing deployment..."
netlify deploy --dir=netlify --message="Test deployment"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Add GitHub secrets:"
echo "      - NETLIFY_AUTH_TOKEN"
echo "      - NETLIFY_SITE_ID"
echo "      - JWT_SECRET"
echo "      - ALLOWED_ORIGINS"
echo ""
echo "   2. Push to main to trigger automated deployment"
echo ""
echo "   3. Update frontend .env with new API URL"
echo ""
echo "🎉 Happy deploying!"
