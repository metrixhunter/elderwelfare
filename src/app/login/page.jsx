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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Link as MuiLink
} from '@mui/material';

// Pre-defined ITU country codes (add/remove as needed)
const countryCodes = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'USA (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+81', label: 'Japan (+81)' },
  { code: '+61', label: 'Australia (+61)' },
  { code: '+49', label: 'Germany (+49)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+86', label: 'China (+86)' },
];

// Helper: Find a user in localStorage by username and password (for demo/offline)
function findUserByUsernamePassword({ username, password }) {
  // Look through all localStorage keys that start with "user:"
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('user:')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const user = JSON.parse(raw);
          if (user.username === username && user.password === password) {
            return user;
          }
        }
      }
    }
  } catch {}
  return null;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [phone, setPhone] = useState('');
  const [emails, setEmails] = useState(['']);
  const [names, setNames] = useState(['']);
  const [birthdates, setBirthdates] = useState(['']);
  const [ages, setAges] = useState(['']);
  const [address, setAddress] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();

  // Dynamic fields helpers
  const handleArrayChange = (setter, arr, idx, value) => {
    const newArr = [...arr];
    newArr[idx] = value;
    setter(newArr);
  };
  const handleAddField = (setter, arr) => {
    setter([...arr, '']);
  };
  const handleRemoveField = (setter, arr, idx) => {
    if (arr.length > 1) {
      const newArr = arr.slice();
      newArr.splice(idx, 1);
      setter(newArr);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length) {
      const files = Array.from(e.target.files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

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

    // 1. Backend authentication (using username, password)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Login success
        localStorage.setItem('loggedIn', 'true');
        sessionStorage.setItem('username', data.username);
        router.push('/otp');
        return;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      // 2. Fallback to localStorage
      const user = findUserByUsernamePassword({ username, password });
      if (user) {
        sessionStorage.setItem('username', user.username);
        localStorage.setItem('loggedIn', 'true');
        router.push('/otp');
        return;
      }
      setMessage('Login failed. Please check your credentials.');
      setOpenSnackbar(true);
    }
  };

  return (
    <Container
      maxWidth="sm"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
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

        {/* Multiple Names (display only, optional) */}
        {names.map((name, idx) => (
          <Box key={idx} display="flex" gap={1} alignItems="center" mt={1}>
            <TextField
              label={`Name ${names.length > 1 ? idx + 1 : ''}`}
              fullWidth
              margin="normal"
              value={name}
              onChange={e => handleArrayChange(setNames, names, idx, e.target.value)}
            />
            {names.length > 1 && (
              <Button color="error" onClick={() => handleRemoveField(setNames, names, idx)}>-</Button>
            )}
            {idx === names.length - 1 && (
              <Button onClick={() => handleAddField(setNames, names)}>+</Button>
            )}
          </Box>
        ))}

        {/* Multiple Phone Numbers */}
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" gap={1} alignItems="center" mt={1}>
            <FormControl sx={{ minWidth: 100 }}>
              <InputLabel id="country-code-label">Code</InputLabel>
              <Select
                labelId="country-code-label"
                id="country-code"
                value={countryCode}
                label="Code"
                onChange={e => setCountryCode(e.target.value)}
                size="small"
              >
                {countryCodes.map((option) => (
                  <MenuItem value={option.code} key={option.code}>{option.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Phone Number"
              fullWidth
              margin="normal"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/, ''))}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        {/* Multiple Emails */}
        {emails.map((email, idx) => (
          <Box key={idx} display="flex" gap={1} alignItems="center" mt={1}>
            <TextField
              label={`Email ${emails.length > 1 ? idx + 1 : ''}`}
              fullWidth
              margin="normal"
              value={email}
              onChange={e => handleArrayChange(setEmails, emails, idx, e.target.value)}
            />
            {emails.length > 1 && (
              <Button color="error" onClick={() => handleRemoveField(setEmails, emails, idx)}>-</Button>
            )}
            {idx === emails.length - 1 && (
              <Button onClick={() => handleAddField(setEmails, emails)}>+</Button>
            )}
          </Box>
        ))}

        {/* Multiple Birthdates */}
        {birthdates.map((birthdate, idx) => (
          <Box key={idx} display="flex" gap={1} alignItems="center" mt={1}>
            <TextField
              label={`Birthdate ${birthdates.length > 1 ? idx + 1 : ''}`}
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              value={birthdate}
              onChange={e => handleArrayChange(setBirthdates, birthdates, idx, e.target.value)}
            />
            {birthdates.length > 1 && (
              <Button color="error" onClick={() => handleRemoveField(setBirthdates, birthdates, idx)}>-</Button>
            )}
            {idx === birthdates.length - 1 && (
              <Button onClick={() => handleAddField(setBirthdates, birthdates)}>+</Button>
            )}
          </Box>
        ))}

        {/* Multiple Ages */}
        {ages.map((age, idx) => (
          <Box key={idx} display="flex" gap={1} alignItems="center" mt={1}>
            <TextField
              label={`Age ${ages.length > 1 ? idx + 1 : ''}`}
              type="number"
              fullWidth
              margin="normal"
              value={age}
              onChange={e => handleArrayChange(setAges, ages, idx, e.target.value)}
            />
            {ages.length > 1 && (
              <Button color="error" onClick={() => handleRemoveField(setAges, ages, idx)}>-</Button>
            )}
            {idx === ages.length - 1 && (
              <Button onClick={() => handleAddField(setAges, ages)}>+</Button>
            )}
          </Box>
        ))}

        {/* Address */}
        <TextField
          label="Address"
          fullWidth
          margin="normal"
          multiline
          minRows={2}
          value={address}
          onChange={e => setAddress(e.target.value)}
        />

        {/* Image Upload (one or more, e.g., qrcode or profile images) */}
        <Box mt={2} mb={2} display="flex" flexDirection="column" alignItems="center">
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            multiple
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button variant="outlined" component="span">
              Upload Image(s) (QR code, profile, etc.)
            </Button>
          </label>
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            {imagePreviews.map((src, i) => (
              <img key={i} src={src} alt="preview" width={56} height={56} style={{ borderRadius: 8 }} />
            ))}
          </Box>
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