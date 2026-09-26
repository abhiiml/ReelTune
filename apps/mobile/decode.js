const fs = require('fs');
const zlib = require('zlib');
const buf = fs.readFileSync('eas_build.log');
try {
  const text = zlib.unzipSync(buf).toString('utf-8');
  fs.writeFileSync('eas_build_decoded.log', text);
  console.log('Decoded successfully');
} catch(e) {
  console.log('Error decoding, maybe not gzipped:', e.message);
}
