import { NextResponse } from 'next/server';
import { User } from '@/backend/models/User';
import { dbConnect } from '@/backend/utils/dbConnect';
import { createClient } from 'redis';
import { saveUserToFirebase, getUserFromFirebase } from '@/backend/utils/firebaseSave.server';
import { saveUserLocally, getUserFromLocal } from '@/backend/utils/localSave';

// Save user in Redis
async function saveUserInRedis(userObj) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return;

  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    await client.set(`user:${userObj.username}`, JSON.stringify(userObj));
  } catch (err) {
    console.error('[Redis] Save error:', err.message);
  } finally {
    await client.disconnect().catch(() => {});
  }
}

// Find user in Redis
async function findUserInRedis(username) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return null;

  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    const userStr = await client.get(`user:${username}`);
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error('[Redis] Find error:', err.message);
    return null;
  } finally {
    await client.disconnect().catch(() => {});
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON payload' }, { status: 400 });
  }

  const { username, password, address, members } = body;

  if (!username || !password || !address || !Array.isArray(members) || members.length === 0) {
    return NextResponse.json(
      { success: false, message: 'Missing required fields: username, password, address, members.' },
      { status: 400 }
    );
  }

  for (const member of members) {
    if (!member.name) {
      return NextResponse.json({ success: false, message: 'Each member must have a name.' }, { status: 400 });
    }

    if (
      !Array.isArray(member.phoneNumbers) ||
      member.phoneNumbers.some(
        (ph) =>
          typeof ph !== 'object' ||
          !/^\+\d{1,4}$/.test(ph.countryCode) ||
          !/^\d{6,12}$/.test(ph.number)
      )
    ) {
      return NextResponse.json({ success: false, message: 'Invalid phoneNumbers.' }, { status: 400 });
    }

    if (!Array.isArray(member.emails) || member.emails.length === 0) {
      return NextResponse.json({ success: false, message: 'Each member must have at least one email.' }, { status: 400 });
    }

    if (!Array.isArray(member.images)) {
      return NextResponse.json({ success: false, message: 'Images must be an array.' }, { status: 400 });
    }

    if (member.birthdate && isNaN(Date.parse(member.birthdate))) {
      return NextResponse.json({ success: false, message: 'Invalid birthdate format.' }, { status: 400 });
    }

    if (member.age && typeof member.age !== 'number') {
      return NextResponse.json({ success: false, message: 'Age must be a number.' }, { status: 400 });
    }
  }

  const userObj = {
    username,
    password,
    address,
    linked: false,
    members,
    createdAt: new Date().toISOString(),
  };

  let exists = {
    mongo: false,
    redis: false,
    firebase: false,
    local: false,
  };

  let mongoConnected = false;

  // Mongo check
  try {
    await dbConnect();
    mongoConnected = true;
    const found = await User.findOne({ username });
    exists.mongo = !!found;
  } catch (err) {
    console.error('[MongoDB] Connection or Query Error:', err.message);
  }

  // Redis check
  try {
    const redisUser = await findUserInRedis(username);
    exists.redis = !!redisUser;
  } catch (err) {
    console.error('[Redis] Check error:', err.message);
  }

  // Firebase check
  try {
    const firebaseUser = await getUserFromFirebase({ username });
    exists.firebase = !!firebaseUser;
  } catch (err) {
    console.error('[Firebase] Check error:', err.message);
  }

  // Local check
  try {
    const localUser = await getUserFromLocal(username);
    exists.local = !!localUser;
  } catch (err) {
    console.error('[Local] Check error:', err.message);
  }

  if (exists.mongo || exists.redis || exists.firebase || exists.local) {
    return NextResponse.json({ success: false, message: 'User already exists.', username }, { status: 409 });
  }

  // Save logic
  try {
    if (mongoConnected) {
      const user = new User(userObj);
      await user.save();
    } else {
      throw new Error('Mongo not connected');
    }
  } catch (err) {
    console.error('[MongoDB] Save failed:', err.message);
    await Promise.all([
      saveUserInRedis(userObj),
      saveUserToFirebase(userObj),
      saveUserLocally(userObj)
    ]);
  }

  return NextResponse.json({
    success: true,
    username,
    address,
    linked: false,
    members,
  });
}
