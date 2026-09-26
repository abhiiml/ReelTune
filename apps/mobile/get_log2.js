const fs = require('fs');
const url = fs.readFileSync('log_url_new.txt', 'utf8').trim();
require('child_process').exec(`node unzip.js "${url}"`, (err, stdout, stderr) => {
  console.log(stdout);
});
