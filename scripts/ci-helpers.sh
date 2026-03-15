#!/bin/bash
# CI/CD Helper Scripts for Trapp Tracker
# Bash version for Linux/Mac environments and CI/CD pipelines
# Usage: ./scripts/ci-helpers.sh <command> [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/backend"

# Logging functions
log_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ===========================================
# SETUP ENVIRONMENT
# ===========================================
setup_environment() {
    log_info "Setting up development environment..."
    
    # Check Node.js version
    local node_version=$(node --version)
    log_info "Node.js version: $node_version"
    
    # Check npm version
    local npm_version=$(npm --version)
    log_info "npm version: $npm_version"
    
    # Install root dependencies
    log_info "Installing root dependencies..."
    cd "$ROOT_DIR"
    npm ci
    
    # Install backend dependencies
    log_info "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm ci
    
    # Verify installation
    log_info "Verifying installation..."
    cd "$ROOT_DIR"
    if npm run lint; then
        log_success "Environment setup completed successfully!"
    else
        log_warning "Setup completed with warnings"
    fi
}

# ===========================================
# CACHE MANAGEMENT
# ===========================================
cache_clean() {
    log_info "Cleaning caches..."
    
    # Clean npm cache
    log_info "Cleaning npm cache..."
    npm cache clean --force
    
    # Remove node_modules
    log_info "Removing node_modules directories..."
    rm -rf "$ROOT_DIR/node_modules"
    rm -rf "$BACKEND_DIR/node_modules"
    
    # Clean Expo cache
    log_info "Cleaning Expo cache..."
    cd "$ROOT_DIR"
    npx expo start --clear || true
    
    log_success "Cache cleaned successfully!"
}

cache_warm() {
    log_info "Warming up caches..."
    
    cd "$ROOT_DIR"
    
    # Install dependencies to populate cache
    log_info "Installing dependencies..."
    npm ci
    
    cd "$BACKEND_DIR"
    npm ci
    
    # Run a test build
    cd "$ROOT_DIR"
    log_info "Running test build..."
    npx tsc --noEmit
    
    log_success "Cache warmed successfully!"
}

# ===========================================
# VERSION BUMPING
# ===========================================
version_bump() {
    local new_version="$1"
    local dry_run="$2"
    
    if [ -z "$new_version" ]; then
        # Auto-increment patch version
        local current_version=$(node -p "require('./package.json').version")
        local major=$(echo "$current_version" | cut -d. -f1)
        local minor=$(echo "$current_version" | cut -d. -f2)
        local patch=$(echo "$current_version" | cut -d. -f3)
        new_patch=$((patch + 1))
        new_version="$major.$minor.$new_patch"
        log_info "Auto-incrementing version: $current_version -> $new_version"
    fi
    
    log_info "Bumping version to $new_version..."
    
    if [ "$dry_run" = "true" ]; then
        log_info "[DRY RUN] Would update version to $new_version"
        return
    fi
    
    # Update root package.json
    cd "$ROOT_DIR"
    node -e "
        const pkg = require('./package.json');
        pkg.version = '$new_version';
        require('fs').writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    
    # Update app.json (Expo config)
    node -e "
        const app = require('./app.json');
        app.expo.version = '$new_version';
        require('fs').writeFileSync('./app.json', JSON.stringify(app, null, 2) + '\n');
    "
    
    # Update backend package.json
    node -e "
        const pkg = require('./backend/package.json');
        pkg.version = '$new_version';
        require('fs').writeFileSync('./backend/package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    
    log_success "Version bumped to $new_version"
}

# ===========================================
# CHANGELOG GENERATION
# ===========================================
generate_changelog() {
    local dry_run="$1"
    
    log_info "Generating changelog..."
    
    local changelog_path="$ROOT_DIR/CHANGELOG.md"
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    local version=$(node -p "require('./package.json').version")
    local date=$(date +%Y-%m-%d)
    
    if [ -n "$last_tag" ]; then
        log_info "Last tag: $last_tag"
        local commits=$(git log "$last_tag..HEAD" --pretty=format:"* %s (%h)" 2>/dev/null || echo "")
    else
        log_info "No tags found, using all commits"
        local commits=$(git log --pretty=format:"* %s (%h)" --max-count=50 2>/dev/null || echo "")
    fi
    
    local changelog="# Changelog

## v$version - $date

### Changes
$commits

---
Generated by CI Helper Script"
    
    if [ "$dry_run" = "true" ]; then
        log_info "[DRY RUN] Would create CHANGELOG.md with:"
        echo "$changelog"
        return
    fi
    
    echo "$changelog" > "$changelog_path"
    log_success "Changelog generated: $changelog_path"
}

# ===========================================
# BUILD HELPERS
# ===========================================
do_build() {
    local target="${1:-all}"
    
    log_info "Building target: $target"
    
    cd "$ROOT_DIR"
    
    case "$target" in
        all)
            log_info "Building web app..."
            npx expo export:web
            log_info "Building backend..."
            cd "$BACKEND_DIR"
            node --check index.js
            ;;
        web)
            log_info "Building web app..."
            npx expo export:web
            ;;
        app)
            log_info "Checking app TypeScript..."
            npx tsc --noEmit
            ;;
        backend)
            log_info "Checking backend..."
            cd "$BACKEND_DIR"
            node --check index.js
            ;;
        *)
            log_error "Unknown target: $target"
            exit 1
            ;;
    esac
    
    log_success "Build completed!"
}

