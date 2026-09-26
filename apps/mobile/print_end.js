const fs = require('fs');
const buf = fs.readFileSync('eas_build.log');
const text = buf.toString('utf-8');
const lines = text.split('\n');
console.log(lines.slice(Math.max(0, lines.length - 150)).join('\n'));
