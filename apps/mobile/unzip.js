const https = require('https');
const zlib = require('zlib');

const url = process.argv[2];

https.get(url, (res) => {
  let stream = res;
  if (res.headers['content-encoding'] === 'gzip') stream = res.pipe(zlib.createGunzip());
  else if (res.headers['content-encoding'] === 'br') stream = res.pipe(zlib.createBrotliDecompress());
  
  let data = '';
  stream.on('data', chunk => {
    data += chunk.toString('utf-8');
    if (data.length > 5000000) data = data.slice(-5000000); // 5MB buffer
  });
  stream.on('end', () => {
    const lines = data.split('\n');
    let output = [];
    for (let line of lines) {
      if (!line.trim()) continue;
      try {
        const obj = JSON.parse(line);
        if (obj.phase === 'RUN_GRADLEW') {
            output.push(obj.msg);
        }
      } catch (e) {
        output.push(line);
      }
    }
    // Now just print the last 1500 lines of RUN_GRADLEW
    console.log(output.slice(Math.max(0, output.length - 1500)).join('\n'));
  });
});
