import { NextResponse } from 'next/server';
import { dbConnect, getUser } from '@/backend/utils/dbConnect';
import { createClient } from 'redis';

// Try to get user from Redis as fallback if Mongo fails
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

    // 1. Try database (Mongo) first
    let user = null;
    let triedMongo = false;
    try {
      await dbConnect();
      user = await getUser({ username });
      triedMongo = true;
    } catch (err) {
      // MongoDB connect failed, fall through to Redis
    }

    // 2. If not found or Mongo failed, try Redis
    if (!user) {
      user = await findUserInRedis({ username });
    }

    // 3. Not found anywhere
    if (!user) {
      let reasonMsg = triedMongo ? 'User not found.' : 'MongoDB unreachable and user not found.';
      return NextResponse.json(
        { success: false, message: reasonMsg },
        { status: 404 }
      );
    }

    // 4. Password check (in production, compare hashed)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Invalid password.' },
        { status: 401 }
      );
    }

    // 5. return user info (do NOT return password)
    return NextResponse.json({
      success: true,
      username: user.username,
      phone: user.phone,
      countryCode: user.countryCode,
      linked: user.linked,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Login failed.', error: err.message },
      { status: 500 }
    );
  }
}