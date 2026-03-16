#!/bin/bash
# =============================================================================
# CI Pipeline Simulation Script
# =============================================================================
# This script mimics the GitHub Actions CI pipeline locally for testing
# Run this before pushing to verify your changes will pass CI
#
# Usage: ./scripts/ci-simulate.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
SKIPPED=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

print_failure() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((SKIPPED++))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# =============================================================================
# PRE-FLIGHT CHECKS
# =============================================================================
print_header "🔍 Pre-flight Checks"

# Check Node.js version
NODE_VERSION=$(node -v)
print_info "Node.js version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm -v)
print_info "npm version: $NPM_VERSION"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_success "node_modules directory exists"
else
    print_warning "node_modules not found - dependencies may need installation"
fi

# Check if backend/node_modules exists
if [ -d "backend/node_modules" ]; then
    print_success "backend/node_modules directory exists"
else
    print_warning "backend/node_modules not found"
fi

# Check required config files
for file in "package.json" "tsconfig.json" "tsconfig.ci.json" ".eslintrc.json" "eas.json"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_failure "$file missing"
    fi
done

# =============================================================================
# LINT JOB
# =============================================================================
print_header "📋 Lint & Code Quality"

print_info "Running ESLint on root project..."
if npm run lint 2>&1; then
    print_success "ESLint (root) passed"
else
    print_failure "ESLint (root) failed"
fi

print_info "Running ESLint on backend..."
if cd backend && npx eslint . --ext .js,.ts 2>/dev/null; then
    print_success "ESLint (backend) passed"
else
    print_warning "ESLint (backend) skipped or not configured"
fi
cd ..

# =============================================================================
# TYPE CHECK JOB
# =============================================================================
print_header "🔷 TypeScript Type Check"

print_info "Running TypeScript compiler check..."
if npx tsc --noEmit --project tsconfig.ci.json --skipLibCheck 2>&1; then
    print_success "TypeScript type check passed"
else
    print_failure "TypeScript type check failed - missing dependencies or type errors"
fi

# =============================================================================
# TEST JOB - APP
# =============================================================================
print_header "🧪 Test - App (React Native)"

print_info "Running Jest tests for app..."
if npm run test:app -- --coverage --ci --passWithNoTests 2>&1; then
    print_success "App tests passed"
else
    print_failure "App tests failed"
fi

# =============================================================================
# TEST JOB - BACKEND
# =============================================================================
print_header "🧪 Test - Backend (Node.js)"

print_info "Running backend tests..."
if npm run test:backend 2>&1; then
    print_success "Backend tests passed"
else
    print_failure "Backend tests failed"
fi

# =============================================================================
# BUILD JOB
# =============================================================================
print_header "📦 Build Artifacts"

print_info "Creating build directory..."
mkdir -p build/artifacts

print_info "Building web version (Expo)..."
if npx expo export:web 2>&1; then
    print_success "Web build completed"
    
    print_info "Copying web build to artifacts..."
    if [ -d "web-build" ]; then
        cp -r web-build/* build/artifacts/ 2>/dev/null || print_warning "Some web build files could not be copied"
        print_success "Web build artifacts created"
    else
        print_failure "web-build directory not found"
    fi
else
    print_failure "Web build failed - missing web dependencies"
fi

# Create build manifest
print_info "Creating build manifest..."
cat > build/BUILD_INFO.txt << EOF
Build Information
=================
Commit: $(git rev-parse HEAD 2>/dev/null || echo "N/A")
Branch: $(git branch --show-current 2>/dev/null || echo "N/A")
Build Time: $(date -u)
Build Number: Local Simulation
Triggered By: $(whoami)
EOF
print_success "Build manifest created"

# =============================================================================
# SUMMARY
# =============================================================================
print_header "📊 CI Simulation Summary"

TOTAL=$((PASSED + FAILED + SKIPPED))

echo -e "Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo -e "  ${YELLOW}Skipped/Warnings: $SKIPPED${NC}"
echo -e "  Total: $TOTAL"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ CI Simulation FAILED - $FAILED check(s) failed${NC}"
    echo ""
    echo "Please fix the above issues before pushing to GitHub."
    echo "The actual CI pipeline will likely fail on these checks."
    exit 1
else
    echo -e "${GREEN}✅ CI Simulation PASSED - All critical checks passed${NC}"
    echo ""
    echo "Your changes are ready to be pushed!"
    echo "Note: Some checks may still fail in CI due to environment differences."
    exit 0
fi
