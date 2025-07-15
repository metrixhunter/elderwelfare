'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Snackbar,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
} from '@mui/material';
import FinEdgeLogo from '@/app/components/FinEdgeLogo';

// Pre-defined ITU country codes (add/remove as needed)
const countryCodes = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'USA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+81', label: 'Japan (+81)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+86', label: 'China (+86)' },
];

// Helper to decode base64 (browser-safe)
function decodeBase64Json(line) {
  try {
    return JSON.parse(atob(line));
  } catch {
    return null;
  }
}

// Helper for fetching and parsing public/user_data files
async function findUserInPublicBackup({ username, phone, countryCode }) {
  // 1. Try chamcha.json (plain JSON, newline separated)
  try {
    const res = await fetch('/user_data/chamcha.json');
    if (res.ok) {
      const text = await res.text();
      const lines = text.split('\n').filter(Boolean);
      for (const line of lines) {
        let user;
        try { user = JSON.parse(line); } catch { continue; }
        if (
          user.username === username &&
          user.phone === phone &&
          user.countryCode === countryCode
        ) {
          return user;
        }
      }
    }
  } catch {}
  // 2. Try maja.txt, jhola.txt, bhola.txt (base64-encoded JSON, newline separated)
  for (const file of ['maja.txt', 'jhola.txt', 'bhola.txt']) {
    try {
      const res = await fetch(`/user_data/${file}`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.split('\n').filter(Boolean);
        for (const line of lines) {
          const user = decodeBase64Json(line);
          if (
            user &&
            user.username === username &&
            user.phone === phone &&
            user.countryCode === countryCode
          ) {
            return user;
          }
        }
      }
    } catch {}
  }
  return null;
}

