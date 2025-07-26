'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Box,
  Avatar,
  Checkbox,
  TextField,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Chip,
  Tooltip,
  Fade,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HistoryIcon from '@mui/icons-material/History';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MessageIcon from '@mui/icons-material/Message';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Diversity2Icon from '@mui/icons-material/Diversity2';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { logout } from '@/app/logout/logout';

const DEFAULT_QR_IMAGE = '/no-image-qr.png';

const dummyUsers = [
  {
    username: 'elder1',
    age: 65,
    countryCode: '+91',
    phone: '9876543210',
    email: 'elder1@mail.com',
    medicalCondition: 'Diabetes',
    qrCode: '/elder1-qr.png',
    type: 'elder',
    gender: 'male',
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
    gender: 'female',
  },
  {
    username: 'youth1',
    age: 32,
    countryCode: '+91',
    phone: '9123456789',
    email: 'young1@mail.com',
    type: 'youth',
    gender: 'male',
  },
  {
    username: 'youth2',
    age: 22,
    countryCode: '+91',
    phone: '9000000000',
    email: 'young2@mail.com',
    type: 'youth',
    gender: 'female',
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
    gender: 'other',
  },
  {
    username: 'youth3',
    age: 28,
    countryCode: '+91',
    phone: '9333333333',
    email: 'young3@mail.com',
    type: 'youth',
    gender: 'other',
  },
];

function getRole(user, age) {
  if (!user || !user.username) return null;
  // Age is checked from sessionStorage if available
  if (typeof age === 'number') return age >= 55 ? 'elder' : 'youth';
  // Fallback: find in dummyUsers
  const current = dummyUsers.find(u => u.username === user.username);
  if (!current) return null;
  return current.age >= 55 ? 'elder' : 'youth';
}

function getOtherUsers(user, age) {
  if (!user || !user.username) return [];
  let current = dummyUsers.find(u => u.username === user.username);
  // If session age is available use that
  if (typeof age === 'number') current = { ...current, age };
  if (!current) return [];
  if (current.age >= 55) {
    // Elders see all youth (<55)
    return dummyUsers
      .filter(u => u.username !== user.username && u.age < 55)
      .sort((a, b) => a.username.localeCompare(b.username));
  } else {
    // Youth see all elders (>=55)
    return dummyUsers
      .filter(u => u.age >= 55)
      .sort((a, b) => {
        const medA = u.medicalCondition ? 0 : 1;
        const medB = b.medicalCondition ? 0 : 1;
        if (medA !== medB) return medA - medB;
        if (b.age !== a.age) return b.age - a.age;
        return a.username.localeCompare(b.username);
      });
  }
}

