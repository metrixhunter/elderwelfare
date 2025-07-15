'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Stack,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaidIcon from '@mui/icons-material/Paid';
import LinkIcon from '@mui/icons-material/Link';

const bankList = [
  {
    name: 'State Bank of India',
    id: 'sbi',
    logo: '/bank-icons/sbi.png',
    desc: 'Check SBI account summary',
  },
  {
    name: 'HDFC Bank',
    id: 'hdfc',
    logo: '/bank-icons/hdfc.png',
    desc: 'Check HDFC account summary',
  },
  {
    name: 'ICICI Bank',
    id: 'icici',
    logo: '/bank-icons/icici.png',
    desc: 'Check ICICI account summary',
  },
  {
    name: 'Axis Bank',
    id: 'axis',
    logo: '/bank-icons/axis.png',
    desc: 'Check Axis account summary',
  },
];

export default function BalancePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [linkedBank, setLinkedBank] = useState(null);

  useEffect(() => {
    // Try sessionStorage first
    const username = sessionStorage.getItem('username');
    const bank = sessionStorage.getItem('bank');
    const accountNumber = sessionStorage.getItem('accountNumber');

    if (username && bank && accountNumber) {
      setUser({ username, bank, accountNumber });

      // Find linked bank in list
      const found = bankList.find(b => b.id === bank.toLowerCase());
      if (found) {
        setLinkedBank({
          ...found,
          accountNumber,
        });
      }
      return;
    }

    // Fallback: Try reading from localStorage (chamcha.json)
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem('chamcha.json');
      try {
        const localUser = item ? JSON.parse(item) : {};
        if (localUser.username && localUser.bank && localUser.accountNumber) {
          setUser(localUser);
          // Find linked bank in list
          const found = bankList.find(b => b.id === localUser.bank.toLowerCase());
          if (found) {
            setLinkedBank({
              ...found,
              accountNumber: localUser.accountNumber,
            });
          }
        } else {
          router.replace('/balance');
        }
      } catch {
        router.replace('/balance');
      }
    } else {
      router.replace('/balance');
    }
  }, [router]);

  const handleBankClick = (bankId) => {
    router.push(`/banks/${bankId}`);
  };

  // Remove linked bank from the list if present
  const otherBanks = linkedBank
    ? bankList.filter(b => b.id !== linkedBank.id)
    : bankList;

  return (
    <Container maxWidth="xs" sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Paper elevation={3} sx={{
        width: '100%',
        borderRadius: 4,
        bgcolor: '#fff',
        textAlign: 'center',
        px: 0,
        py: 3,
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Balance & History
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            View and manage your linked bank accounts
          </Typography>
          <Button
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.78rem', borderRadius: 2 }}
            onClick={() => router.push('/banks')}
          >
            Add Bank A/c
          </Button>
        </Box>
        <Divider />
        <List>
          {/* Linked bank shown on top */}
          {linkedBank && (
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <IconButton edge="end" aria-label="go" onClick={() => handleBankClick(linkedBank.id)}>
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              }
              button
              onClick={() => handleBankClick(linkedBank.id)}
              sx={{
                py: 1.4,
                px: 2,
                bgcolor: '#e2f6ff',
                mb: 0.5,
                border: '2px solid #1976d2',
                borderRadius: 2,
                '&:hover': { bgcolor: '#d0ecff' },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={linkedBank.logo}
                  sx={{ bgcolor: 'white', border: '1px solid #e3e3e3' }}
                  alt={linkedBank.name}
                >
                  <AccountBalanceIcon color="primary" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {linkedBank.name}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: '#1976d2',
                      background: '#e3f2fd',
                      px: 1.2,
                      py: 0.2,
                      borderRadius: 1,
                      fontWeight: 500,
                    }}>
                      ****{linkedBank.accountNumber?.slice(-4)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Linked bank (default for UPI)
                  </Typography>
                }
              />
            </ListItem>
          )}
          {/* Show other banks below */}
          {otherBanks.map((bank) => (
            <ListItem
              key={bank.id}
              alignItems="flex-start"
              secondaryAction={
                <IconButton edge="end" aria-label="go" onClick={() => handleBankClick(bank.id)}>
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              }
              button
              onClick={() => handleBankClick(bank.id)}
              sx={{
                py: 1.2,
                px: 2,
                '&:hover': { bgcolor: '#f4f8fb' },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={bank.logo}
                  sx={{ bgcolor: 'white', border: '1px solid #e3e3e3' }}
                  alt={bank.name}
                >
                  <AccountBalanceIcon color="primary" />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {bank.name}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {bank.desc}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1} px={2}>
          <Box
            sx={{
              py: 1,
              px: 2,
              bgcolor: '#e3f2fd',
              borderRadius: 2,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <CreditCardIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary" flex={1}>
              Credit Card — Get best cashback & rewards!
            </Typography>
            <Button size="small" sx={{ minWidth: 0, fontSize: '0.78rem' }} disabled>
              Apply Now
            </Button>
          </Box>
          <Box
            sx={{
              py: 1,
              px: 2,
              bgcolor: '#e3f2fd',
              borderRadius: 2,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <PaidIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary" flex={1}>
              Personal Loan — Get up to ₹5 lacs!
            </Typography>
            <Button size="small" sx={{ minWidth: 0, fontSize: '0.78rem' }} disabled>
              Get Now
            </Button>
          </Box>
          <Box
            sx={{
              py: 1,
              px: 2,
              bgcolor: '#e3f2fd',
              borderRadius: 2,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <LinkIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary" flex={1}>
              Link Your Bank Account — Super fast UPI money transfers
            </Typography>
            <Button size="small" onClick={() => router.push('/banks')} sx={{ minWidth: 0, fontSize: '0.78rem' }}>
              Proceed
            </Button>
          </Box>
        </Stack>
        <Divider sx={{ mt: 2, mb: 1 }} />
        <Button
          variant="outlined"
          fullWidth
          sx={{ borderRadius: 2, fontWeight: 500, mb: 1 }}
          onClick={() => router.push('/banks')}
        >
          View All Accounts
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          (No transaction history available.)
        </Typography>
      </Paper>
    </Container>
  );
}