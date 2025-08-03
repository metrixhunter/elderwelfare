import fs from 'fs';
import path from 'path';

// Encryption utility: base64 encoding
function encodeBase64(data) {
  return Buffer.from(data, 'utf-8').toString('base64');
}

export async function POST(request) {
  try {
    // Accept the full user object structure from JSON body
    const { username, password, address, age, images, members } = await request.json();

    // Validate minimal structure
    if (!username || !password || !Array.isArray(members) || members.length === 0) {
      return Response.json({ success: false, error: "Invalid user data." }, { status: 400 });
    }

    const userData = {
      username,
      password, // In production, hash this!
      address,
      age,
      images,
      members,
      timestamp: new Date().toISOString()
    };

    const basePath = path.join(process.cwd(), 'public', 'user_data');
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    // chamcha.json: plain JSON, newline-separated
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