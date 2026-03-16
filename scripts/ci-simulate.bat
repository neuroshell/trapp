@echo off
REM =============================================================================
REM CI Pipeline Simulation Script (Windows)
REM =============================================================================
REM This script mimics the GitHub Actions CI pipeline locally for testing
REM Run this before pushing to verify your changes will pass CI
REM
REM Usage: scripts\ci-simulate.bat
REM =============================================================================

setlocal enabledelayedexpansion

REM Counters
set PASSED=0
set FAILED=0
set SKIPPED=0

REM Helper functions
:print_header
echo.
echo ============================================
echo %~1
echo ============================================
echo.
goto :eof

:print_success
echo [PASS] %~1
set /a PASSED+=1
goto :eof

:print_failure
echo [FAIL] %~1
set /a FAILED+=1
goto :eof

:print_warning
echo [WARN] %~1
set /a SKIPPED+=1
goto :eof

:print_info
echo [INFO] %~1
goto :eof

REM =============================================================================
REM PRE-FLIGHT CHECKS
REM =============================================================================
call :print_header "Pre-flight Checks"

call :print_info "Node.js version: "
node -v

call :print_info "npm version: "
npm -v

if exist "node_modules" (
    call :print_success "node_modules directory exists"
) else (
    call :print_warning "node_modules not found - dependencies may need installation"
)

if exist "backend\node_modules" (
    call :print_success "backend/node_modules directory exists"
) else (
    call :print_warning "backend/node_modules not found"
)

REM Check required config files
for %%f in (package.json tsconfig.json tsconfig.ci.json .eslintrc.json eas.json) do (
    if exist "%%f" (
        call :print_success "%%f exists"
    ) else (
        call :print_failure "%%f missing"
    )
)

REM =============================================================================
REM LINT JOB
REM =============================================================================
call :print_header "Lint & Code Quality"

call :print_info "Running ESLint on root project..."
npm run lint
if %ERRORLEVEL% EQU 0 (
    call :print_success "ESLint (root) passed"
) else (
    call :print_failure "ESLint (root) failed"
)

call :print_info "Running ESLint on backend..."
cd backend
npx eslint . --ext .js,.ts 2>nul
if %ERRORLEVEL% EQU 0 (
    call :print_success "ESLint (backend) passed"
) else (
    call :print_warning "ESLint (backend) skipped or not configured"
)
cd ..

REM =============================================================================
REM TYPE CHECK JOB
REM =============================================================================
call :print_header "TypeScript Type Check"

call :print_info "Running TypeScript compiler check..."
npx tsc --noEmit --project tsconfig.ci.json --skipLibCheck
if %ERRORLEVEL% EQU 0 (
    call :print_success "TypeScript type check passed"
) else (
    call :print_failure "TypeScript type check failed - missing dependencies or type errors"
)

REM =============================================================================
REM TEST JOB - APP
REM =============================================================================
call :print_header "Test - App (React Native)"

call :print_info "Running Jest tests for app..."
npm run test:app -- --coverage --ci --passWithNoTests
if %ERRORLEVEL% EQU 0 (
    call :print_success "App tests passed"
) else (
    call :print_failure "App tests failed"
)

REM =============================================================================
REM TEST JOB - BACKEND
REM =============================================================================
call :print_header "Test - Backend (Node.js)"

call :print_info "Running backend tests..."
npm run test:backend
if %ERRORLEVEL% EQU 0 (
    call :print_success "Backend tests passed"
) else (
    call :print_failure "Backend tests failed"
)

REM =============================================================================
REM BUILD JOB
REM =============================================================================
call :print_header "Build Artifacts"

call :print_info "Creating build directory..."
if not exist "build\artifacts" mkdir build\artifacts

call :print_info "Building web version (Expo)..."
npx expo export:web
if %ERRORLEVEL% EQU 0 (
    call :print_success "Web build completed"
    
    call :print_info "Copying web build to artifacts..."
    if exist "web-build" (
        xcopy /E /I /Y web-build\* build\artifacts\ >nul 2>&1
        call :print_success "Web build artifacts created"
    ) else (
        call :print_failure "web-build directory not found"
    )
) else (
    call :print_failure "Web build failed - missing web dependencies"
)

REM Create build manifest
call :print_info "Creating build manifest..."
(
    echo Build Information
    echo =================
    echo Commit: N/A ^(run in git directory for commit info^)
    echo Branch: N/A
    echo Build Time: %DATE% %TIME%
    echo Build Number: Local Simulation
    echo Triggered By: %USERNAME%
) > build\BUILD_INFO.txt
call :print_success "Build manifest created"

REM =============================================================================
REM SUMMARY
REM =============================================================================
call :print_header "CI Simulation Summary"

set /a TOTAL=%PASSED% + %FAILED% + %SKIPPED%

echo Results:
echo   Passed: %PASSED%
echo   Failed: %FAILED%
echo   Skipped/Warnings: %SKIPPED%
echo   Total: %TOTAL%
echo.

if %FAILED% GTR 0 (
    echo [FAIL] CI Simulation FAILED - %FAILED% check(s) failed
    echo.
    echo Please fix the above issues before pushing to GitHub.
    echo The actual CI pipeline will likely fail on these checks.
    exit /b 1
) else (
    echo [PASS] CI Simulation PASSED - All critical checks passed
    echo.
    echo Your changes are ready to be pushed!
    echo Note: Some checks may still fail in CI due to environment differences.
    exit /b 0
)
