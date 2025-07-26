'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ReportIcon from '@mui/icons-material/Report';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import InfoIcon from '@mui/icons-material/Info';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const dummyNotifications = [
  {
    id: 1,
    type: 'urgent',
    for: 'elder1',
    message: 'You have not received help from any youth for 1 month. Request escalated to the ElderWelfare Community.',
    icon: <ReportIcon color="error" />,
    time: '2h ago',
  },
  {
    id: 2,
    type: 'money',
    for: 'elder1',
    message: '₹1000 has been sent to your account by youth1.',
    icon: <AttachMoneyIcon color="success" />,
    time: '1d ago',
  },
  {
    id: 3,
    type: 'medical',
    for: 'elder2',
    message: 'youth2 has confirmed providing medical help.',
    icon: <MedicalServicesIcon color="primary" />,
    time: '3d ago',
  },
  {
    id: 4,
    type: 'org',
    for: 'elder3',
    message: 'Organization has not processed cashback for 2 days. 15% interest applied.',
    icon: <HourglassBottomIcon color="warning" />,
    time: '4d ago',
  },
  {
    id: 5,
    type: 'comment',
    for: 'elder2',
    message: 'youth3 commented: "Get well soon! Let me know if you need anything."',
    icon: <InfoIcon color="info" />,
    time: '5h ago',
  },
  {
    id: 6,
    type: 'confirmation',
    for: 'elder1',
    message: 'youth1 confirmed your payment was received.',
    icon: <CheckCircleIcon color="success" />,
    time: '10m ago',
  },
];

export default function BalancePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Session/user info
    let username = sessionStorage.getItem('username');
    let phone = sessionStorage.getItem('phone');
    let countryCode = sessionStorage.getItem('countryCode');
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
    if (!username) {
      router.replace('/dashboard');
      return;
    }
    setUser({ username, phone, countryCode });

    // Dummy: infer role from username (matches dashboard)
    const dummyElders = ['elder1', 'elder2', 'elder3'];
    setRole(dummyElders.includes(username) ? 'elder' : 'youth');

    // Notifications for this user (dummy)
    setNotifications(
      dummyNotifications.filter(n => n.for === username || n.type === 'org')
    );
  }, [router]);

  return (
    <Container maxWidth="sm" sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      py: 4,
    }}>
      <Paper elevation={3} sx={{
        width: '100%',
        bgcolor: '#fff',
        textAlign: 'center',
        px: 0,
        py: 2,
        borderRadius: 4,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <NotificationsIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Notifications & Requests
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {notifications.length === 0 && (
            <ListItem>
              <ListItemText
                primary={<Typography variant="body2" color="text.secondary">No notifications yet.</Typography>}
              />
            </ListItem>
          )}
          {notifications.map(n => (
            <ListItem key={n.id} alignItems="flex-start" sx={{
              mb: 1.5, bgcolor: n.type === 'urgent' ? '#fff3e0' : '#f8faff', borderRadius: 2,
              borderLeft: n.type === 'urgent' ? '5px solid #ff9800' : undefined,
              boxShadow: n.type === 'urgent' ? 3 : 1,
            }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: '#fff' }}>{n.icon}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2' }}>
                      {n.type === 'urgent' ? 'Urgent' : n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                    </Typography>
                    {n.type === 'urgent' && <Chip label="Escalated" color="warning" size="small" />}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ color: '#333', mb: 0.5 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999' }}>{n.time}</Typography>
                  </Box>
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
            <LocalHospitalIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary" flex={1}>
              All requests and important notifications will appear here, even when you are logged out.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}