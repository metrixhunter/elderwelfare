const fs = require('fs');
const path = require('path');

const keyPath = path.resolve(__dirname, 'src/config/firebase/serviceAccountKey.json');

const raw = fs.readFileSync(keyPath, 'utf-8');

const escaped = JSON.stringify(JSON.parse(raw)).replace(/\\n/g, '\\\\n');

console.log(`FIREBASE_SERVICE_ACCOUNT='${escaped}'`);
