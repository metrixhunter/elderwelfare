'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button, Container, Typography } from '@mui/material';

export default function AuthButtons() {
  const router = useRouter();

  useEffect(() => {
    router.push('/'); // ✅ Redirects users to `app/page.jsx`
  }, []);

  return (
    <Container maxWidth="md" style={{ textAlign: 'center', padding: '2rem' }}>
      <Typography variant="h4">🔹 Welcome to FinEdge</Typography>
      <Typography variant="body1">
        Securely manage your finances. Log in or sign up to get started.
      </Typography>

      {/* Redirect Notification */}
      <Typography variant="h6" style={{ marginTop: '1rem' }}>Redirecting to Main Page...</Typography>
      <p>If not redirected automatically, <a href="/">click here</a>.</p>

      {/* Button Group */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" href="/login">🔑 Login</Button>
        <Button variant="contained" color="secondary" href="/signup">📝 Signup</Button>
      </div>
    </Container>
  );
}











