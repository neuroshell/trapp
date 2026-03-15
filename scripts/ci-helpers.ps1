# CI/CD Helper Scripts for Trapp Tracker
# PowerShell version for Windows environments
# Usage: .\scripts\ci-helpers.ps1 <command> [options]

param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('setup', 'cache-clean', 'cache-warm', 'version-bump', 'changelog', 'build', 'test', 'help')]
    [string]$Command,
    
    [Parameter(Mandatory = $false)]
    [string]$Version,
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun
)

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$ROOT_DIR = Split-Path -Parent $SCRIPT_DIR
$BACKEND_DIR = Join-Path $ROOT_DIR "backend"

# Colors for output
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Error-Custom { Write-Host "[ERROR] $args" -ForegroundColor Red }

# ===========================================
# SETUP ENVIRONMENT
# ===========================================
function Invoke-Setup {
    Write-Info "Setting up development environment..."
    
    # Check Node.js version
    $nodeVersion = node --version
    Write-Info "Node.js version: $nodeVersion"
    
    # Check npm version
    $npmVersion = npm --version
    Write-Info "npm version: $npmVersion"
    
    # Install root dependencies
    Write-Info "Installing root dependencies..."
    Set-Location $ROOT_DIR
    npm ci
    
    # Install backend dependencies
    Write-Info "Installing backend dependencies..."
    Set-Location $BACKEND_DIR
    npm ci
    
    # Verify installation
    Write-Info "Verifying installation..."
    Set-Location $ROOT_DIR
    $testResult = npm run lint
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Environment setup completed successfully!"
    } else {
        Write-Warning "Setup completed with warnings"
    }
}

# ===========================================
# CACHE MANAGEMENT
# ===========================================
function Invoke-CacheClean {
    Write-Info "Cleaning caches..."
    
    # Clean npm cache
    Write-Info "Cleaning npm cache..."
    npm cache clean --force
    
    # Remove node_modules
    Write-Info "Removing node_modules directories..."
    Remove-Item -Path (Join-Path $ROOT_DIR "node_modules") -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path (Join-Path $BACKEND_DIR "node_modules") -Recurse -Force -ErrorAction SilentlyContinue
    
    # Remove lock files (optional)
    # Remove-Item -Path (Join-Path $ROOT_DIR "package-lock.json") -Force -ErrorAction SilentlyContinue
    # Remove-Item -Path (Join-Path $BACKEND_DIR "package-lock.json") -Force -ErrorAction SilentlyContinue
    
    # Clean Expo cache
    Write-Info "Cleaning Expo cache..."
    npx expo start --clear
    
    Write-Success "Cache cleaned successfully!"
}

function Invoke-CacheWarm {
    Write-Info "Warming up caches..."
    
    Set-Location $ROOT_DIR
    
    # Install dependencies to populate cache
    Write-Info "Installing dependencies..."
    npm ci
    
    Set-Location $BACKEND_DIR
    npm ci
    
    # Run a test build
    Set-Location $ROOT_DIR
    Write-Info "Running test build..."
    npx tsc --noEmit
    
    Write-Success "Cache warmed successfully!"
}

# ===========================================
# VERSION BUMPING
# ===========================================
function Invoke-VersionBump {
    param(
        [string]$NewVersion,
        [switch]$DryRun
    )
    
    if (-not $NewVersion) {
        # Auto-increment patch version
        $packageJson = Get-Content (Join-Path $ROOT_DIR "package.json") | ConvertFrom-Json
        $currentVersion = $packageJson.version
        $parts = $currentVersion.Split('.')
        $newPatch = [int]$parts[2] + 1
        $NewVersion = "$($parts[0]).$($parts[1]).$newPatch"
        Write-Info "Auto-incrementing version: $currentVersion -> $NewVersion"
    }
    
    Write-Info "Bumping version to $NewVersion..."
    
    if ($DryRun) {
        Write-Info "[DRY RUN] Would update version to $NewVersion"
        return
    }
    
    # Update root package.json
    $packageJson = Get-Content (Join-Path $ROOT_DIR "package.json") | ConvertFrom-Json
    $packageJson.version = $NewVersion
    $packageJson | ConvertTo-Json -Depth 100 | Set-Content (Join-Path $ROOT_DIR "package.json")
    
    # Update app.json (Expo config)
    $appJson = Get-Content (Join-Path $ROOT_DIR "app.json") | ConvertFrom-Json
    $appJson.expo.version = $NewVersion
    $appJson | ConvertTo-Json -Depth 100 | Set-Content (Join-Path $ROOT_DIR "app.json")
    
    # Update backend package.json
    $backendPackageJson = Get-Content (Join-Path $BACKEND_DIR "package.json") | ConvertFrom-Json
    $backendPackageJson.version = $NewVersion
    $backendPackageJson | ConvertTo-Json -Depth 100 | Set-Content (Join-Path $BACKEND_DIR "package.json")
    
    Write-Success "Version bumped to $NewVersion"
}

