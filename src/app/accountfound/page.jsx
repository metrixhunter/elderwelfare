'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Divider,
  Box,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';

export default function AccountFoundPage() {
  const [linkedBank, setLinkedBank] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const router = useRouter();

  useEffect(() => {
    const linked = sessionStorage.getItem('linked');
    if (linked !== 'true') {
      router.replace('/dashboard');
      return;
    }

    // Check for temp_verified_user in localStorage
    let tempVerifiedUser = null;
    try {
      tempVerifiedUser = JSON.parse(localStorage.getItem('temp_verified_user'));
    } catch {
      tempVerifiedUser = null;
    }

    // If temp_verified_user exists, and log is true, and matches sessionStorage user, stay on /accountfound (don't redirect or delete)
    if (
      tempVerifiedUser &&
      tempVerifiedUser.log === true &&
      tempVerifiedUser.phone === sessionStorage.getItem('phone') &&
      tempVerifiedUser.countryCode === sessionStorage.getItem('countryCode')
    ) {
      // Do nothing: stay on /accountfound and keep temp_verified_user
      // (No redirect or removal)
    }

    // Try to get linked bank from sessionStorage first
    const bank = sessionStorage.getItem('bank');
    const accountNumber = sessionStorage.getItem('accountNumber');
    const debitCardNumber = sessionStorage.getItem('debitCardNumber');
    const username = sessionStorage.getItem('username');
    const phone = sessionStorage.getItem('phone');
    const countryCode = sessionStorage.getItem('countryCode');
    if (bank && accountNumber && debitCardNumber) {
      setLinkedBank({
        bank,
        accountNumber,
        debitCardNumber,
        username,
        phone,
        countryCode,
      });
    } else {
      // fallback: try from localStorage
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem('chamcha.json');
        try {
          const local = item ? JSON.parse(item) : {};
          if (
            local.bank &&
            local.accountNumber &&
            local.debitCardNumber
          ) {
            setLinkedBank({
              bank: local.bank,
              accountNumber: local.accountNumber,
              debitCardNumber: local.debitCardNumber,
              username: local.username,
              phone: local.phone,
              countryCode: local.countryCode,
            });
          } else {
            setLinkedBank(null);
          }
        } catch {
          setLinkedBank(null);
        }
      } else {
        setLinkedBank(null);
      }
    }
  }, [router]);

  if (!linkedBank) {
    // In case data is missing (shouldn't happen), optionally show a message or just don't render
    return null;
  }

  return (
    <Container maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', minHeight: '100vh', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ width: '100%', p: 3, textAlign: 'center', borderRadius: '20px' }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Linked Bank Account
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 2, textAlign: 'left' }}>
          <Typography variant="body1"><b>Bank:</b> {linkedBank.bank}</Typography>
          <Typography variant="body1"><b>Account Number:</b> ****{linkedBank.accountNumber.slice(-4)}</Typography>
          <Typography variant="body1"><b>Debit Card Number:</b> ****{linkedBank.debitCardNumber.slice(-4)}</Typography>
          {linkedBank.username && <Typography variant="body1"><b>User:</b> {linkedBank.username}</Typography>}
          {linkedBank.phone && <Typography variant="body1"><b>Phone:</b> {linkedBank.countryCode} {linkedBank.phone}</Typography>}
        </Box>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ borderRadius: 8, fontWeight: 600, px: 2, mb: 1 }}
          onClick={() => router.replace('/dashboard')}
        >
          Go to Dashboard
        </Button>
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