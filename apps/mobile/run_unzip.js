const fs = require('fs');
let url = fs.readFileSync('log_url_utf8.txt', 'utf8').replace(/\x00/g, '').trim();
require('child_process').exec(`node unzip.js "${url}"`, (err, stdout, stderr) => {
  console.log(stdout);
  console.error(stderr);
});
