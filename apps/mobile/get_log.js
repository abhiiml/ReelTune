const { execSync } = require('child_process');
const output = execSync('eas build:view fa3eb2dd-409a-4521-ae64-574a7ed9a4c7 --json').toString('utf8');
const json = JSON.parse(output.substring(output.indexOf('{')));
const url = json.logFiles[0];
execSync('node unzip.js "' + url + '"', {stdio: 'inherit'});
