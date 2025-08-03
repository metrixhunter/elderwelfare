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

  const handleLogin = async () => {
    if (!username.trim()) {
      setMessage('Please enter your username.');
      setOpenSnackbar(true);
      return;
    }
    if (!password) {
      setMessage('Please enter your password.');
      setOpenSnackbar(true);
      return;
    }

    try {
      // Try server login first
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('phone', data.phone || '');
        localStorage.setItem('loggedIn', 'true');
        router.push('/otp');
        return;
      }
    } catch (_) {
      // If backend fails, try fallback
    }

    // === Fallback to localStorage ===
    try {
      const files = ['chamcha.json', 'maja.txt', 'jhola.txt', 'bhola.txt'];
      let found = false;

      for (const file of files) {
        const encrypted = localStorage.getItem(file);
        if (!encrypted) continue;

        let user;
        try {
          user = JSON.parse(encrypted);
        } catch {
          try {
            user = decrypt(encrypted);
          } catch {
            continue;
          }
        }

        if (user?.username === username && user?.password === password) {
          localStorage.setItem('loggedIn', 'true');
          sessionStorage.setItem('username', user.username);
          sessionStorage.setItem('phone', user.members?.[0]?.phoneNumbers?.[0] || '');
          router.push('/otp');
          return;
        }
      }

      setMessage('Login failed. Invalid credentials or user not found.');
      setOpenSnackbar(true);
    } catch (err) {
      setMessage('Unexpected error during login.');
      setOpenSnackbar(true);
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
          <MuiLink
            href="/otp"
            underline="hover"
            sx={{ fontSize: '0.95rem', cursor: 'pointer' }}
          >
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
          <MuiLink
            href="/otp"
            underline="hover"
            sx={{ fontSize: '0.95rem', cursor: 'pointer' }}
          >
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
  