'use client';

import { useState } from 'react';
import { Container, Typography, TextField, Button, Paper, Snackbar, Alert } from '@mui/material';

const PASSWORD = 'finlock123';

export default function SecretUserView() {
  const [password, setPassword] = useState('');
  const [access, setAccess] = useState(false);
  const [data, setData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const handleAccess = () => {
    if (password === PASSWORD) {
      try {
        const item = localStorage.getItem('chamcha.json');
        setData(item ? JSON.parse(item) : {});
        setAccess(true);
      } catch {
        setData({});
        setAccess(true);
      }
    } else {
      setSnackbar({ open: true, message: 'Incorrect password.', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Paper style={{ padding: '2rem' }}>
        {!access ? (
          <>
            <Typography variant="h6" gutterBottom>Admin Access</Typography>
            <Typography sx={{ mb: 1 }}>Enter password:</Typography>
            <TextField
              fullWidth
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="off"
            />
            <Button variant="contained" onClick={handleAccess}>Submit</Button>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>Local User Backup</Typography>
            <pre style={{ maxHeight: 400, overflow: 'auto', background: '#f5f5f5', padding: 10 }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </>
        )}
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}