# ===========================================
# CHANGELOG GENERATION
# ===========================================
function Invoke-Changelog {
    Write-Info "Generating changelog..."
    
    $changelogPath = Join-Path $ROOT_DIR "CHANGELOG.md"
    $lastTag = git describe --tags --abbrev=0 2>$null
    
    if ($lastTag) {
        Write-Info "Last tag: $lastTag"
        $commits = git log "$lastTag..HEAD" --pretty=format:"* %s (%h)" 2>$null
    } else {
        Write-Info "No tags found, using all commits"
        $commits = git log --pretty=format:"* %s (%h)" --max-count=50 2>$null
    }
    
    $date = Get-Date -Format "yyyy-MM-dd"
    $version = (Get-Content (Join-Path $ROOT_DIR "package.json") | ConvertFrom-Json).version
    
    $changelog = @"
# Changelog

## v$version - $date

### Changes
$commits

---
Generated by CI Helper Script
"@
    
    if ($DryRun) {
        Write-Info "[DRY RUN] Would create CHANGELOG.md with:"
        Write-Host $changelog
        return
    }
    
    Set-Content -Path $changelogPath -Value $changelog
    Write-Success "Changelog generated: $changelogPath"
}

# ===========================================
# BUILD HELPERS
# ===========================================
function Invoke-Build {
    param(
        [ValidateSet('all', 'web', 'app', 'backend')]
        [string]$Target = 'all'
    )
    
    Write-Info "Building target: $Target"
    
    Set-Location $ROOT_DIR
    
    switch ($Target) {
        'all' {
            Write-Info "Building web app..."
            npx expo export:web
            Write-Info "Building backend..."
            Set-Location $BACKEND_DIR
            node --check index.js
        }
        'web' {
            Write-Info "Building web app..."
            npx expo export:web
        }
        'app' {
            Write-Info "Checking app TypeScript..."
            npx tsc --noEmit
        }
        'backend' {
            Write-Info "Checking backend..."
            Set-Location $BACKEND_DIR
            node --check index.js
        }
    }
    
    Write-Success "Build completed!"
}

# ===========================================
# TEST HELPERS
# ===========================================
function Invoke-Test {
    param(
        [ValidateSet('all', 'app', 'backend')]
        [string]$Target = 'all',
        [switch]$Coverage
    )
    
    Write-Info "Running tests for target: $Target"
    
    Set-Location $ROOT_DIR
    
    $coverageFlag = ""
    if ($Coverage) {
        $coverageFlag = " --coverage"
    }
    
    switch ($Target) {
        'all' {
            Write-Info "Running app tests..."
            npm run test:app -- $coverageFlag
            Write-Info "Running backend tests..."
            npm run test:backend
        }
        'app' {
            npm run test:app -- $coverageFlag
        }
        'backend' {
            npm run test:backend
        }
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "All tests passed!"
    } else {
        Write-Error-Custom "Tests failed!"
        exit 1
    }
}

# ===========================================
# HELP
# ===========================================
function Show-Help {
    Write-Host @"
Trapp Tracker CI Helper Scripts
================================

Usage: .\scripts\ci-helpers.ps1 <command> [options]

Commands:
  setup         Setup development environment (install dependencies)
  cache-clean   Clean all caches (npm, node_modules, expo)
  cache-warm    Warm up caches for faster CI builds
  version-bump  Bump version (use --version X.X.X for specific version)
  changelog     Generate changelog from git commits
  build         Build project (use -Target: web|app|backend|all)
  test          Run tests (use -Target: all|app|backend, -Coverage for coverage)
  help          Show this help message

Options:
  -Version      Specific version for version-bump
  -DryRun       Show what would be done without making changes
  -Target       Build/test target (all, web, app, backend)
  -Coverage     Include coverage reporting in tests

Examples:
  .\scripts\ci-helpers.ps1 setup
  .\scripts\ci-helpers.ps1 version-bump -Version 1.2.3
  .\scripts\ci-helpers.ps1 changelog -DryRun
  .\scripts\ci-helpers.ps1 build -Target web
  .\scripts\ci-helpers.ps1 test -Target all -Coverage

"@ -ForegroundColor Cyan
}

# ===========================================
# MAIN
# ===========================================
switch ($Command) {
    'setup' { Invoke-Setup }
    'cache-clean' { Invoke-CacheClean }
    'cache-warm' { Invoke-CacheWarm }
    'version-bump' { Invoke-VersionBump -NewVersion $Version -DryRun:$DryRun }
    'changelog' { Invoke-Changelog -DryRun:$DryRun }
    'build' { Invoke-Build }
    'test' { Invoke-Test }
    'help' { Show-Help }
    default { 
        Write-Error-Custom "Unknown command: $Command"
        Show-Help
        exit 1
    }
}
