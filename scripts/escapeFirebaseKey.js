const fs = require('fs');
const path = require('path');

const keyPath = path.resolve(__dirname, '../serviceAccountKey.json'); // adjust if needed
const raw = fs.readFileSync(keyPath, 'utf-8');
const escaped = JSON.stringify(JSON.parse(raw)).replace(/\\n/g, '\\\\n');

console.log('\nPaste this in your .env.local:\n');
console.log(`FIREBASE_SERVICE_ACCOUNT='${escaped}'`);