// Helper: Try Redis-like localStorage for user
function findUserInRedisLike({ username, phone, countryCode }) {
  try {
    const raw = localStorage.getItem(`user:${phone}`);
    if (raw) {
      const user = JSON.parse(raw);
      if (
        user.username === username &&
        user.phone === phone &&
        user.countryCode === countryCode
      ) {
        return user;
      }
    }
  } catch {}
  return null;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();

  // Optional: Allow some hardcoded users
  const predefinedUsers = [
    { username: 'Kamla', phone: '9999999999', countryCode: '+91' },
    { username: 'Rohan', phone: '8888888888', countryCode: '+91' },
  ];

  // Helper: Try Redis API if Mongo fails
  async function tryRedisLogin({ username, phone, countryCode }) {
    try {
      const res = await fetch('/api/auth/redis-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, countryCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data;
      }
    } catch {}
    return null;
  }

  const handleLogin = async () => {
    // 1. Check against predefined users (optional)
    for (const user of predefinedUsers) {
      if (
        user.phone === phone &&
        user.username === username &&
        user.countryCode === countryCode
      ) {
        localStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('phone', user.phone);
        sessionStorage.setItem('countryCode', user.countryCode);
        // Demo bank details for hardcoded users
        sessionStorage.setItem('bank', 'Demo Bank');
        sessionStorage.setItem('accountNumber', '1234567890');
        sessionStorage.setItem('debitCardNumber', '1234567890123456');
        router.push('/otp');
        return;
      }
    }

    // 2. Backend authentication (using username, phone, and countryCode)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, countryCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // If MongoDB unreachable/fails, try Redis
        if (data.message && data.message.toLowerCase().includes('mongo')) {
          const redisData = await tryRedisLogin({ username, phone, countryCode });
          if (redisData) {
            localStorage.setItem('loggedIn', 'true');
            sessionStorage.setItem('username', redisData.username);
            sessionStorage.setItem('phone', redisData.phone);
            sessionStorage.setItem('countryCode', redisData.countryCode);
            if (redisData.bank) sessionStorage.setItem('bank', redisData.bank);
            if (redisData.accountNumber) sessionStorage.setItem('accountNumber', redisData.accountNumber);
            if (redisData.debitCardNumber) sessionStorage.setItem('debitCardNumber', redisData.debitCardNumber);
            router.push('/otp');
            return;
          }
        }
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('username', data.username);
      sessionStorage.setItem('phone', data.phone);
      sessionStorage.setItem('countryCode', data.countryCode);
      if (data.bank) sessionStorage.setItem('bank', data.bank);
      if (data.accountNumber) sessionStorage.setItem('accountNumber', data.accountNumber);
      if (data.debitCardNumber) sessionStorage.setItem('debitCardNumber', data.debitCardNumber);
      router.push('/otp');
    } catch (err) {
      // 3. Try Redis-like localStorage
      const redisLikeUser = findUserInRedisLike({ username, phone, countryCode });
      if (redisLikeUser) {
        sessionStorage.setItem('username', redisLikeUser.username);
        sessionStorage.setItem('phone', redisLikeUser.phone);
        sessionStorage.setItem('countryCode', redisLikeUser.countryCode);
        sessionStorage.setItem('bank', redisLikeUser.bank || 'icici Bank');
        sessionStorage.setItem('accountNumber', redisLikeUser.accountNumber || '1234567890');
        sessionStorage.setItem('debitCardNumber', redisLikeUser.debitCardNumber || '1234567890123456');
        localStorage.setItem('loggedIn', 'true');
        router.push('/otp');
        return;
      }

      // 4. Offline fallback: check chamcha.json or localStorage (username, phone, countryCode)
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('chamcha.json');
          let offlineUser = null;
          if (raw) {
            try {
              offlineUser = JSON.parse(raw);
            } catch {
              offlineUser = {};
            }
          }

          if (
            offlineUser &&
            offlineUser.phone === phone &&
            offlineUser.username === username &&
            offlineUser.countryCode === countryCode
          ) {
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('phone', phone);
            sessionStorage.setItem('countryCode', countryCode);
            // fallback bank details for offline
            sessionStorage.setItem('bank', offlineUser.bank || 'icici Bank');
            sessionStorage.setItem('accountNumber', offlineUser.accountNumber || '1234567890');
            sessionStorage.setItem('debitCardNumber', offlineUser.debitCardNumber || '1234567890123456');
            localStorage.setItem('loggedIn', 'true');
            router.push('/otp');
            return;
          }
        }

        // 5. Try public/user_data backups (fetch from public folder)
        const backupUser = await findUserInPublicBackup({ username, phone, countryCode });
        if (backupUser) {
          sessionStorage.setItem('username', backupUser.username);
          sessionStorage.setItem('phone', backupUser.phone);
          sessionStorage.setItem('countryCode', backupUser.countryCode);
          sessionStorage.setItem('bank', backupUser.bank || 'icici Bank');
          sessionStorage.setItem('accountNumber', backupUser.accountNumber || '1234567890');
          sessionStorage.setItem('debitCardNumber', backupUser.debitCardNumber || '1234567890123456');
          localStorage.setItem('loggedIn', 'true');
          router.push('/otp');
          return;
        }

        setMessage('Server unreachable and no matching user found.');
        setOpenSnackbar(true);
      } catch (fallbackErr) {
        setMessage('Offline login failed. Try again later.');
        setOpenSnackbar(true);
      }
    }
  };

  return (
    <Container
      maxWidth="xs"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '1rem',
        position: 'relative',
      }}
    >
      <FinEdgeLogo />
      <Paper
        elevation={3}
        style={{ padding: '2rem', width: '100%', textAlign: 'center' }}
      >
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <Box display="flex" gap={1} alignItems="center">
          <FormControl sx={{ minWidth: 100 }}>
            <InputLabel id="country-code-label">Code</InputLabel>
            <Select
              labelId="country-code-label"
              id="country-code"
              value={countryCode}
              label="Code"
              onChange={e => setCountryCode(e.target.value)}
              size="small"
            >
              {countryCodes.map((option) => (
                <MenuItem value={option.code} key={option.code}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Phone Number"
            type="tel"
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/, ''))}
            required
            sx={{ flex: 1 }}
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '1rem' }}
          onClick={handleLogin}
        >
          Log In
        </Button>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="error">{message}</Alert>
      </Snackbar>

      {/* 🔒 Hidden admin link */}
      <div
        title="Please"
        onClick={() => router.push('/secret')}
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: 'transparent',
          position: 'absolute',
          bottom: '5px',
          right: '5px',
          cursor: 'pointer',
        }}
      />
    </Container>
  );
}