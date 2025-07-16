import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './auth/authroutes.js';
import { createClient } from 'redis';

dotenv.config();

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

let redisClient;

async function connectDatabases() {
  let mongoConnected = false;
  let redisConnected = false;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    mongoConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
  }

  try {
    redisClient = createClient({ url: process.env.UPSTASH_REDIS_URL });
    redisClient.on('error', (err) => {
      console.error('❌ Redis Client Error:', err);
    });
    await redisClient.connect();
    redisConnected = true;
    console.log('✅ Redis connected');
    app.locals.redisClient = redisClient;
  } catch (redisErr) {
    console.error('❌ Redis error:', redisErr);
  }

  if (!mongoConnected && !redisConnected) {
    console.error('❌ Both MongoDB and Redis connections failed. The API may not function.');
  }
}

connectDatabases();

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('🚀 Backend is running!');
});

// Health check endpoint for Redis
app.get('/redis-status', async (req, res) => {
  try {
    if (!redisClient || !redisClient.isOpen) {
      return res.status(500).json({ redis: false, message: 'Redis client not connected' });
    }
    // Simple check: PING command
    const pong = await redisClient.ping();
    if (pong === 'PONG') {
      return res.status(200).json({ redis: true, message: 'Redis is working fine' });
    } else {
      return res.status(500).json({ redis: false, message: 'Redis did not respond with PONG' });
    }
  } catch (e) {
    return res.status(500).json({ redis: false, message: 'Redis health check failed', error: e.message });
  }
});

app.listen(PORT, () => console.log(`🌐 Server running on http://localhost:${PORT}`));