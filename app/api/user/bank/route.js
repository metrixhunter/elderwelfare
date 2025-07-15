import { NextResponse } from 'next/server';
import { User } from '@/backend/models/User';
import { dbConnect } from '@/backend/utils/dbConnect';
import { createClient } from 'redis';

// Helper: Build a dynamic OR query object
function buildOrQuery({ phone, countryCode, bank, accountNumber, debitCardNumber }) {
  const or = [];
  if (phone) or.push({ phone });
  if (countryCode) or.push({ countryCode });
  if (bank) or.push({ bank: new RegExp(bank, 'i') });
  if (accountNumber) or.push({ accountNumber });
  if (debitCardNumber) or.push({ debitCardNumber });
  return or.length > 0 ? { $or: or } : {};
}

// Helper: Search Redis for users matching any field (OR logic)
async function searchRedisUsers({ phone, countryCode, bank, accountNumber, debitCardNumber }, redisUrl) {
  const client = createClient({ url: redisUrl });
  await client.connect();
  const keys = await client.keys('user:*');
  const users = [];

  for (const key of keys) {
    try {
      const userStr = await client.get(key);
      if (!userStr) continue;
      const user = JSON.parse(userStr);

      // OR match logic
      if (
        (phone && user.phone === phone) ||
        (countryCode && user.countryCode === countryCode) ||
        (bank && user.bank && user.bank.toLowerCase().includes(bank.toLowerCase())) ||
        (accountNumber && user.accountNumber === accountNumber) ||
        (debitCardNumber && user.debitCardNumber === debitCardNumber)
      ) {
        users.push(user);
      }
    } catch {}
  }
  await client.disconnect();
  return users;
}

export async function POST(req) {
  const { phone, countryCode, bank, accountNumber, debitCardNumber } = await req.json();
  let mongoWorked = false, redisWorked = false;

  // Try Mongo first
  try {
    await dbConnect();
    const query = buildOrQuery({ phone, countryCode, bank, accountNumber, debitCardNumber });
    const users = await User.find(query, '-password -__v').lean();

    if (users && users.length > 0) {
      mongoWorked = true;
      return NextResponse.json({ success: true, users });
    }
  } catch (err) {
    // Mongo failed, fall through to Redis
  }

  // Try Redis if Mongo failed or found nothing
  try {
    const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
    if (!redisUrl) throw new Error('No Redis URL configured');
    const users = await searchRedisUsers({ phone, countryCode, bank, accountNumber, debitCardNumber }, redisUrl);

    if (users && users.length > 0) {
      redisWorked = true;
      return NextResponse.json({ success: true, users });
    }
  } catch (err) {
    // Redis failed
  }

  return NextResponse.json(
    { error: 'No users found matching criteria in MongoDB or Redis.' }, 
    { status: 404 }
  );
}

// GET: Return all users (excluding sensitive fields, as before)
export async function GET() {
  // Try Mongo first, then Redis
  try {
    await dbConnect();
    const users = await User.find({}, '-password -__v -_id').lean();
    if (users && users.length > 0)
      return NextResponse.json(users);
  } catch (err) {
    // Mongo failed
  }

  // Fallback to Redis
  try {
    const redisUrl = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;
    if (!redisUrl) throw new Error('No Redis URL configured');
    const client = createClient({ url: redisUrl });
    await client.connect();
    const keys = await client.keys('user:*');
    const users = [];
    for (const key of keys) {
      try {
        const userStr = await client.get(key);
        if (!userStr) continue;
        const user = JSON.parse(userStr);
        users.push(user);
      } catch {}
    }
    await client.disconnect();
    if (users.length > 0) return NextResponse.json(users);
  } catch (err) {
    // Redis failed
  }

  return NextResponse.json({ error: 'Server error or no users found.' }, { status: 500 });
}