const fs = require('fs');
const path = require('path');

const coverageFile = process.argv[2] || './coverage/coverage-final.json';

if (!fs.existsSync(coverageFile)) {
  console.log('Coverage file not found:', coverageFile);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

/**
 * Normalize file path to show relative path from project root
 * Removes absolute paths like C:\Users\... or /home/runner/work/...
 * Shows paths like: src/storage.ts or trapp/src/storage.ts
 */
function normalizeFilePath(filePath) {
  // Normalize path separators to forward slashes for consistent display
  const normalized = filePath.replace(/\\/g, '/');
  
  // Handle absolute paths
  const parts = normalized.split('/');
  
  // Look for common project indicators
  const projectIndex = parts.findIndex(part => 
    part === 'trapp' || 
    part === 'workspace' || 
    part === 'work' ||
    part === 'home' // For Linux paths like /home/runner/work/...
  );
  
  if (projectIndex !== -1) {
    // If we found 'trapp', use that and everything after
    if (parts[projectIndex] === 'trapp') {
      const result = parts.slice(projectIndex).join('/');
      // Handle GitHub Actions pattern: trapp/trapp/... (duplicate)
      if (result.startsWith('trapp/trapp/')) {
        return result.replace('trapp/trapp/', 'trapp/');
      }
      return result;
    }
    // If we found 'workspace' or 'work', check if next part is project name
    if ((parts[projectIndex] === 'workspace' || parts[projectIndex] === 'work') && 
        parts[projectIndex + 1] === 'trapp') {
      return parts.slice(projectIndex + 1).join('/');
    }
    // If we found 'home', likely GitHub Actions Linux runner
    // Look for pattern: home/runner/work/repo-name/repo-name/path
    if (parts[projectIndex] === 'home' && parts.includes('runner')) {
      const runnerIndex = parts.indexOf('runner');
      if (runnerIndex !== -1 && parts[runnerIndex + 2] === 'trapp') {
        const result = parts.slice(runnerIndex + 2).join('/');
        // Handle duplicate pattern
        if (result.startsWith('trapp/trapp/')) {
          return result.replace('trapp/trapp/', 'trapp/');
        }
        return result;
      }
    }
  }
  
  // Fallback: show last 3 parts of path
  return parts.slice(-3).join('/');
}

console.log('| File | Lines | Covered | % |');
console.log('|------|-------|---------|---|');

Object.entries(data).forEach(([file, stats]) => {
  // Normalize the file path
  const normalizedPath = normalizeFilePath(file);
  
  // Count lines from statementMap
  const totalLines = Object.keys(stats.statementMap || {}).length;
  const coveredLines = Object.values(stats.s || {}).filter(v => v > 0).length;
  
  // Count functions
  const totalFuncs = Object.keys(stats.fnMap || {}).length;
  const coveredFuncs = Object.values(stats.f || {}).filter(v => v > 0).length;
  
  // Calculate percentage
  const pct = totalLines > 0 ? ((coveredLines / totalLines) * 100).toFixed(1) : 0;
  const funcPct = totalFuncs > 0 ? ((coveredFuncs / totalFuncs) * 100).toFixed(1) : 0;
  
  const emoji = pct >= 80 ? '✅' : pct >= 50 ? '⚠️' : '❌';
  console.log(`| ${emoji} ${normalizedPath} | ${totalLines} stmts (${totalFuncs} funcs) | ${coveredLines} (${coveredFuncs}) | ${pct}% (funcs: ${funcPct}%) |`);
});
