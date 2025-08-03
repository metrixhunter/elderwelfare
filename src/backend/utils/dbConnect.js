// src/backend/db.js
import mongoose from 'mongoose';
import { createClient } from 'redis';
import { User, validateUserObject } from '../models/User.js';
import fs from 'fs';
import path from 'path';

// --- Redis Client Setup ---
const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL,
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

// --- Mongoose Caching ---
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// --- Database Connection Logic ---
async function dbConnect() {
  if (cached.conn) return { mongoAvailable: true, redisAvailable: redisClient.isOpen };

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((mongoose) => mongoose);
  }

  try {
    cached.conn = await cached.promise;
    return { mongoAvailable: true, redisAvailable: redisClient.isOpen };
  } catch (err) {
    try {
      if (!redisClient.isOpen) await redisClient.connect();
      return { mongoAvailable: false, redisAvailable: true };
    } catch {
      return { mongoAvailable: false, redisAvailable: false };
    }
  }
}

// --- Get User by Username ---
async function getUser({ username }) {
  const { mongoAvailable, redisAvailable } = await dbConnect();

  if (mongoAvailable) {
    return await User.findOne({ username });
  } else if (redisAvailable) {
    const data = await redisClient.get(`user:${username}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  return null;
}

// --- Save User with Fallbacks ---
async function saveUser(userObj) {
  const { mongoAvailable, redisAvailable } = await dbConnect();
  let savedUser = null;

  // Save to MongoDB if available
  if (mongoAvailable) {
    const user = new User(userObj);
    savedUser = await user.save();
  }

  // Save to Redis if available
  if (redisAvailable && validateUserObject(userObj)) {
    try {
      await redisClient.set(`user:${userObj.username}`, JSON.stringify(userObj));
    } catch (err) {
      console.error('Failed to save to Redis:', err);
    }
  }

  // Fallback to local file if both MongoDB and Redis are unavailable
  if (!mongoAvailable && !redisAvailable) {
    try {
      const dodoDir = path.join(process.cwd(), 'public', 'dodo');
      const doFile = path.join(dodoDir, 'do.json');
      if (!fs.existsSync(dodoDir)) fs.mkdirSync(dodoDir, { recursive: true });
      fs.appendFileSync(doFile, JSON.stringify(userObj) + '\n', 'utf-8');
    } catch (e) {
      console.error('Failed to write to do.json:', e);
    }
  }

  return savedUser || userObj;
}

export { dbConnect, getUser, saveUser };
