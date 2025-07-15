'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from '@/app/logout/logout';
import FeatureButton from '@/app/components/FeatureButton';

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const isDesktop = useMediaQuery('(min-width:960px)');
  const [bottomNavValue, setBottomNavValue] = useState(0);

  useEffect(() => {
    let username = sessionStorage.getItem('username');
    let phone = sessionStorage.getItem('phone');
    let countryCode = sessionStorage.getItem('countryCode');
    // Fallback: try to restore from localStorage if sessionStorage missing
    if (!username || !phone || !countryCode) {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem('chamcha.json');
        try {
          const local = item ? JSON.parse(item) : {};
          username = username || local.username;
          phone = phone || local.phone;
          countryCode = countryCode || local.countryCode;
          if (username) sessionStorage.setItem('username', username);
          if (phone) sessionStorage.setItem('phone', phone);
          if (countryCode) sessionStorage.setItem('countryCode', countryCode);
        } catch {}
      }
    }
    if (!username || !phone || !countryCode) {
      router.replace('/dashboard');
      return;
    }
    setUser({ username, phone, countryCode });
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Actions for navigation
  const navItems = [
    { label: 'Scan', icon: <QrCodeScannerIcon />, href: '/scan' },
    { label: 'Send', icon: <PhoneAndroidIcon />, href: '/send-mobile' },
    { label: 'Home', icon: <AccountBalanceWalletIcon />, href: '/dashboard' },
    { label: 'Balance', icon: <HistoryIcon />, href: '/balance' },
    { label: 'Help', icon: <HelpOutlineIcon />, href: '/support' },
  ];

  // Sidebar links (desktop)
  const sidebarLinks = [
    { label: 'Dashboard', icon: <MenuIcon />, href: '/dashboard' },
    { label: 'Scan & Pay', icon: <QrCodeScannerIcon />, href: '/scan' },
    { label: 'To Mobile/Contact', icon: <PhoneAndroidIcon />, href: '/send-mobile' },
    { label: 'To Bank Account', icon: <AccountBalanceIcon />, href: '/send-bank' },
    { label: 'To Self Account', icon: <PersonIcon />, href: '/send-self' },
    { label: 'Balance & History', icon: <HistoryIcon />, href: '/balance' },
    { label: 'Check Balance', icon: <AccountBalanceWalletIcon />, href: '/balance' },
    { label: 'Receive Money', icon: <DoneAllIcon />, href: '/receive' },
    { label: 'Help & Support', icon: <HelpOutlineIcon />, href: '/support' },
    { label: 'Mobile Recharge', icon: <PhoneAndroidIcon />, href: '/recharge-mobile' },
    { label: 'Electricity Bill', icon: <FlashOnIcon />, href: '/electricity' },
    { label: 'Credit Card Home', icon: <CreditCardIcon />, href: '/credit-card' },
    { label: 'View All', icon: <CheckCircleOutlineIcon />, href: '/bills' },
    { label: 'Logout', icon: <LogoutIcon />, onClick: handleLogout },
  ];

  // Sidebar width (desktop)
  const sidebarWidth = sidebarOpen ? 240 : 56;

  // Main Content
  return (
    <Box sx={{ bgcolor: '#f4f8fb', minHeight: '100vh', pb: { xs: 7, md: 4 } }}>
      {/* Fixed Logout Button (top right, always visible) */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 24,
          zIndex: 1400,
          fontWeight: 600,
          bgcolor: '#1976d2',
          color: '#fff',
          borderRadius: 2,
          px: { xs: 2, md: 3 },
          py: 1,
          boxShadow: 2,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Button
          color="inherit"
          onClick={handleLogout}
          sx={{
            fontWeight: 500,
            px: { xs: 1.5, md: 2.5 },
            fontSize: { xs: '0.97rem', md: '1rem' },
            minWidth: 0,
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Sidebar for Desktop */}
      {isDesktop && (
        <Box
          sx={{
            position: 'fixed',
            top: 64,
            left: 0,
            height: '100vh',
            width: sidebarWidth,
            bgcolor: '#fff',
            borderRight: sidebarOpen ? '1px solid #e0e0e0' : 'none',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            pt: 2,
            transition: 'width 0.2s',
            overflowX: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', px: 1, mb: 2 }}>
            <Tooltip title={sidebarOpen ? 'Hide Menu' : 'Show Menu'}>
              <IconButton
                sx={{ color: '#1976d2', mr: 1 }}
                onClick={() => setSidebarOpen((v) => !v)}
                edge="start"
              >
                {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
              </IconButton>
            </Tooltip>
            {sidebarOpen && (
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2', flex: 1 }}>
                Dashboard
              </Typography>
            )}
          </Box>
          <List>
            {sidebarLinks.map((item, idx) => (
              <ListItem
                button
                key={item.label}
                onClick={() => {
                  if (item.href) router.push(item.href);
                  if (item.onClick) item.onClick();
                }}
                sx={{
                  minHeight: 48,
                  px: 1,
                  ...(sidebarOpen ? {} : { justifyContent: 'center' }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: sidebarOpen ? 2 : 'auto', justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && <ListItemText primary={item.label} />}
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Main Content */}
      <Container
        maxWidth="sm"
        sx={{
          ml: { md: `${sidebarWidth}px` },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          pt: 3,
          pb: { xs: 7, md: 4 }, // Leave space for bottom nav on mobile
        }}
      >
        {user && (
          <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2', fontWeight: 500 }}>
            Welcome, {user.username}!
          </Typography>
        )}
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: 420,
            mb: 3,
            p: 2,
            borderRadius: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            bgcolor: '#e3f1fa',
          }}
        >
          <FlashOnIcon sx={{ fontSize: 34, color: '#1976d2' }} />
          <Typography variant="body2" sx={{ flex: 1 }}>
            <b>Lightning Fast Payments</b> &nbsp; | &nbsp; <b>100% Safe</b>
          </Typography>
        </Paper>
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 480,
            p: 3,
            borderRadius: 3,
            mb: 3,
            bgcolor: '#fff',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
            Money Transfer
          </Typography>
          <Grid container spacing={2}>
            {sidebarLinks
              .filter(a =>
                [
                  'Scan & Pay',
                  'To Mobile/Contact',
                  'To Bank Account',
                  'To Self Account',
                  'Balance & History',
                  'Check Balance',
                  'Receive Money',
                  'Help & Support',
                ].includes(a.label)
              )
              .map((action, idx) => (
                <Grid
                  item
                  xs={3}
                  sm={2}
                  md={2}
                  key={action.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <FeatureButton icon={action.icon} label={action.label} href={action.href} />
                </Grid>
              ))}
          </Grid>
        </Paper>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          sx={{
            maxWidth: 480,
            mb: 2,
            borderRadius: 2,
            py: 1.2,
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: 0.5,
            bgcolor: '#fff',
            borderColor: '#1976d2'
          }}
          onClick={() => router.push('/accountfound')}
        >
          + Link Bank Account
        </Button>
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: 480,
            p: 3,
            borderRadius: 3,
            mb: 2,
            bgcolor: '#fff',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 600 }}>
            Bill Payments by BBPS
          </Typography>
          <Grid container spacing={2}>
            {sidebarLinks
              .filter(a =>
                [
                  'Mobile Recharge',
                  'Electricity Bill',
                  'Credit Card Home',
                  'View All',
                ].includes(a.label)
              )
              .map((action, idx) => (
                <Grid
                  item
                  xs={3}
                  sm={2}
                  md={2}
                  key={action.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <FeatureButton icon={action.icon} label={action.label} href={action.href} />
                </Grid>
              ))}
          </Grid>
        </Paper>
      </Container>

      {/* Bottom Navigation for Mobile (like Paytm) */}
      {!isDesktop && (
        <Box sx={{
          width: '100vw',
          position: 'fixed',
          bottom: 0,
          left: 0,
          zIndex: 1300,
          bgcolor: '#fff',
          borderTop: '1px solid #e0e0e0',
        }}>
          <BottomNavigation
            showLabels
            value={bottomNavValue}
            onChange={(_e, newValue) => {
              setBottomNavValue(newValue);
              if (navItems[newValue].href) router.push(navItems[newValue].href);
            }}
            sx={{ height: 64 }}
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.label}
                label={item.label}
                icon={item.icon}
              />
            ))}
            <BottomNavigationAction
              key="Logout"
              label="Logout"
              icon={<LogoutIcon />}
              onClick={handleLogout}
            />
          </BottomNavigation>
        </Box>
      )}
    </Box>
  );
}