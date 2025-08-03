import { NextResponse } from 'next/server';
import { dbConnect } from '@/backend/utils/dbConnect';
import { User } from '@/backend/models/User';
import { createClient } from 'redis';
import fs from 'fs';
import path from 'path';

// Redis fetch fallback
async function fetchAllUsersFromRedis(redisClient) {
  const users = [];
  const keys = await redisClient.keys('user:*');
  for (const key of keys) {
    const val = await redisClient.get(key);
    if (val) {
      try {
        const obj = JSON.parse(val);
        delete obj.password;
        users.push(obj);
      } catch {}
    }
  }
  return users;
}

// Backup file fallback
function fetchAllUsersFromBackup() {
  try {
    const backupPath = path.join(process.cwd(), 'public', 'user_data', 'chamcha.json');
    if (!fs.existsSync(backupPath)) return [];
    const content = fs.readFileSync(backupPath, 'utf-8');
    return content
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try {
          const obj = JSON.parse(line);
          delete obj.password;
          return obj;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function GET() {
  let mongoAvailable = false;
  let redisAvailable = false;
  let redisClient = null;

  try {
    const conn = await dbConnect();
    mongoAvailable = conn.mongoAvailable;
    redisAvailable = conn.redisAvailable;
    if (conn.redisAvailable && conn.redisClient) {
      redisClient = conn.redisClient;
    }
  } catch {}

  // MongoDB
  if (mongoAvailable) {
    try {
      const users = await User.find({}, '-password -__v -_id').lean();
      return NextResponse.json(users);
    } catch {}
  }

  // Redis
  if (redisAvailable) {
    try {
      if (!redisClient) {
        redisClient = createClient({ url: process.env.UPSTASH_REDIS_URL });
        await redisClient.connect();
      }
      const users = await fetchAllUsersFromRedis(redisClient);
      if (!conn?.redisClient) {
        await redisClient.disconnect();
      }
      return NextResponse.json(users);
    } catch {}
  }

  // Backup file
  const backupUsers = fetchAllUsersFromBackup();
  if (backupUsers.length > 0) {
    return NextResponse.json(backupUsers);
  }

  // All sources failed
  return NextResponse.json(
    { error: 'Server error: cannot retrieve users from MongoDB, Redis, or backup' },
    { status: 500 }
  );
}
