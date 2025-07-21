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

// Login with just username & password, plus forgot links.
// All other fields and image upload are removed.

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

    // 1. Backend authentication (username, password)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('username', data.username);
        router.push('/otp');
        return;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      setMessage('Login failed. Please check your credentials.');
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