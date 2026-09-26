const https = require('https');
https.get('https://storage.googleapis.com/eas-workflows-production/logs/864825a8-5e86-46d9-ac41-93b977385f84/88a1534f-19fe-44ed-8398-aee557994166/2026-09-26T14%3A38%3A10Z-8b70041e-9205-4fb9-8804-458f76dccdd8.txt?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=www-production%40exponentjs.iam.gserviceaccount.com%2F20260926%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20260926T144245Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=2547ecbf9441479fc136ff1a0341104426db95ce543d69c26d5a6f6600ff7a099eba556e7c35c3ba599e7030598ee3013ce84d7fe7877b0df1508e99f0468e054ac567403a5e7c99e037de9f1f2a0f5b2413e013f5164afef0c3d5f0388059acd7c9b597c43e8a87156c15b09a4d3f52db83048e0f15dd2f69e8ef767ad759bb9a6bf914f3fc8749171c5104216fb0fe6cc441203d64d688edd99185b5eee7a4ab098c7594a08772fb9ba082933fb41816ea3c498734770fc2b4d4a0d61d9485fe3b52bc6984bc5bcfd48025fe796d99f1e1fbc5f424880d57456824ce1cb986f535501eac88a5e88bbaed0b3b69c46999e2b5496ecfa78823efafa842876737', (res) => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
    if (data.length > 50000) data = data.slice(-50000);
  });
  res.on('end', () => {
    console.log(data);
  });
});
