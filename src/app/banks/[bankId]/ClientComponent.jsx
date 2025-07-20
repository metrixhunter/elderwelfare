'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { selectOrOverrideBank } from '../bankUtils';

import {
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';

// Helper to save backup locally (for file/fallback purposes)
async function saveLocalBackup(user) {
  try {
    // Save plain JSON to localStorage (simulating chamcha.json)
    let chamchaKey = 'chamcha.json';
    let existingChamcha = localStorage.getItem(chamchaKey) || '';
    localStorage.setItem(chamchaKey, existingChamcha + JSON.stringify(user) + '\n');
    // Save base64 encoded to maja.txt, jhola.txt, bhola.txt
    const encoded = btoa(JSON.stringify(user));
    for (const file of ['maja.txt', 'jhola.txt', 'bhola.txt']) {
      let existing = localStorage.getItem(file) || '';
      localStorage.setItem(file, existing + encoded + '\n');
    }
  } catch (e) {
    // Ignore client-side errors
  }
}

const bankList = [
  { id: 'icici', name: 'ICICI Bank' },
  { id: 'hdfc', name: 'HDFC Bank' },
  { id: 'sbi', name: 'State Bank of India' },
  { id: 'axis', name: 'Axis Bank' },
];

export default function BankCredentialsCheckPage() {
  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [debitCard, setDebitCard] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const selectedBank = localStorage.getItem('selectedBank');
    if (selectedBank) {
      setBank(selectedBank);
      selectOrOverrideBank(selectedBank);
    }

    function fetchSessionUser() {
      const bank = sessionStorage.getItem('bank');
      const accountNumber = sessionStorage.getItem('accountNumber');
      const debitCardNumber = sessionStorage.getItem('debitCardNumber');
      const countryCode = sessionStorage.getItem('countryCode');
      const phone = sessionStorage.getItem('phone');

      if (bank && accountNumber && debitCardNumber && countryCode && phone) {
        setMessage('✅ Loaded credentials from session');
        setOpenSnackbar(true);
      } else {
        setMessage('Please enter your credentials');
        setOpenSnackbar(true);
      }

      setChecked(true);
    }

    fetchSessionUser();
  }, []);

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setOpenSnackbar(false);

    const user = {
      bank: sessionStorage.getItem('bank'),
      accountNumber: sessionStorage.getItem('accountNumber'),
      debitCardNumber: sessionStorage.getItem('debitCardNumber'),
      countryCode: sessionStorage.getItem('countryCode'),
      phone: sessionStorage.getItem('phone'),
      username: sessionStorage.getItem('username'),
      linked: true,
      timestamp: new Date().toISOString(),
    };

    const match =
      user &&
      user.bank?.toLowerCase() === bank.toLowerCase() &&
      user.accountNumber === accountNumber &&
      user.debitCardNumber === debitCard &&
      user.countryCode === countryCode &&
      user.phone === phone;

    // Check localStorage for otp_temp_phone and otp_temp_countryCode for matching user
    const otpTempPhone = localStorage.getItem('otp_temp_phone');
    const otpTempCountryCode = localStorage.getItem('otp_temp_countryCode');
    const otpTempExistsAndMatches =
      otpTempPhone &&
      otpTempCountryCode &&
      otpTempPhone === user.phone &&
      otpTempCountryCode === user.countryCode;

    if (match) {
      setMessage(`✅ Credentials verified`);
      sessionStorage.setItem('linked', 'true');

      // If temp phone/country code exist and match, delete them
      if (otpTempExistsAndMatches) {
        localStorage.removeItem('otp_temp_phone');
        localStorage.removeItem('otp_temp_countryCode');
      }

      // Save backup locally (simulate file backup for fallback)
      await saveLocalBackup(user);

      // Create a temporary localStorage object with phone, countryCode, and log:true
      localStorage.setItem(
        'temp_verified_user',
        JSON.stringify({
          phone: user.phone,
          countryCode: user.countryCode,
          log: true,
        })
      );

      router.push('/balance');
    } else {
      setMessage('❌ Credentials check failed');
    }

    setOpenSnackbar(true);
    setLoading(false);
  };

  if (!checked) {
    return (
      <Container maxWidth="xs" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Paper elevation={3} style={{ padding: '2rem', width: '100%', textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Verify Bank Credentials
        </Typography>
        <form onSubmit={handleCheck} autoComplete="off">
          <TextField
            label="Account Number"
            fullWidth
            margin="normal"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            required
          />
          <TextField
            label="Debit Card Number"
            fullWidth
            margin="normal"
            value={debitCard}
            onChange={(e) => setDebitCard(e.target.value)}
            required
          />
          <TextField
            label="Country Code"
            fullWidth
            margin="normal"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            required
          />
          <TextField
            label="Phone Number"
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography variant="body2">{countryCode}</Typography>
                </InputAdornment>
              ),
              inputMode: 'numeric',
            }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            style={{ marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify Credentials'}
          </Button>
        </form>
      </Paper>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={message.includes('✅') ? 'success' : 'error'}>{message}</Alert>
      </Snackbar>
    </Container>
  );
}

