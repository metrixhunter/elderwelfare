import { NextResponse } from 'next/server';
import { dbConnect, getUser } from '@/backend/utils/dbConnect';
import { createClient } from 'redis';

// Redis fallback
async function findUserInRedis({ username }) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return null;
  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    const key = `user:${username}`;
    const userStr = await client.get(key);
    await client.disconnect();
    if (userStr) return JSON.parse(userStr);
  } catch {}
  try { await client.disconnect(); } catch {}
  return null;
}

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required.' },
        { status: 400 }
      );
    }

    // Try MongoDB first
    let user = null;
    let triedMongo = false;
    try {
      await dbConnect();
      user = await getUser({ username });
      triedMongo = true;
    } catch {}

    // Redis fallback if not found
    if (!user) {
      user = await findUserInRedis({ username });
    }

    // If still not found
    if (!user) {
      const message = triedMongo
        ? 'User not found.'
        : 'MongoDB unreachable and user not found.';
      return NextResponse.json(
        { success: false, message },
        { status: 404 }
      );
    }

    // Password check (NOTE: In production, hash comparison)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid password.' },
        { status: 401 }
      );
    }

    // Pull first phone number and countryCode for simplicity
    const firstMember = user.members?.[0];
    const firstPhoneEntry = firstMember?.phoneNumbers?.[0] || {};

    return NextResponse.json({
      success: true,
      username: user.username,
      address: user.address,
      linked: user.linked,
      phone: firstPhoneEntry.number || null,
      countryCode: firstPhoneEntry.countryCode || null,
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Login failed.', error: err.message },
      { status: 500 }
    );
  }
}
