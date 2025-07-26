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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Avatar,
  Checkbox,
  TextField,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import { logout } from '@/app/logout/logout';
import FeatureButton from '@/app/components/FeatureButton';

const DEFAULT_QR_IMAGE = '/no-image-qr.png';

const dummyUsers = [
  // Simulated users for the dashboard preview
  {
    username: 'elder1',
    age: 65,
    countryCode: '+91',
    phone: '9876543210',
    email: 'elder1@mail.com',
    medicalCondition: 'Diabetes',
    qrCode: '/elder1-qr.png',
    type: 'elder',
  },
  {
    username: 'elder2',
    age: 67,
    countryCode: '+91',
    phone: '9090909090',
    email: 'elder2@mail.com',
    medicalCondition: 'Hypertension',
    qrCode: '',
    type: 'elder',
  },
  {
    username: 'youth1',
    age: 32,
    countryCode: '+91',
    phone: '9123456789',
    email: 'young1@mail.com',
    type: 'youth',
  },
  {
    username: 'youth2',
    age: 22,
    countryCode: '+91',
    phone: '9000000000',
    email: 'young2@mail.com',
    type: 'youth',
  },
  {
    username: 'elder3',
    age: 70,
    countryCode: '+91',
    phone: '9999999999',
    email: 'elder3@mail.com',
    medicalCondition: 'Heart',
    qrCode: '/elder3-qr.png',
    type: 'elder',
  },
  {
    username: 'youth3',
    age: 28,
    countryCode: '+91',
    phone: '9333333333',
    email: 'young3@mail.com',
    type: 'youth',
  },
];

function getRole(user) {
  if (!user || !user.username) return null;
  // Find yourself in dummyUsers
  const current = dummyUsers.find(
    u => u.username === user.username
  );
  if (!current) return null;
  return current.age >= 55 ? 'elder' : 'youth';
}

