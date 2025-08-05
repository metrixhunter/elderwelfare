// tools/escapeFirebaseKey.js
const fs = require('fs');
const path = require('path');

const keyPath = path.resolve(__dirname, '../serviceAccountKey.json'); // adjust if needed
const key = fs.readFileSync(keyPath, 'utf-8');
const escaped = JSON.stringify(JSON.parse(key)).replace(/\\n/g, '\\\\n');

console.log('Paste this in your .env.local:\n');
console.log(`FIREBASE_SERVICE_ACCOUNT='${escaped}'`);
