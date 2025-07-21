import mongoose from 'mongoose';
import { createClient } from 'redis';
import { User, validateUserObject } from '../models/User.js';
import fs from 'fs';
import path from 'path';

const redisClient = createClient({
  url: process.env.UPSTASH_REDIS_URL,
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return { mongoAvailable: true, redisAvailable: false };
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
    return { mongoAvailable: true, redisAvailable: false };
  } catch (err) {
    try {
      if (!redisClient.isOpen) await redisClient.connect();
      return { mongoAvailable: false, redisAvailable: true };
    } catch {
      return { mongoAvailable: false, redisAvailable: false };
    }
  }
}

// --- getUser: use username only
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

// --- saveUser
async function saveUser(userObj) {
  const { mongoAvailable, redisAvailable } = await dbConnect();
  if (mongoAvailable) {
    const user = new User(userObj);
    return await user.save();
  } else if (redisAvailable) {
    await redisClient.set(`user:${userObj.username}`, JSON.stringify(userObj));
    return userObj;
  } else {
    // Both Mongo and Redis failed, save to public/dodo/do.json
    try {
      const dodoDir = path.join(process.cwd(), 'public', 'dodo');
      const doFile = path.join(dodoDir, 'do.json');
      if (!fs.existsSync(dodoDir)) fs.mkdirSync(dodoDir, { recursive: true });
      fs.appendFileSync(doFile, JSON.stringify(userObj) + '\n', 'utf-8');
    } catch (e) {
      console.error('Failed to write to do.json:', e);
    }
    return userObj;
  }
}

export { dbConnect, getUser, saveUser };