# ===========================================
# TEST HELPERS
# ===========================================
do_test() {
    local target="${1:-all}"
    local coverage="$2"
    
    log_info "Running tests for target: $target"
    
    cd "$ROOT_DIR"
    
    local coverage_flag=""
    if [ "$coverage" = "true" ]; then
        coverage_flag="--coverage"
    fi
    
    case "$target" in
        all)
            log_info "Running app tests..."
            npm run test:app -- $coverage_flag
            log_info "Running backend tests..."
            npm run test:backend
            ;;
        app)
            npm run test:app -- $coverage_flag
            ;;
        backend)
            npm run test:backend
            ;;
        *)
            log_error "Unknown target: $target"
            exit 1
            ;;
    esac
    
    log_success "All tests passed!"
}

# ===========================================
# CI SETUP (for GitHub Actions)
# ===========================================
ci_setup() {
    log_info "Running CI setup..."
    
    cd "$ROOT_DIR"
    
    # Install dependencies
    log_info "Installing root dependencies..."
    npm ci
    
    # Install backend dependencies
    log_info "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm ci
    
    log_success "CI setup completed!"
}

# ===========================================
# HELP
# ===========================================
show_help() {
    cat << EOF
Trapp Tracker CI Helper Scripts
================================

Usage: ./scripts/ci-helpers.sh <command> [options]

Commands:
  setup         Setup development environment (install dependencies)
  cache-clean   Clean all caches (npm, node_modules, expo)
  cache-warm    Warm up caches for faster CI builds
  version-bump  Bump version (pass version number as argument)
  changelog     Generate changelog from git commits
  build         Build project (pass target: web|app|backend|all)
  test          Run tests (pass target: all|app|backend, --coverage for coverage)
  ci-setup      Setup for CI environment
  help          Show this help message

Options:
  --dry-run     Show what would be done without making changes
  --coverage    Include coverage reporting in tests

Examples:
  ./scripts/ci-helpers.sh setup
  ./scripts/ci-helpers.sh version-bump 1.2.3
  ./scripts/ci-helpers.sh changelog --dry-run
  ./scripts/ci-helpers.sh build web
  ./scripts/ci-helpers.sh test all --coverage
  ./scripts/ci-helpers.sh ci-setup

EOF
}

# ===========================================
# MAIN
# ===========================================
command="${1:-help}"
shift || true

# Parse options
dry_run="false"
coverage="false"
target=""

for arg in "$@"; do
    case "$arg" in
        --dry-run)
            dry_run="true"
            ;;
        --coverage)
            coverage="true"
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            if [ -z "$target" ]; then
                target="$arg"
            fi
            ;;
    esac
done

case "$command" in
    setup)
        setup_environment
        ;;
    cache-clean)
        cache_clean
        ;;
    cache-warm)
        cache_warm
        ;;
    version-bump)
        version_bump "$target" "$dry_run"
        ;;
    changelog)
        generate_changelog "$dry_run"
        ;;
    build)
        do_build "$target"
        ;;
    test)
        do_test "$target" "$coverage"
        ;;
    ci-setup)
        ci_setup
        ;;
    help)
        show_help
        ;;
    *)
        log_error "Unknown command: $command"
        show_help
        exit 1
        ;;
esac