function getGenderIcon(gender) {
  if (gender === 'female') return <FavoriteIcon sx={{ color: '#f06292', fontSize: 20, ml: 0.5 }} />;
  if (gender === 'male') return <VolunteerActivismIcon sx={{ color: '#42a5f5', fontSize: 20, ml: 0.5 }} />;
  return <Diversity3Icon sx={{ color: '#7c4dff', fontSize: 20, ml: 0.5 }} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userAge, setUserAge] = useState(undefined);
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
    let age = sessionStorage.getItem('age');
    if (!username || !phone || !countryCode) {
      if (typeof window !== 'undefined') {
        const item = localStorage.getItem('chamcha.json');
        try {
          const local = item ? JSON.parse(item) : {};
          username = username || local.username;
          phone = phone || local.phone;
          countryCode = countryCode || local.countryCode;
          age = age || local.age;
          if (username) sessionStorage.setItem('username', username);
          if (phone) sessionStorage.setItem('phone', phone);
          if (countryCode) sessionStorage.setItem('countryCode', countryCode);
          if (age) sessionStorage.setItem('age', age);
        } catch {}
      }
    }
    if (!username || !phone || !countryCode) {
      router.replace('/dashboard');
      return;
    }
    setUser({ username, phone, countryCode });
    if (age) setUserAge(Number(age));
  }, [router]);
  // --- DO NOT MODIFY THIS STRIP ---

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { label: 'Scan QR', icon: <QrCodeScannerIcon />, href: '/scan' },
    { label: 'Find Helper', icon: <PhoneAndroidIcon />, href: '/send-mobile' },
    { label: 'Home', icon: <AccountBalanceWalletIcon />, href: '/dashboard' },
    { label: 'Notifications', icon: <HistoryIcon />, href: '/balance' },
    { label: 'Help', icon: <HelpOutlineIcon />, href: '/support' },
  ];

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

  // Role and user list
  const role = getRole(user, userAge);
  const otherUsers = getOtherUsers(user, userAge);

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #f8fafc 60%, #e3f1fa 100%)', minHeight: '100vh', pb: { xs: 7, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1400,
          width: '100%',
          bgcolor: 'rgba(25, 118, 210, .95)',
          color: '#fff',
          py: 2,
          px: 3,
          boxShadow: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Diversity2Icon sx={{ fontSize: 32, mr: 1, color: '#ffd600' }} />
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 1, fontFamily: 'inherit' }}>
            ElderWelfare
          </Typography>
          <Chip label={role === 'elder' ? 'Elder View' : role === 'youth' ? 'Youth View' : ''} color={role === 'elder' ? "warning" : "info"} size="small" sx={{ ml: 1, fontWeight: 600 }} />
        </Box>
        <Button
          color="inherit"
          onClick={handleLogout}
          sx={{
            fontWeight: 700,
            px: { xs: 1.5, md: 2.5 },
            fontSize: { xs: '1.05rem', md: '1.1rem' },
            minWidth: 0,
            bgcolor: '#fff',
            color: '#1976d2',
            borderRadius: 2,
            boxShadow: 1,
            ':hover': { bgcolor: '#e3f1fa' },
          }}
        >
          Logout
        </Button>
      </Box>
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          pt: 3,
          pb: { xs: 7, md: 4 },
        }}
      >
        <Fade in>
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 460,
            mb: 3,
            p: 2,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'linear-gradient(100deg, #e3f1fa 70%, #fffde7 100%)',
            boxShadow: 4,
          }}
        >
          <VolunteerActivismIcon sx={{ fontSize: 38, color: '#1976d2' }} />
          <Typography variant="body1" sx={{ flex: 1, color: '#1976d2', fontWeight: 700, letterSpacing: 0.2 }}>
            <span style={{ color: '#ffb300', fontWeight: 900 }}>Empowering Elders</span> &amp; <span style={{ color: '#26a69a', fontWeight: 900 }}>Celebrating Youth Solidarity</span>
          </Typography>
        </Paper>
        </Fade>

        {/* Community box for elders */}
        {role === 'elder' && (
          <Fade in>
          <Paper
            elevation={4}
            sx={{
              width: '100%',
              maxWidth: 480,
              p: 2,
              mb: 3,
              bgcolor: '#fffde7',
              border: '2px solid #ffb300',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: 5,
            }}
          >
            <Diversity3Icon sx={{ fontSize: 38, color: '#ffb300' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 800, color: '#b57b00', letterSpacing: 0.1 }}>
                ElderWelfare Community
              </Typography>
              <Typography variant="body2" sx={{ color: '#b57b00' }}>
                If no youth helps, pull support from our community.
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              sx={{ bgcolor: '#ffb300', color: '#fff', fontWeight: 700, px: 2, py: 1, borderRadius: 2 }}
              onClick={() => alert('Request sent to ElderWelfare Community!')}
            >
              Pull Help
            </Button>
          </Paper>
          </Fade>
        )}

        {/* User Grid */}
        <Grid container spacing={3} sx={{ width: '100%', maxWidth: 520, mb: 2 }}>
          {otherUsers.map((other) => (
            <Grid item xs={12} key={other.username}>
              <Fade in>
              <Paper
                elevation={5}
                sx={{
                  position: 'relative',
                  p: 2.5,
                  mb: 1,
                  minHeight: 140,
                  borderRadius: 5,
                  bgcolor: 'linear-gradient(107deg, #fafcfe 80%, #e3f1fa 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  border: `2px solid ${role === 'elder' ? '#1976d2' : '#26a69a'}`,
                  boxShadow: 7,
                  transition: 'transform .18s',
                  '&:hover': { transform: 'scale(1.02)', boxShadow: 10 },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    src={other.qrCode && other.qrCode !== DEFAULT_QR_IMAGE ? other.qrCode : undefined}
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: (role === 'elder' ? '#e3f1fa' : '#fffde7'),
                      border: `2px solid ${role === 'elder' ? '#1976d2' : '#26a69a'}`,
                      mr: 2,
                      fontWeight: 'bold',
                      fontSize: 22,
                      color: '#1976d2',
                    }}
                  >
                    {other.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1976d2', letterSpacing: 0.2 }}>
                    {other.username}
                  </Typography>
                  {getGenderIcon(other.gender)}
                  {other.type === 'elder' && (
                    <Chip label="Elder" color="warning" size="small" sx={{ ml: 1, fontWeight: 600 }} />
                  )}
                  {other.type === 'youth' && (
                    <Chip label="Youth" color="info" size="small" sx={{ ml: 1, fontWeight: 600 }} />
                  )}
                  {other.medicalCondition &&
                    <Tooltip title={"Medical: " + other.medicalCondition}>
                      <Chip icon={<FavoriteIcon sx={{ color: '#d50000' }} />} label={other.medicalCondition} color="error" size="small" sx={{ ml: 1, fontWeight: 600 }} />
                    </Tooltip>
                  }
                </Box>
                {/* Elder view: youth info, tickboxes for help */}
                {role === 'elder' && (
                  <>
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                        <span style={{ fontWeight: 700 }}>Email:</span> {other.email} &nbsp;|&nbsp;
                        <span style={{ fontWeight: 700 }}>Phone:</span> {other.countryCode} {other.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, mb: 0.5 }}>
                      <Checkbox
                        icon={<MedicalServicesIcon />}
                        checkedIcon={<MedicalServicesIcon color="primary" />}
                        checked={!!(requests[other.username]?.medical)}
                        onChange={handleRequestChange(other.username, 'medical')}
                      />
                      <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>Medical Help</Typography>
                      <Checkbox
                        icon={<LocalPharmacyIcon />}
                        checkedIcon={<LocalPharmacyIcon color="primary" />}
                        checked={!!(requests[other.username]?.medicines)}
                        onChange={handleRequestChange(other.username, 'medicines')}
                      />
                      <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>Medicines</Typography>
                      <Checkbox
                        icon={<AttachMoneyIcon />}
                        checkedIcon={<AttachMoneyIcon color="primary" />}
                        checked={!!(requests[other.username]?.money)}
                        onChange={handleRequestChange(other.username, 'money')}
                      />
                      <Typography variant="body2" sx={{ color: '#1976d2', fontWeight: 600 }}>Money</Typography>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1.5 }}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Other help (type your request)"
                        value={messages[other.username] || ''}
                        onChange={handleMsgChange(other.username)}
                        InputProps={{ endAdornment: <MessageIcon color="primary" /> }}
                        sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
                      />
                      <Button
                        variant="contained"
                        sx={{ minWidth: 80, fontWeight: 700, bgcolor: '#1976d2', ml: 1, borderRadius: 2, boxShadow: 1 }}
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
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="body2" sx={{ color: '#666', fontWeight: 500 }}>
                        <span style={{ fontWeight: 700 }}>Age:</span> {other.age}
                        {other.medicalCondition && (
                          <> &nbsp;|&nbsp; <span style={{ fontWeight: 700, color: '#d50000' }}>Medical: {other.medicalCondition}</span></>
                        )}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5, mb: 0.5 }}>
                      <Checkbox
                        icon={<MedicalServicesIcon />}
                        checkedIcon={<MedicalServicesIcon color="primary" />}
                        checked={!!(requests[other.username]?.medical)}
                        onChange={handleRequestChange(other.username, 'medical')}
                      />
                      <Typography variant="body2" sx={{ color: '#26a69a', fontWeight: 600 }}>Give Medical Help</Typography>
                      <Checkbox
                        icon={<LocalPharmacyIcon />}
                        checkedIcon={<LocalPharmacyIcon color="primary" />}
                        checked={!!(requests[other.username]?.medicines)}
                        onChange={handleRequestChange(other.username, 'medicines')}
                      />
                      <Typography variant="body2" sx={{ color: '#26a69a', fontWeight: 600 }}>Give Medicines</Typography>
                      <Checkbox
                        icon={<AttachMoneyIcon />}
                        checkedIcon={<AttachMoneyIcon color="primary" />}
                        checked={!!(requests[other.username]?.money)}
                        onChange={handleRequestChange(other.username, 'money')}
                      />
                      <Typography variant="body2" sx={{ color: '#26a69a', fontWeight: 600 }}>Donate Money</Typography>
                    </Box>
                    <Box sx={{ mt: 1, display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        src={other.qrCode || DEFAULT_QR_IMAGE}
                        alt="QR Code"
                        sx={{
                          width: 56,
                          height: 56,
                          border: '2px solid #1976d2',
                          bgcolor: '#fafafa',
                          fontWeight: 700,
                          fontSize: 22,
                          color: '#1976d2',
                        }}
                      >
                        {!other.qrCode && 'No Img'}
                      </Avatar>
                      <TextField
                        type="number"
                        size="small"
                        label="Amount (₹)"
                        value={amounts[other.username] || ''}
                        onChange={handleAmountChange(other.username)}
                        sx={{ width: 120, bgcolor: '#f8fafc', borderRadius: 2 }}
                      />
                      <Button
                        variant="contained"
                        sx={{ fontWeight: 700, bgcolor: '#26a69a', ml: 1, borderRadius: 2, boxShadow: 1 }}
                        onClick={() => alert('Donation request sent!')}
                      >
                        Confirm
                      </Button>
                    </Box>
                    {(!other.qrCode || other.qrCode === DEFAULT_QR_IMAGE) && (
                      <Typography variant="body2" sx={{ color: '#b0b0b0', mt: 1 }}>
                        No QR Code Provided
                      </Typography>
                    )}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1.5 }}>
                      <TextField
                        size="small"
                        fullWidth
                        label="Other help (type your offer)"
                        value={messages[other.username] || ''}
                        onChange={handleMsgChange(other.username)}
                        InputProps={{ endAdornment: <MessageIcon color="primary" /> }}
                        sx={{ bgcolor: '#f8fafc', borderRadius: 2 }}
                      />
                      <Button
                        variant="contained"
                        sx={{ minWidth: 80, fontWeight: 700, bgcolor: '#26a69a', ml: 1, borderRadius: 2, boxShadow: 1 }}
                        onClick={() => alert('Offer sent!')}
                      >
                        Send
                      </Button>
                    </Box>
                  </>
                )}
              </Paper>
              </Fade>
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
            sx={{ height: 64, fontWeight: 700, boxShadow: 2, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
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