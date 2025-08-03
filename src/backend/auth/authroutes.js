import express from 'express';
import fs from 'fs';
import path from 'path';
import { dbConnect, getUser, saveUser } from '../utils/dbConnect.js';

const router = express.Router();

// Utility functions...
function encodeBase64(data) { return Buffer.from(data, 'utf-8').toString('base64'); }
function backupUserData(userData) {
  const backupObj = { ...userData, createdAt: new Date().toISOString() };
  const backupStr = JSON.stringify(backupObj, null, 2);
  const encoded = encodeBase64(backupStr);
  const backupDir = path.join(process.cwd(), 'public', 'user_data');
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  fs.appendFileSync(path.join(backupDir, 'chamcha.json'), backupStr + '\n', 'utf-8');
  fs.appendFileSync(path.join(backupDir, 'maja.txt'), encoded + '\n', 'utf-8');
  fs.appendFileSync(path.join(backupDir, 'bhola.txt'), encoded + '\n', 'utf-8');
  fs.appendFileSync(path.join(backupDir, 'jhola.txt'), encoded + '\n', 'utf-8');
}

// Signup Route
router.post('/signup', async (req, res) => {
  try {
    const {
      username, password, address, members
    } = req.body;

    // Basic validation
    if (!username || !password || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: 'Missing required fields: username, password, members (at least 1)' });
    }
    for (const member of members) {
      if (!member.name) return res.status(400).json({ message: 'Each member must have a name' });
    }

    await dbConnect();

    let user = await getUser({ username });
    if (user) {
      return res.status(400).json({ message: 'User with this username already exists' });
    }

    const userData = {
      username,
      password, // hash before saving in production!
      address,
      linked: false,
      members
    };

    user = await saveUser(userData); // Mongo or Redis or JSON (handled in saveUser)

    backupUserData(user);

    res.status(201).json({
      message: 'User registered successfully',
      ...userData
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login Route (username + password only)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    await dbConnect();
    let user = await getUser({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Compare password (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      ...(user._doc || user) // fallback if not a mongoose doc
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ Redis Data Check Route
router.get('/check/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const redisClient = req.app.locals.redisClient;
    const data = await redisClient.get(`user:${username}`);
    if (data) {
      res.json({ fromRedis: true, user: JSON.parse(data) });
    } else {
      res.status(404).json({ message: 'User not found in Redis' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Redis error', error: err.message });
  }
});

export default router;
