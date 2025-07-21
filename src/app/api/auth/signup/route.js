import { NextResponse } from 'next/server';
import { User } from '@/backend/models/User';
import { dbConnect } from '@/backend/utils/dbConnect';
import { createClient } from 'redis';

// Helper to save user in Redis
async function saveUserInRedis(userObj) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return;
  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    const key = `user:${userObj.username}`;
    await client.set(key, JSON.stringify(userObj));
    await client.disconnect();
  } catch (e) {
    try { await client.disconnect(); } catch {}
    // Ignore
  }
}

// Helper to find user in Redis
async function findUserInRedis({ username }) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return null;
  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    const key = `user:${username}`;
    const userStr = await client.get(key);
    await client.disconnect();
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    try { await client.disconnect(); } catch {}
    // Ignore
  }
  return null;
}

/*
  Expected request body format:
  {
    username: "string",
    password: "string",
    address: "string",
    members: [
      {
        name: "string",
        phoneNumbers: ["string", ...], // array of 10-digit strings
        emails: ["string", ...],
        birthdate: "YYYY-MM-DD",
        age: number,
        images: ["string", ...] // base64 or URLs
      },
      ...
    ]
  }
*/

export async function POST(req) {
  const {
    username,
    password,
    address,
    members // array of member objects
  } = await req.json();

  // Validate input
  if (
    !username ||
    !password ||
    !Array.isArray(members) ||
    members.length === 0
  ) {
    return NextResponse.json(
      { success: false, message: 'Missing required fields: username, password, members (at least one).' },
      { status: 400 }
    );
  }
  for (const member of members) {
    if (!member.name) {
      return NextResponse.json(
        { success: false, message: 'Each member must have a name.' },
        { status: 400 }
      );
    }
    if (!Array.isArray(member.phoneNumbers) || member.phoneNumbers.some(ph => !/^\d{10}$/.test(ph))) {
      return NextResponse.json(
        { success: false, message: 'Each member must have valid phoneNumbers (10-digit strings).' },
        { status: 400 }
      );
    }
    if (!Array.isArray(member.emails) || member.emails.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Each member must have at least one email.' },
        { status: 400 }
      );
    }
    if (!Array.isArray(member.images)) {
      return NextResponse.json(
        { success: false, message: 'Each member must have an images array (can be empty).' },
        { status: 400 }
      );
    }
    // birthdate is optional but if present should be a valid date string
    if (member.birthdate && isNaN(Date.parse(member.birthdate))) {
      return NextResponse.json(
        { success: false, message: 'Each member\'s birthdate must be a valid date string (YYYY-MM-DD).' },
        { status: 400 }
      );
    }
    // age is optional but if present should be a number
    if (member.age && typeof member.age !== 'number') {
      return NextResponse.json(
        { success: false, message: 'Each member\'s age must be a number.' },
        { status: 400 }
      );
    }
  }

  // Try MongoDB first
  let mongoOk = false;
  let existing = null;
  try {
    await dbConnect();
    mongoOk = true;
    existing = await User.findOne({ username });
  } catch (err) {
    // MongoDB connection failed
  }

  // If Mongo is up, check for existing user
  if (mongoOk && existing) {
    return NextResponse.json(
      { success: false, message: 'User already exists.', username: existing.username },
      { status: 409 }
    );
  }

  // If Mongo is down, try Redis for existing user
  if (!mongoOk) {
    const redisUser = await findUserInRedis({ username });
    if (redisUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists.', username: redisUser.username },
        { status: 409 }
      );
    }
  }

  // Create user object
  const userObj = {
    username,
    password, // Hash in production!
    address,
    linked: false,
    members,
    createdAt: new Date().toISOString(),
  };

  // Try saving to Mongo
  if (mongoOk) {
    try {
      const user = new User(userObj);
      await user.save();
    } catch (e) {
      // Ignore DB errors for backup fallback
    }
  } else {
    await saveUserInRedis(userObj); // Save to Redis as fallback
  }

  return NextResponse.json({
    success: true,
    username,
    address,
    linked: false,
    members,
  });
}