import { NextResponse } from 'next/server';
import { dbConnect, getUser } from '@/backend/utils/dbConnect';
import { createClient } from 'redis';
import { promises as fs } from 'fs';
import path from 'path';

// Helper to decode base64
function decodeBase64(str) {
  return Buffer.from(str, 'base64').toString('utf-8');
}

// Try to find user in chamcha.json (public/user_data)
async function findUserInChamcha({ username, phone, countryCode }) {
  const chamchaPath = path.join(process.cwd(), 'public', 'user_data', 'chamcha.json');
  try {
    const data = await fs.readFile(chamchaPath, 'utf8');
    // Each line is a JSON object
    const lines = data.split('\n').filter(Boolean);
    for (const line of lines) {
      let user;
      try {
        user = JSON.parse(line);
      } catch { continue; }
      if (
        user.username === username &&
        user.phone === phone &&
        user.countryCode === countryCode
      ) {
        return user;
      }
    }
  } catch {}
  return null;
}

// Try to find user in an encrypted .txt file (public/user_data)
async function findUserInEncryptedTxt({ username, phone, countryCode }, file) {
  const txtPath = path.join(process.cwd(), 'public', 'user_data', file);
  try {
    const data = await fs.readFile(txtPath, 'utf8');
    const lines = data.split('\n').filter(Boolean);
    for (const line of lines) {
      let user;
      try {
        user = JSON.parse(decodeBase64(line));
      } catch { continue; }
      if (
        user.username === username &&
        user.phone === phone &&
        user.countryCode === countryCode
      ) {
        return user;
      }
    }
  } catch {}
  return null;
}

// Try to get user from Redis as fallback if Mongo fails
async function findUserInRedis({ username, phone, countryCode }) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return null;
  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    const key = `user:${phone}`;
    const userStr = await client.get(key);
    if (userStr) {
      const user = JSON.parse(userStr);
      if (
        user.username === username &&
        user.phone === phone &&
        user.countryCode === countryCode
      ) {
        return user;
      }
    }
  } catch {}
  try { await client.disconnect(); } catch {}
  return null;
}

export async function POST(req) {
  try {
    const { username, phone, countryCode } = await req.json();

    // 1. Try database (Mongo) first
    let user = null;
    let triedMongo = false;
    try {
      await dbConnect();
      user = await getUser({ username, phone, countryCode });
      triedMongo = true;
    } catch (err) {
      // MongoDB connect failed, fall through to Redis
    }

    // 2. If not found or Mongo failed, try Redis
    if (!user) {
      user = await findUserInRedis({ username, phone, countryCode });
    }

    // 3. If not found, try backups in public/user_data/
    if (!user) {
      // Try chamcha.json
      user = await findUserInChamcha({ username, phone, countryCode });
    }
    if (!user) {
      // Try encrypted text files
      for (const file of ['maja.txt', 'jhola.txt', 'bhola.txt']) {
        user = await findUserInEncryptedTxt({ username, phone, countryCode }, file);
        if (user) break;
      }
    }

    // 4. Not found anywhere
    if (!user) {
      let reasonMsg = triedMongo ? 'User not found.' : 'MongoDB unreachable and user not found.';
      return NextResponse.json(
        { success: false, message: reasonMsg },
        { status: 404 }
      );
    }

    // 5. return user info
    return NextResponse.json({
      success: true,
      username: user.username,
      phone: user.phone,
      countryCode: user.countryCode,
      bank: user.bank,
      accountNumber: user.accountNumber,
      debitCardNumber: user.debitCardNumber,
      linked: user.linked,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Login failed.', error: err.message },
      { status: 500 }
    );
  }
}