'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';

export default function OtpClient() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [sending, setSending] = useState(true);
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [username, setUsername] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get phone, countryCode, username from sessionStorage
const _phone = sessionStorage.getItem('phone') || localStorage.getItem('otp_temp_phone');
const _countryCode = sessionStorage.getItem('countryCode') || localStorage.getItem('otp_temp_countryCode');
    const _username = sessionStorage.getItem('username');
    setPhone(_phone || '');
    setCountryCode(_countryCode || '');
    setUsername(_username || '');

    // Send OTP only if phone and countryCode exist
    if (_phone && _countryCode) {
      sendOtp(_countryCode + _phone);
    } else {
      setSnackbar({
        open: true,
        message: 'Missing phone or country code. Please retry.',
        severity: 'error',
      });
      setSending(false);
    }
    // eslint-disable-next-line
  }, []);

  const sendOtp = async (_fullPhone) => {
    setSending(true);
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: _fullPhone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnackbar({ open: true, message: 'OTP sent to your phone.', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.message || 'Failed to send OTP.', severity: 'error' });
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'Error sending OTP.', severity: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnackbar({ open: false, message: '', severity: 'info' });

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: countryCode + phone,
          code: otp,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSnackbar({ open: true, message: 'OTP verified successfully!', severity: 'success' });
        setTimeout(() => {
          const redirect = searchParams.get('redirect');
          router.replace(redirect || '/accountfound');
        }, 1000);
      } else {
        setSnackbar({ open: true, message: data.message || 'Invalid OTP. Please try again.', severity: 'error' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Error verifying OTP. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Optionally, let user resend the OTP
  const handleResend = async () => {
    if (!phone || !countryCode) return;
    await sendOtp(countryCode + phone);
  };

  return (
    <Container maxWidth="xs" sx={{
      display: 'flex', alignItems: 'center', minHeight: '100vh', justifyContent: 'center'
    }}>
      <Paper elevation={3} sx={{
        width: '100%', p: 3, textAlign: 'center', borderRadius: '20px'
      }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Enter OTP
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {phone && countryCode
            ? `Please enter the 6-digit OTP sent to ${countryCode} ${phone}.`
            : 'No phone number found.'}
        </Typography>
        <Box component="form" onSubmit={handleVerifyOtp} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="OTP"
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/, '').slice(0, 6))}
            fullWidth
            inputProps={{ maxLength: 6, inputMode: 'numeric', pattern: '[0-9]*' }}
            required
            autoFocus
            disabled={sending}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || otp.length !== 6 || sending}
            fullWidth
            sx={{ fontWeight: 600, borderRadius: 8, mt: 1 }}
          >
            {loading ? <CircularProgress size={22} /> : 'Verify OTP'}
          </Button>

          <Button
            variant="text"
            color="secondary"
            disabled={sending}
            onClick={handleResend}
            sx={{ mt: 0 }}
          >
            {sending ? <CircularProgress size={18} /> : 'Resend OTP'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}