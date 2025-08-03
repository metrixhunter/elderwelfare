import { NextResponse } from 'next/server';
import { User, validateUserObject } from '@/backend/models/User';
import { dbConnect } from '@/backend/utils/dbConnect';
import { saveUserBackup } from '@/app/secret/backup-util';
import { createClient } from 'redis';

const banks = ['SBI', 'HDFC', 'ICICI', 'AXIS'];

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
function generateDebitCardNumber() {
  return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}

// Helper to save user in Redis
async function saveUserInRedis(userObj) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return;
  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    const key = `user:${userObj.phone}`;
    await client.set(key, JSON.stringify(userObj));
    await client.disconnect();
  } catch (e) {
    try { await client.disconnect(); } catch {}
    // Ignore
  }
}

// Helper to find user in Redis
async function findUserInRedis({ phone, countryCode }) {
  const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
  if (!redisUrl) return null;
  const client = createClient({ url: redisUrl });
  try {
    await client.connect();
    const key = `user:${phone}`;
    const userStr = await client.get(key);
    await client.disconnect();
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.countryCode === countryCode) {
        return user;
      }
    }
  } catch (e) {
    try { await client.disconnect(); } catch {}
    // Ignore
  }
  return null;
}

export async function POST(req) {
  const { username, phone, countryCode } = await req.json();

  // Try MongoDB first
  let mongoOk = false;
  let existing = null;
  try {
    await dbConnect();
    mongoOk = true;
    existing = await User.findOne({ phone, countryCode });
  } catch (err) {
    // MongoDB connection failed
  }

  // If Mongo is up, check for existing user
  if (mongoOk && existing) {
    return NextResponse.json({
      success: false,
      message: 'User already exists.',
      username: existing.username,
      bank: existing.bank,
      countryCode: existing.countryCode,
      accountNumber: existing.accountNumber,
      debitCardNumber: existing.debitCardNumber,
      linked: existing.linked
    }, { status: 409 });
  }

  // If Mongo is down, try Redis for existing user
  if (!mongoOk) {
    const redisUser = await findUserInRedis({ phone, countryCode });
    if (redisUser) {
      return NextResponse.json({
        success: false,
        message: 'User already exists.',
        username: redisUser.username,
        bank: redisUser.bank,
        countryCode: redisUser.countryCode,
        accountNumber: redisUser.accountNumber,
        debitCardNumber: redisUser.debitCardNumber,
        linked: redisUser.linked
      }, { status: 409 });
    }
  }

  // Assign random bank and numbers
  const bank = banks[Math.floor(Math.random() * banks.length)];
  const accountNumber = generateAccountNumber();
  const debitCardNumber = generateDebitCardNumber();

  const userObj = {
    username,
    phone,
    countryCode,
    bank,
    accountNumber,
    debitCardNumber,
    linked: false,
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
    // Save to Redis as fallback
    await saveUserInRedis(userObj);
  }

  // Only do file backups if in development
  if (process.env.NODE_ENV === 'development') {
    await saveUserBackup(userObj);
    // Do NOT call saveToFiles or write to disk in production/serverless!
  }

  return NextResponse.json({
    success: true,
    username,
    bank,
    countryCode,
    accountNumber,
    debitCardNumber,
    linked: false
  });
}