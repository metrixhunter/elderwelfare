import mongoose from 'mongoose';
import { createClient } from 'redis';
import { User,validateUserObject } from '../models/User.js'; // Use relative path, NOT alias
import fs from 'fs';
import path from 'path';

// --- Redis client setup ---
const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL,
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// --- MongoDB connection cache ---
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// --- Main dbConnect ---
async function dbConnect() {
  if (cached.conn) {
    return { mongoAvailable: true, redisAvailable: false };
  }
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local or in your Vercel project settings'
    );
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
    return { mongoAvailable: true, redisAvailable: false };
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    // Try Redis fallback
    try {
      if (!redisClient.isOpen) await redisClient.connect();
      return { mongoAvailable: false, redisAvailable: true };
    } catch (redisErr) {
      console.error('Redis connection failed:', redisErr);
      // Instead of throwing, indicate both failed
      return { mongoAvailable: false, redisAvailable: false };
    }
  }
}

// --- Unified getUser ---
async function getUser({ phone, username }) {
  const { mongoAvailable, redisAvailable } = await dbConnect();
  if (mongoAvailable) {
    if (username) {
      return await User.findOne({ phone, username });
    } else {
      return await User.findOne({ phone });
    }
  } else if (redisAvailable) {
    const data = await redisClient.get(`user:${phone}`);
    if (!data) return null;
    const user = JSON.parse(data);
    if (username && user.username !== username) return null;
    return user;
  }
  // Optionally: you could search do.json here for read fallback
  return null;
}

// --- Unified saveUser ---
async function saveUser(userObj) {
  const { mongoAvailable, redisAvailable } = await dbConnect();
  if (mongoAvailable) {
    const user = new User(userObj);
    return await user.save();
  } else if (redisAvailable) {
    await redisClient.set(`user:${userObj.phone}`, JSON.stringify(userObj));
    return userObj;
  } else {
    // Both Mongo and Redis failed, save to public/dodo/do.json
    try {
      const dodoDir = path.join(process.cwd(), 'public', 'dodo');
      const doFile = path.join(dodoDir, 'do.json');
      if (!fs.existsSync(dodoDir)) fs.mkdirSync(dodoDir, { recursive: true });

      // Append JSON object as one line (newline-delimited JSON)
      fs.appendFileSync(doFile, JSON.stringify(userObj) + '\n', 'utf-8');
    } catch (e) {
      console.error('Failed to write to do.json:', e);
    }
    return userObj;
  }
}

export { dbConnect, getUser, saveUser };