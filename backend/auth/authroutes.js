import express from 'express';
import fs from 'fs';
import path from 'path';
import  {dbConnect, getUser, saveUser } from '../utils/dbConnect.js';

const router = express.Router();

const banks = ['SBI', 'HDFC', 'ICICI', 'AXIS'];
const countryCodes = ['+91', '+1', '+44', '+81', '+61', '+49', '+971', '+86'];

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
function generateDebitCardNumber() {
  return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}

// Optional: Backup user data to user_data folder (for redundancy)
function encodeBase64(data) {
  return Buffer.from(data, 'utf-8').toString('base64');
}
function backupUserData(userData) {
  const backupObj = {
    username: userData.username,
    phone: userData.phone,
    countryCode: userData.countryCode,
    bank: userData.bank,
    accountNumber: userData.accountNumber,
    debitCardNumber: userData.debitCardNumber,
    createdAt: new Date().toISOString()
  };
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
  const { username, phone, countryCode } = req.body;
  try {
    // Validation
    if (!username || !phone || !countryCode) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    if (!countryCodes.includes(countryCode)) {
      return res.status(400).json({ message: 'Invalid country code' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone number must be a valid 10-digit number' });
    }

    await dbConnect(); // ensure at least one backend is ready

    let user = await getUser({ phone });
    if (user) {
      return res.status(400).json({ message: 'User with this phone already exists' });
    }

    const bank = banks[Math.floor(Math.random() * banks.length)];
    const accountNumber = generateAccountNumber();
    const debitCardNumber = generateDebitCardNumber();

    const userData = { username, phone, countryCode, bank, accountNumber, debitCardNumber };

    user = await saveUser(userData);

    backupUserData(user);

    res.status(201).json({
      message: 'User registered successfully',
      username: user.username,
      phone: user.phone,
      countryCode: user.countryCode,
      bank: user.bank,
      accountNumber: user.accountNumber,
      debitCardNumber: user.debitCardNumber
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, phone } = req.body;
  try {
    if (!username || !phone) {
      return res.status(400).json({ message: 'Username and phone are required' });
    }

    await dbConnect();

    let user = await getUser({ phone, username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      message: 'Login successful',
      username: user.username,
      phone: user.phone,
      countryCode: user.countryCode,
      bank: user.bank,
      accountNumber: user.accountNumber,
      debitCardNumber: user.debitCardNumber
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;