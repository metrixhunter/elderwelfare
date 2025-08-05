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
  Box,
  Link as MuiLink
} from '@mui/material';
import { decrypt } from '@/app/utils/encryption';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();

  const setError = (msg) => {
    setMessage(msg);
    setOpenSnackbar(true);
  };

  const localClientFallbackLogin = ({ username: u, password: p }) => {
    // Look through the local storage backups you use on signup
    const files = ['chamcha.json', 'maja.txt', 'jhola.txt', 'bhola.txt'];
    for (const file of files) {
      const item = localStorage.getItem(file);
      if (!item) continue;

      // Try to parse JSON directly first
      let user = null;
      try {
        user = JSON.parse(item);
      } catch {
        // If not JSON, try decrypt
        try {
          user = decrypt(item);
        } catch {
          // not usable
          continue;
        }
      }

      if (!user) continue;
      if (user.username === u && user.password === p) {
        // Local login success
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('phone', user.phone?.number || '');
        localStorage.setItem('loggedIn', 'true');
        return true;
      }
    }
    return false;
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      return setError('Please enter your username.');
    }
    if (!password) {
      return setError('Please enter your password.');
    }

    // Primary: call the single consolidated server route that does all backend checks.
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      // Try to parse body (server should return JSON)
      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (res.ok && data && data.success) {
        // Server authenticated user (could be from Mongo/Redis/Firebase/local) -> redirect to dashboard
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('phone', data.phone || '');
        localStorage.setItem('loggedIn', 'true');
        router.push('/dashboard');
        return;
      }

      // If server responded but auth failed, show message (do NOT redirect)
      if (data && !data.success) {
        const msg = data.message || 'Login failed. Check credentials.';
        return setError(msg);
      }

      // If server didn't respond properly but no network error (res not ok without body)
      if (!res.ok) {
        const statusMsg = (data && data.message) || `Login failed (status ${res.status})`;
        return setError(statusMsg);
      }
    } catch (networkErr) {
      // Network / server unreachable -> fall back to local client checks
      console.warn('[Login] Server unreachable, attempting local fallback:', networkErr);
      const ok = localClientFallbackLogin({ username, password });
      if (ok) {
        router.push('/dashboard');
        return;
      } else {
        return setError('Server unreachable and local fallback did not find the user.');
      }
    }

    // As a last fallback (paranoia): try client-side local backups
    try {
      const ok = localClientFallbackLogin({ username, password });
      if (ok) {
        router.push('/dashboard');
        return;
      } else {
        setError('Login failed. Invalid credentials or user not found.');
      }
    } catch (e) {
      console.error('[Login] Unexpected fallback error:', e);
      setError('Unexpected error during login.');
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
        <Box textAlign="left" ml={0.5}>
          <MuiLink href="/otp" underline="hover" sx={{ fontSize: '0.95rem' }}>
            Forgot username?
          </MuiLink>
        </Box>

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Box textAlign="left" ml={0.5}>
          <MuiLink href="/otp" underline="hover" sx={{ fontSize: '0.95rem' }}>
            Forgot password?
          </MuiLink>
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
    </Container>
  );
}
