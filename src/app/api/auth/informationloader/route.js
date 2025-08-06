// src/app/api/auth/informationloader/route.js
import { NextResponse } from 'next/server';
import { User } from '@/backend/models/User';
import { dbConnect } from '@/backend/utils/dbConnect';
import { createClient } from 'redis';
import { getUserFromFirebase } from '@/backend/utils/firebaseSave.server';
import fs from 'fs';
import path from 'path';

/**
 * Helper: read all users from local_users.json (if exists)
 */
async function readLocalUsersFile() {
  try {
    const filePath = path.join(process.cwd(), 'local_users.json'); // matches your localSave path
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('[LocalFile] read error:', err?.message || err);
    return [];
  }
}

/**
 * Helper: read users from Redis keys user:*
 * Note: KEYS is used for simplicity. Replace with SCAN if using a production Redis where KEYS is restricted.
 */
async function readAllUsersFromRedis() {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return [];

  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    // Try keys; if unsupported, fall back to empty array
    let keys = [];
    try {
      keys = await client.keys('user:*');
    } catch (e) {
      // some managed redis providers restrict KEYS; log and return []
      console.warn('[Redis] KEYS not available:', e?.message || e);
      return [];
    }

    const users = [];
    for (const key of keys) {
      try {
        const str = await client.get(key);
        if (!str) continue;
        const parsed = JSON.parse(str);
        users.push(parsed);
      } catch (e) {
        console.warn('[Redis] parse error for key', key, e?.message || e);
        continue;
      }
    }
    return users;
  } catch (err) {
    console.warn('[Redis] general error:', err?.message || err);
    return [];
  } finally {
    try { await client.disconnect(); } catch {}
  }
}

/**
 * Helper: read all users from Mongo
 */
async function readAllUsersFromMongo() {
  try {
    await dbConnect();
    // find all users; be careful with large collections in production — consider pagination
    const docs = await User.find({}).lean().exec();
    return Array.isArray(docs) ? docs : [];
  } catch (err) {
    console.warn('[Mongo] read all users error:', err?.message || err);
    return [];
  }
}

/**
 * GET or POST handler — return aggregated list of users from all backends.
 * Use POST if you want to pass options in body; GET is also fine.
 */
export async function GET() {
  try {
    // 1) Read from all sources (in parallel where reasonable)
    const [mongoUsers, redisUsers, localUsers] = await Promise.all([
      readAllUsersFromMongo(),
      readAllUsersFromRedis(),
      readLocalUsersFile(),
    ]);

    // Build set of usernames discovered from mongo/redis/local
    const usernames = new Set();
    mongoUsers.forEach(u => u?.username && usernames.add(u.username));
    redisUsers.forEach(u => u?.username && usernames.add(u.username));
    localUsers.forEach(u => u?.username && usernames.add(u.username));

    // For completeness, also include usernames present only in Firebase by scanning usernames list
    // We'll query Firebase per username discovered. If you want to list ALL firebase docs,
    // replace this with a function that returns all firebase users.
    const firebaseUsers = [];
    for (const username of Array.from(usernames)) {
      try {
        const fb = await getUserFromFirebase({ username });
        if (fb) firebaseUsers.push(fb);
      } catch (err) {
        // ignore per-username firebase errors but log
        console.warn('[Firebase] per-user read error for', username, err?.message || err);
      }
    }

    // Merge users into a map by username. Priority: Mongo > Redis > Firebase > Local
    const merged = new Map();

    const addIfMissing = (sourceArray) => {
      for (const u of sourceArray || []) {
        if (!u || !u.username) continue;
        if (!merged.has(u.username)) merged.set(u.username, u);
      }
    };

    // Preferred ordering: mongo (highest), redis, firebase, local (lowest)
    addIfMissing(mongoUsers);
    addIfMissing(redisUsers);
    addIfMissing(firebaseUsers);
    addIfMissing(localUsers);

    // Convert to array
    const usersArray = Array.from(merged.values());

    // Return results
    return NextResponse.json({ success: true, count: usersArray.length, users: usersArray }, { status: 200 });
  } catch (err) {
    console.error('[InformationLoader] Unexpected error:', err);
    return NextResponse.json({ success: false, message: 'Failed to load information', error: err?.message || String(err) }, { status: 500 });
  }
}

/**
 * Also allow POST to give client a way to request reload (kept same logic)
 */
export async function POST(req) {
  return GET();
}
