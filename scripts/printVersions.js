const { execSync } = require('child_process');
const fs = require('fs');

try {
  execSync('npm view @react-navigation/bottom-tabs versions --json > versions.json', { stdio: 'inherit' });
  const versions = JSON.parse(fs.readFileSync('versions.json', 'utf8'));
  const v6 = versions.filter((v) => v.startsWith('6.'));
  console.log('Latest 5 v6 versions:', v6.slice(-5));
} catch (err) {
  console.error(err);
  process.exit(1);
}
