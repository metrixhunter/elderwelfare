'use client';

import { useState, useEffect } from 'react';
import { Box, Fab, Popover, Typography, Modal, Button, TextField, Tabs, Tab, Paper, Snackbar, Alert, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';

const PASSWORD = 'finlock123';

// Helper to decode base64 lines
function decodeBase64Line(line) {
  try {
    return JSON.parse(Buffer.from(line, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

// Helper for reading backup files from /public/user_data
async function readPublicFile(file) {
  try {
    const res = await fetch(`/user_data/${file}`);
    if (!res.ok) return null;
    const text = await res.text();
    return text;
  } catch {
    return null;
  }
}

function LocalUserView() {
  const [local, setLocal] = useState(null);
  const [publicData, setPublicData] = useState({ chamcha: [], maja: [], jhola: [], bhola: [] });
  const [loading, setLoading] = useState(true);

  // Password protection for local view
  const [password, setPassword] = useState('');
  const [access, setAccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  useEffect(() => {
    // Load localStorage "chamcha.json"
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem('chamcha.json');
      try {
        setLocal(item ? JSON.parse(item) : {});
      } catch {
        setLocal({});
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchPublicBackups() {
      setLoading(true);
      // chamcha.json (plain), maja/jhola/bhola.txt (base64-encoded)
      const [chamcha, maja, jhola, bhola] = await Promise.all([
        readPublicFile('chamcha.json'),
        readPublicFile('maja.txt'),
        readPublicFile('jhola.txt'),
        readPublicFile('bhola.txt'),
      ]);

      // chamcha.json: each line is a JSON object
      let chamchaArr = [];
      if (chamcha) {
        chamchaArr = chamcha
          .split('\n')
          .filter(Boolean)
          .map(line => {
            try { return JSON.parse(line); } catch { return null; }
          })
          .filter(Boolean);
      }

      // maja/jhola/bhola: each line is base64-encoded JSON
      function decodeLines(txt) {
        if (!txt) return [];
        return txt
          .split('\n')
          .filter(Boolean)
          .map(decodeBase64Line)
          .filter(Boolean);
      }

      if (mounted) {
        setPublicData({
          chamcha: chamchaArr,
          maja: decodeLines(maja),
          jhola: decodeLines(jhola),
          bhola: decodeLines(bhola),
        });
        setLoading(false);
      }
    }
    if (access) {
      fetchPublicBackups();
    }
    return () => { mounted = false; };
  }, [access]);

  const handleAccess = () => {
    if (password === PASSWORD) {
      setAccess(true);
      setSnackbar({ open: false, message: '', severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Incorrect password.', severity: 'error' });
    }
  };

  if (!access) {
    return (
      <>
        <Typography>Enter password:</Typography>
        <TextField
          fullWidth
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{ mb: 1 }}
          autoComplete="off"
        />
        <Button variant="contained" sx={{ mt: 1 }} onClick={handleAccess}>Submit</Button>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>Local User Backup</Typography>
      <Typography variant="subtitle2" sx={{ mt: 1 }}>LocalStorage chamcha.json</Typography>
      <pre style={{ maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 10 }}>
        {JSON.stringify(local, null, 2)}
      </pre>
      <Typography variant="subtitle2" sx={{ mt: 2 }}>Public Folder Backups</Typography>
      {loading ? (
        <Typography color="text.secondary">Loading...</Typography>
      ) : (
        <>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>chamcha.json (plain)</Typography>
          <pre style={{ maxHeight: 120, overflow: 'auto', background: '#f9f9f9', padding: 8 }}>
            {publicData.chamcha.length
              ? JSON.stringify(publicData.chamcha, null, 2)
              : 'No data.'}
          </pre>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>maja.txt (encrypted)</Typography>
          <pre style={{ maxHeight: 120, overflow: 'auto', background: '#f9f9f9', padding: 8 }}>
            {publicData.maja.length
              ? JSON.stringify(publicData.maja, null, 2)
              : 'No data.'}
          </pre>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>jhola.txt (encrypted)</Typography>
          <pre style={{ maxHeight: 120, overflow: 'auto', background: '#f9f9f9', padding: 8 }}>
            {publicData.jhola.length
              ? JSON.stringify(publicData.jhola, null, 2)
              : 'No data.'}
          </pre>
          <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>bhola.txt (encrypted)</Typography>
          <pre style={{ maxHeight: 120, overflow: 'auto', background: '#f9f9f9', padding: 8 }}>
            {publicData.bhola.length
              ? JSON.stringify(publicData.bhola, null, 2)
              : 'No data.'}
          </pre>
        </>
      )}
    </>
  );
}

function ServerUserView() {
  const [password, setPassword] = useState('');
  const [access, setAccess] = useState(false);
  const [data, setData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const handleAccess = async () => {
    if (password === PASSWORD) {
      try {
        const res = await fetch('/api/secret/userdump');
        if (!res.ok) throw new Error('Server error');
        const users = await res.json();
        setData(users);
        setAccess(true);
        setSnackbar({ open: false, message: '', severity: 'success' });
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to fetch user data from server.', severity: 'error' });
      }
    } else {
      setSnackbar({ open: true, message: 'Incorrect password.', severity: 'error' });
    }
  };

  if (!access) {
    return (
      <>
        <Typography>Enter password:</Typography>
        <TextField
          fullWidth
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{ mb: 1 }}
          autoComplete="off"
        />
        <Button variant="contained" sx={{ mt: 1 }} onClick={handleAccess}>Submit</Button>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={2500}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        >
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>Server User Data</Typography>
      <pre style={{ maxHeight: 400, overflow: 'auto', background: '#f5f5f5', padding: 10 }}>
        {data && data.length > 0 ? JSON.stringify(data, null, 2) : 'No users found.'}
      </pre>
    </>
  );
}

export default function FloatingSecretButton() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [tab, setTab] = useState(0);

  const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);

  const handleButtonClick = () => {
    setOpenModal(true);
    setAnchorEl(null);
  };

  const handleModalClose = () => setOpenModal(false);
  const handleTabChange = (_, value) => setTab(value);

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999
        }}
      >
        <Fab
          color="secondary"
          size="small"
          sx={{
            minHeight: 36,
            height: 36,
            width: 36,
            boxShadow: 2,
            opacity: 0.7
          }}
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
          onClick={handleButtonClick}
        >
          <VisibilityIcon fontSize="small" />
        </Fab>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          PaperProps={{
            sx: { pointerEvents: 'none', p: 1, bgcolor: 'background.paper', fontSize: 12, borderRadius: 1 }
          }}
          disableRestoreFocus
        >
          <Typography variant="caption" color="text.secondary">
            Secret User View
          </Typography>
        </Popover>
      </Box>
      <Modal open={openModal} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'fixed',
            top: 0, left: 0, width: '100vw', height: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: 'rgba(0,0,0,0.25)'
          }}
        >
          <Paper sx={{ borderRadius: 2, p: 2, minWidth: 350, maxWidth: 500, position: 'relative' }}>
            <IconButton
              aria-label="close"
              onClick={handleModalClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
                zIndex: 1,
              }}
              size="large"
            >
              <CloseIcon />
            </IconButton>
            <Tabs value={tab} onChange={handleTabChange} centered sx={{ mb: 2 }}>
              <Tab label="Server" />
              <Tab label="Local" />
            </Tabs>
            {tab === 0 ? <ServerUserView /> : <LocalUserView />}
          </Paper>
        </Box>
      </Modal>
    </>
  );
}