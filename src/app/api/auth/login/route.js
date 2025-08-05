// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import { dbConnect, getUser } from '@/backend/utils/dbConnect';
import { createClient } from 'redis';
import { getUserFromFirebase } from '@/backend/utils/firebaseSave.server';
import { getUserFromLocal } from '@/backend/utils/localSave';

/**
 * Redis fallback - read-only helper
 */
async function findUserInRedis(username) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return null;

  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    const key = `user:${username}`;
    const userStr = await client.get(key);
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    // Log but continue to next fallback
    console.warn('[Redis] Read error:', err?.message || err);
    return null;
  } finally {
    try { await client.disconnect(); } catch {}
  }
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

    let user = null;
    let triedMongo = false;

    // 1) Try MongoDB
    try {
      await dbConnect();
      triedMongo = true;
      user = await getUser({ username });
    } catch (err) {
      // If Mongo error — log and continue to fallbacks
      console.warn('[MongoDB] Connection or query error:', err?.message || err);
      user = null;
    }

    // 2) Redis fallback
    if (!user) {
      try {
        const redisUser = await findUserInRedis(username);
        if (redisUser) user = redisUser;
      } catch (err) {
        console.warn('[Redis] Fallback error:', err?.message || err);
      }
    }

    // 3) Firebase fallback
    if (!user) {
      try {
        const fbUser = await getUserFromFirebase({ username });
        if (fbUser) user = fbUser;
      } catch (err) {
        console.warn('[Firebase] Fallback error:', err?.message || err);
      }
    }

    // 4) Local file fallback (eldercare-welfare/local_users.json)
    if (!user) {
      try {
        const localUser = await getUserFromLocal(username);
        if (localUser) user = localUser;
      } catch (err) {
        console.warn('[Local] Fallback error:', err?.message || err);
      }
    }

    // Not found anywhere
    if (!user) {
      const message = triedMongo
        ? 'User not found.'
        : 'MongoDB unreachable and user not found.';
      return NextResponse.json({ success: false, message }, { status: 404 });
    }

    // Password check (plain-text here — replace with hash compare in prod)
    if (user.password !== password) {
      return NextResponse.json({ success: false, message: 'Invalid password.' }, { status: 401 });
    }

    // Pick first phone entry if available
    const firstMember = user.members?.[0] || {};
    const firstPhoneEntry = firstMember.phoneNumbers?.[0] || {};

    return NextResponse.json({
      success: true,
      username: user.username,
      address: user.address || null,
      linked: user.linked || false,
      phone: firstPhoneEntry.number || null,
      countryCode: firstPhoneEntry.countryCode || null,
    });
  } catch (err) {
    console.error('[Login] Unexpected error:', err);
    return NextResponse.json(
      { success: false, message: 'Login failed.', error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
