const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
pkg.scripts['vercel-build'] = 'echo "Web deployment - Electron build skipped"';
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log('package.json updated');
