const fs = require('fs');
const path = require('path');

const coverageFile = process.argv[2] || './coverage/coverage-final.json';

if (!fs.existsSync(coverageFile)) {
  console.log('Coverage file not found:', coverageFile);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));

console.log('| File | Lines | Covered | % |');
console.log('|------|-------|---------|---|');

Object.entries(data).forEach(([file, stats]) => {
  const fileName = file.split('/').slice(-2).join('/');
  
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
  console.log(`| ${emoji} ${fileName} | ${totalLines} stmts (${totalFuncs} funcs) | ${coveredLines} (${coveredFuncs}) | ${pct}% (funcs: ${funcPct}%) |`);
});
