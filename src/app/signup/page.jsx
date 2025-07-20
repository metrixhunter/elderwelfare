'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
} from '@mui/material';
import FinEdgeLogo from '@/app/components/FinEdgeLogo';
import { encrypt } from '@/app/utils/encryption';

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

const banks = ['ICICI', 'AXIS', 'SBI', 'HDFC'];

// Helper for saving to public/user_data via the browser (append)
async function saveToPublicFolder(filename, value) {
  try {
    let key = `public_user_data_${filename}`;
    let existing = localStorage.getItem(key) || '';
    localStorage.setItem(key, existing + value + '\n');
  } catch (err) {
    // Ignore
  }
}

// Helper: Simulate a Redis user entry in localStorage
function saveToRedisLike(phone, userObj) {
  try {
    localStorage.setItem(`user:${phone}`, JSON.stringify(userObj));
  } catch {}
}

// Helper: Generate random bank, account number, debit card number
function getRandomBank() {
  return banks[Math.floor(Math.random() * banks.length)];
}
function getRandomAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
function getRandomDebitCardNumber() {
  return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}

// Helper: Try Redis API if Mongo fails
async function tryRedisSignup(userData, setSuccess, setErrorMsg, setOpenSnackbar, redirectToOtp) {
  try {
    // Try a dedicated redis signup endpoint (if you have one)
    const res = await fetch('/api/auth/redis-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Redis signup failed');
    }

    // Save to sessionStorage for OTP and later flow
    sessionStorage.setItem('username', userData.username);
    sessionStorage.setItem('phone', userData.phone);
    sessionStorage.setItem('countryCode', userData.countryCode);
    if (data.bank) sessionStorage.setItem('bank', data.bank);
    if (data.accountNumber) sessionStorage.setItem('accountNumber', data.accountNumber);
    if (data.debitCardNumber) sessionStorage.setItem('debitCardNumber', data.debitCardNumber);

    // --- NEW: Save number with country code to localStorage for OTP page ---
    localStorage.setItem('otp_temp_phone', userData.phone);
    localStorage.setItem('otp_temp_countryCode', userData.countryCode);

    setSuccess(true);
    setErrorMsg('Signed up using Redis fallback! Please enter the OTP sent to your phone.');
    setOpenSnackbar(true);
    setTimeout(redirectToOtp, 900);
    return true;
  } catch (err) {
    return false;
  }
}

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();

  const redirectToOtp = () => {
    router.push(`/otp?redirect=/accountfound`);
  };

  const handleSignup = async () => {
    if (!username.trim()) {
      setErrorMsg('Please enter a username.');
      setOpenSnackbar(true);
      return;
    }
    if (!phone.match(/^\d{10}$/)) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      setOpenSnackbar(true);
      return;
    }
    if (!countryCode) {
      setErrorMsg('Please select your country code.');
      setOpenSnackbar(true);
      return;
    }

    // If signup is saved locally, assign random bank/account/card
    const userData = {
      username,
      phone,
      countryCode,
      bank: getRandomBank(),
      accountNumber: getRandomAccountNumber(),
      debitCardNumber: getRandomDebitCardNumber(),
      linked: false,
      timestamp: new Date().toISOString(),
    };

    try {
      // Try MongoDB-backed signup
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, phone, countryCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        // If error is MongoDB unreachable, try Redis
        if (data.message && data.message.toLowerCase().includes('mongo')) {
          const redisSuccess = await tryRedisSignup(userData, setSuccess, setErrorMsg, setOpenSnackbar, redirectToOtp);
          if (redisSuccess) return;
        }
        setErrorMsg(data.message || 'Signup failed');
        setOpenSnackbar(true);
      } else {
        setSuccess(true);
        // Save all data to sessionStorage for OTP and later flow
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('phone', phone);
        sessionStorage.setItem('countryCode', countryCode);
        if (data.bank) sessionStorage.setItem('bank', data.bank);
        if (data.accountNumber) sessionStorage.setItem('accountNumber', data.accountNumber);
        if (data.debitCardNumber) sessionStorage.setItem('debitCardNumber', data.debitCardNumber);

        // --- NEW: Save number with country code to localStorage for OTP page ---
        localStorage.setItem('otp_temp_phone', phone);
        localStorage.setItem('otp_temp_countryCode', countryCode);

        setOpenSnackbar(true);
        setTimeout(redirectToOtp, 900);
      }
    } catch (err) {
      // Server unreachable — fallback: save locally to both localStorage and to keys simulating public/user_data and redis
      try {
        // Save to simulated Redis
        saveToRedisLike(phone, userData);

        // Save local version for "mongo"
        localStorage.setItem('chamcha.json', JSON.stringify(userData));
        localStorage.setItem('maja.txt', encrypt({ username, phone, countryCode }));
        localStorage.setItem('jhola.txt', encrypt({ username, phone, countryCode }));
        localStorage.setItem('bhola.txt', encrypt({ username, phone, countryCode, timestamp: userData.timestamp }));

        // Save to public folder simulation (localStorage-based fallback)
        await saveToPublicFolder('chamcha.json', JSON.stringify(userData));
        await saveToPublicFolder('maja.txt', encrypt({ username, phone, countryCode }));
        await saveToPublicFolder('jhola.txt', encrypt({ username, phone, countryCode }));
        await saveToPublicFolder('bhola.txt', encrypt({ username, phone, countryCode, timestamp: userData.timestamp }));

        // --- NEW: Save number with country code to localStorage for OTP page ---
        localStorage.setItem('otp_temp_phone', phone);
        localStorage.setItem('otp_temp_countryCode', countryCode);

        setSuccess(true);
        setErrorMsg('Server unreachable. Data saved locally and in Redis simulation.');
        setOpenSnackbar(true);
        setTimeout(redirectToOtp, 1200);
      } catch (error) {
        setErrorMsg('Failed to save data locally.');
        setOpenSnackbar(true);
      }
    }
  };

  return (
    <Container maxWidth="xs" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper elevation={3} style={{ padding: '2rem', width: '100%', textAlign: 'center' }}>
        <FinEdgeLogo />
        <Typography variant="h5" gutterBottom>Sign Up</Typography>
        {success && <Alert severity="success">Signed up successfully! Please enter the OTP sent to your phone.</Alert>}

        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/, ''))}
            sx={{ flex: 1 }}
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '1rem' }}
          onClick={handleSignup}
          disabled={success}
        >
          Sign Up
        </Button>
      </Paper>
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={success ? "success" : "error"}>
          {success
            ? "Signed up successfully! Redirecting to OTP page..."
            : errorMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}