function getOtherUsers(user) {
  if (!user || !user.username) return [];
  const current = dummyUsers.find(u => u.username === user.username);
  if (!current) return [];
  if (current.age >= 55) {
    // Elder: show all youth (<55)
    return dummyUsers
      .filter(u => u.username !== user.username && u.age < 55)
      .sort((a, b) => a.username.localeCompare(b.username));
  } else {
    // Youth: show all elders (>=55)
    return dummyUsers
      .filter(u => u.age >= 55)
      .sort((a, b) => {
        // Medical condition sorting, then age desc, then username
        const medA = u.medicalCondition ? 0 : 1;
        const medB = b.medicalCondition ? 0 : 1;
        if (medA !== medB) return medA - medB;
        if (b.age !== a.age) return b.age - a.age;
        return a.username.localeCompare(b.username);
      });
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState({});
  const [messages, setMessages] = useState({});
  const [amounts, setAmounts] = useState({});
  const isDesktop = useMediaQuery('(min-width:960px)');
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // --- DO NOT MODIFY THIS STRIP ---
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
  // --- DO NOT MODIFY THIS STRIP ---

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { label: 'Scan', icon: <QrCodeScannerIcon />, href: '/scan' },
    { label: 'Send', icon: <PhoneAndroidIcon />, href: '/send-mobile' },
    { label: 'Home', icon: <AccountBalanceWalletIcon />, href: '/dashboard' },
    { label: 'Balance', icon: <HistoryIcon />, href: '/balance' },
    { label: 'Help', icon: <HelpOutlineIcon />, href: '/support' },
  ];

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

  // --- Community/organization predefined account ---
  const orgAccount = {
    username: 'elderwelfare_community',
    email: 'org@elderwelfare.org',
    phone: '1000000000',
    countryCode: '+91',
    age: 99,
    type: 'org',
  };

  // --- Helpers for tickboxes ---
  const handleRequestChange = (target, option) => (e) => {
    setRequests(r => ({
      ...r,
      [target]: {
        ...r[target],
        [option]: e.target.checked,
      },
    }));
  };
  const handleMsgChange = (target) => (e) => {
    setMessages(m => ({
      ...m,
      [target]: e.target.value,
    }));
  };
  const handleAmountChange = (target) => (e) => {
    setAmounts(a => ({
      ...a,
      [target]: e.target.value,
    }));
  };

  // --- Role logic ---
  const role = getRole(user);
  const otherUsers = getOtherUsers(user);

  // --- UI ---

  // Sidebar width (desktop)
  const sidebarWidth = sidebarOpen ? 240 : 56;

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
          pb: { xs: 7, md: 4 },
        }}
      >
        {/* Welcome and Info */}
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
            <b>Human-first. ElderWelfare Community.</b> | <b>100% Secure, Respectful &amp; Fast</b>
          </Typography>
        </Paper>
        {/* Community box for elders */}
        {role === 'elder' && (
          <Paper
            elevation={4}
            sx={{
              width: '100%',
              maxWidth: 480,
              p: 2,
              mb: 3,
              bgcolor: '#fffbe7',
              border: '2px solid #ffb300',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <GroupIcon sx={{ fontSize: 38, color: '#ffb300' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#b57b00' }}>
                ElderWelfare Community
              </Typography>
              <Typography variant="body2" sx={{ color: '#b57b00' }}>
                Need urgent help? If no youth has responded, pull help from the organization and community.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              sx={{ bgcolor: '#ffb300', color: '#fff', fontWeight: 600 }}
              onClick={() => alert('Request sent to ElderWelfare Community!')}
            >
              Pull Help
            </Button>
          </Paper>
        )}

        {/* User Grid */}
        <Grid container spacing={2} sx={{ width: '100%', maxWidth: 480, mb: 2 }}>
          {otherUsers.map((other) => (
            <Grid item xs={12} key={other.username}>
              <Paper
                elevation={3}
                sx={{
                  position: 'relative',
                  p: 2,
                  mb: 1,
                  minHeight: 130,
                  borderRadius: 3,
                  bgcolor: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Username on top left */}
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1976d2', mb: 0.5 }}>
                  {other.username}
                </Typography>
                {/* Elder view: youth info, tickboxes for help */}
                {role === 'elder' && (
                  <>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {other.email} | {other.countryCode} {other.phone}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Checkbox
                        icon={<MedicalServicesIcon />}
                        checkedIcon={<MedicalServicesIcon color="primary" />}
                        checked={!!(requests[other.username]?.medical)}
                        onChange={handleRequestChange(other.username, 'medical')}
                      />
                      <Typography variant="body2" sx={{ color: '#1976d2' }}>Medical Help</Typography>
                      <Checkbox
                        icon={<LocalPharmacyIcon />}
                        checkedIcon={<LocalPharmacyIcon color="primary" />}
                        checked={!!(requests[other.username]?.medicines)}
                        onChange={handleRequestChange(other.username, 'medicines')}
                      />
                      <Typography variant="body2" sx={{ color: '#1976d2' }}>Medicines</Typography>
                      <Checkbox
                        icon={<AttachMoneyIcon />}
                        checkedIcon={<AttachMoneyIcon color="primary" />}
                        checked={!!(requests[other.username]?.money)}
                        onChange={handleRequestChange(other.username, 'money')}
                      />
                      <Typography variant="body2" sx={{ color: '#1976d2' }}>Money</Typography>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Other help (message)"
                        value={messages[other.username] || ''}
                        onChange={handleMsgChange(other.username)}
                        InputProps={{ endAdornment: <MessageIcon color="primary" /> }}
                      />
                      <Button
                        variant="contained"
                        sx={{ minWidth: 80, fontWeight: 600, bgcolor: '#1976d2', ml: 1 }}
                        onClick={() => alert('Request sent!')}
                      >
                        Send
                      </Button>
                    </Box>
                  </>
                )}
                {/* Youth view: see elders, tickboxes for giving help, QR code/amount */}
                {role === 'youth' && (
                  <>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      Age: {other.age} {other.medicalCondition ? `| ${other.medicalCondition}` : ''}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Checkbox
                        icon={<MedicalServicesIcon />}
                        checkedIcon={<MedicalServicesIcon color="primary" />}
                        checked={!!(requests[other.username]?.medical)}
                        onChange={handleRequestChange(other.username, 'medical')}
                      />
                      <Typography variant="body2" sx={{ color: '#1976d2' }}>Give Medical Help</Typography>
                      <Checkbox
                        icon={<LocalPharmacyIcon />}
                        checkedIcon={<LocalPharmacyIcon color="primary" />}
                        checked={!!(requests[other.username]?.medicines)}
                        onChange={handleRequestChange(other.username, 'medicines')}
                      />
                      <Typography variant="body2" sx={{ color: '#1976d2' }}>Give Medicines</Typography>
                      <Checkbox
                        icon={<AttachMoneyIcon />}
                        checkedIcon={<AttachMoneyIcon color="primary" />}
                        checked={!!(requests[other.username]?.money)}
                        onChange={handleRequestChange(other.username, 'money')}
                      />
                      <Typography variant="body2" sx={{ color: '#1976d2' }}>Donate Money</Typography>
                    </Box>
                    {/* QR code & amount section */}
                    <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        src={other.qrCode || DEFAULT_QR_IMAGE}
                        alt="QR Code"
                        sx={{ width: 56, height: 56, border: '1px solid #ccc', bgcolor: '#fafafa' }}
                      />
                      <TextField
                        type="number"
                        size="small"
                        label="Amount (₹)"
                        value={amounts[other.username] || ''}
                        onChange={handleAmountChange(other.username)}
                        sx={{ width: 120 }}
                      />
                      <Button
                        variant="contained"
                        sx={{ fontWeight: 600, bgcolor: '#1976d2', ml: 1 }}
                        onClick={() => alert('Donation request sent!')}
                      >
                        Confirm
                      </Button>
                    </Box>
                    {/* Option to select "No QR" */}
                    {(!other.qrCode || other.qrCode === DEFAULT_QR_IMAGE) && (
                      <Typography variant="body2" sx={{ color: '#b0b0b0', mt: 1 }}>
                        No QR Code Provided
                      </Typography>
                    )}
                    {/* Message/help section */}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Other help (message)"
                        value={messages[other.username] || ''}
                        onChange={handleMsgChange(other.username)}
                        InputProps={{ endAdornment: <MessageIcon color="primary" /> }}
                      />
                      <Button
                        variant="contained"
                        sx={{ minWidth: 80, fontWeight: 600, bgcolor: '#1976d2', ml: 1 }}
                        onClick={() => alert('Offer sent!')}
                      >
                        Send
                      </Button>
                    </Box>
                  </>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Bottom Navigation for Mobile */}
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