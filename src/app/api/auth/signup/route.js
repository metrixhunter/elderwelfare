import { NextResponse } from 'next/server';
import { User } from '@/backend/models/User';
import { dbConnect } from '@/backend/utils/dbConnect';
import { createClient } from 'redis';

// Save user in Redis
async function saveUserInRedis(userObj) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return;
  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    const key = `user:${userObj.username}`;
    await client.set(key, JSON.stringify(userObj));
    await client.disconnect();
  } catch {
    try { await client.disconnect(); } catch {}
  }
}

// Find user in Redis
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
  } catch {
    try { await client.disconnect(); } catch {}
  }
  return null;
}

/*
Expected body:
{
  username: "string",
  password: "string",
  address: "string",
  members: [
    {
      name: "string",
      phoneNumbers: [
        { countryCode: "+91", number: "9876543210" }
      ],
      emails: ["test@example.com"],
      birthdate: "YYYY-MM-DD",
      age: number,
      images: ["url1", "url2"]
    }
  ]
}
*/

export async function POST(req) {
  const { username, password, address, members } = await req.json();

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

    // ✅ Validate phone numbers as array of { countryCode, number }
    if (
      !Array.isArray(member.phoneNumbers) ||
      member.phoneNumbers.some(
        (ph) =>
          typeof ph !== 'object' ||
          !/^\+\d{1,4}$/.test(ph.countryCode) ||
          !/^\d{6,12}$/.test(ph.number)
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Each member must have valid phoneNumbers: { countryCode: "+91", number: "9876543210" }',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(member.emails) || member.emails.length === 0) {
      return NextResponse.json({ success: false, message: 'Each member must have at least one email.' }, { status: 400 });
    }

    if (!Array.isArray(member.images)) {
      return NextResponse.json({ success: false, message: 'Each member must have an images array.' }, { status: 400 });
    }

    if (member.birthdate && isNaN(Date.parse(member.birthdate))) {
      return NextResponse.json({ success: false, message: 'Invalid birthdate format (YYYY-MM-DD).' }, { status: 400 });
    }

    if (member.age && typeof member.age !== 'number') {
      return NextResponse.json({ success: false, message: 'Age must be a number.' }, { status: 400 });
    }
  }

  // Check MongoDB
  let mongoOk = false;
  let existing = null;
  try {
    await dbConnect();
    mongoOk = true;
    existing = await User.findOne({ username });
  } catch {}

  if (mongoOk && existing) {
    return NextResponse.json({ success: false, message: 'User already exists.', username }, { status: 409 });
  }

  // Check Redis fallback if Mongo down
  if (!mongoOk) {
    const redisUser = await findUserInRedis({ username });
    if (redisUser) {
      return NextResponse.json({ success: false, message: 'User already exists.', username }, { status: 409 });
    }
  }

  const userObj = {
    username,
    password, // 🔐 Hash in production
    address,
    linked: false,
    members,
    createdAt: new Date().toISOString(),
  };

  if (mongoOk) {
    try {
      const user = new User(userObj);
      await user.save();
    } catch {}
  } else {
    await saveUserInRedis(userObj);
  }

  return NextResponse.json({
    success: true,
    username,
    address,
    linked: false,
    members,
  });
}
