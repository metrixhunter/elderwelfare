'use client';
import { HeaderFooterWrapper } from '../layout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Avatar,
  IconButton
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { encrypt } from '@/app/utils/encryption';

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

async function saveToPublicFolder(filename, value) {
  try {
    let key = `public_user_data_${filename}`;
    let existing = localStorage.getItem(key) || '';
    localStorage.setItem(key, existing + value + '\n');
  } catch {}
}

function saveToRedisLike(phone, userObj) {
  try {
    localStorage.setItem(`user:${phone}`, JSON.stringify(userObj));
  } catch {}
}

async function tryRedisSignup(userData, setSuccess, setErrorMsg, setOpenSnackbar, redirectToOtp) {
  try {
    const res = await fetch('/api/auth/redis-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Redis signup failed');

    sessionStorage.setItem('username', userData.username);
    sessionStorage.setItem('phone', userData.members[0].phoneNumbers[0] || '');
    sessionStorage.setItem('countryCode', userData.members[0].countryCode || '');

    localStorage.setItem('otp_temp_phone', userData.members[0].phoneNumbers[0] || '');
    localStorage.setItem('otp_temp_countryCode', userData.members[0].countryCode || '');

    setSuccess(true);
    setErrorMsg('Signed up using Redis fallback! Please enter the OTP sent to your phone.');
    setOpenSnackbar(true);
    setTimeout(redirectToOtp, 900);
    return true;
  } catch {
    return false;
  }
}

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [names, setNames] = useState(['']);
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [emails, setEmails] = useState(['']);
  const [birthdates, setBirthdates] = useState(['']);
  const [ages, setAges] = useState(['']);
  const [address, setAddress] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();

  const handleArrayChange = (setter, arr, idx, value) => {
    const newArr = [...arr];
    newArr[idx] = value;
    setter(newArr);
  };
  const handleAddField = (setter, arr) => setter([...arr, '']);
  const handleRemoveField = (setter, arr, idx) => {
    if (arr.length > 1) {
      const newArr = arr.slice();
      newArr.splice(idx, 1);
      setter(newArr);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files?.length) {
      const files = Array.from(e.target.files);
      setImages(files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const redirectToOtp = () => router.push(`/otp?redirect=/accountfound`);

  const setErr = (msg) => {
    setErrorMsg(msg);
    setOpenSnackbar(true);
  };

  const handleSignup = async () => {
    if (!username.trim()) return setErr('Please enter a username.');
    if (!password) return setErr('Please enter a password.');

    const today = new Date();
    for (let i = 0; i < names.length; i++) {
      if (!names[i].trim()) return setErr(`Name missing at position ${i + 1}`);
      const bd = birthdates[i];
      const age = parseInt(ages[i]);
      if (bd) {
        const birthYear = new Date(bd).getFullYear();
        const expectedAge = today.getFullYear() - birthYear;
        if (age !== expectedAge && !isNaN(age)) return setErr(`Age mismatch at member ${i + 1}. Should be ${expectedAge}`);
      }
      if (!bd && age && (isNaN(age) || age < 0)) return setErr(`Invalid age at member ${i + 1}`);
      if (!emails[i]?.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) return setErr(`Invalid email at member ${i + 1}`);
      if (!phoneNumbers[i]?.match(/^\d{10}$/)) return setErr(`Invalid phone number at member ${i + 1}`);
    }

    if (!address.trim()) return setErr('Please enter your address.');

    const members = names.map((name, idx) => ({
      name,
      phoneNumbers: phoneNumbers[idx] ? [phoneNumbers[idx]] : [phoneNumbers[0]],
      emails: emails[idx] ? [emails[idx]] : [emails[0]],
      birthdate: birthdates[idx] || null,
      age: ages[idx] ? Number(ages[idx]) : null,
      images: images[idx] ? [imagePreviews[idx]] : [],
      countryCode
    }));

    const userData = {
      username,
      password,
      address,
      members,
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    const saveToLocalBackup = async () => {
      const phone = members[0].phoneNumbers[0] || '';
      const encrypted = encrypt(userData);
      localStorage.setItem('chamcha.json', JSON.stringify(userData));
      localStorage.setItem('maja.txt', encrypted);
      localStorage.setItem('jhola.txt', encrypted);
      localStorage.setItem('bhola.txt', encrypt({ ...userData, timestamp: userData.timestamp }));
      await saveToPublicFolder('chamcha.json', JSON.stringify(userData));
      await saveToPublicFolder('maja.txt', encrypted);
      await saveToPublicFolder('jhola.txt', encrypted);
      await saveToPublicFolder('bhola.txt', encrypt({ ...userData, timestamp: userData.timestamp }));
      saveToRedisLike(phone, userData);
    };

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.message?.toLowerCase().includes('mongo')) {
          const redisSuccess = await tryRedisSignup(userData, setSuccess, setErrorMsg, setOpenSnackbar, redirectToOtp);
          if (redisSuccess) return;
        }
        return setErr(result.message || 'Signup failed');
      }

      // ✅ MongoDB success: also save to local backup
      await saveToLocalBackup();

      sessionStorage.setItem('username', username);
      sessionStorage.setItem('phone', members[0].phoneNumbers[0] || '');
      localStorage.setItem('otp_temp_phone', members[0].phoneNumbers[0] || '');
      setSuccess(true);
      setOpenSnackbar(true);
      setTimeout(redirectToOtp, 1000);

    } catch {
      try {
        await saveToLocalBackup();
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('phone', members[0].phoneNumbers[0] || '');
        localStorage.setItem('otp_temp_phone', members[0].phoneNumbers[0] || '');
        setSuccess(true);
        setErrorMsg('Server unreachable. Data saved locally and in Redis simulation.');
        setOpenSnackbar(true);
        setTimeout(redirectToOtp, 1200);
      } catch {
        setErr('Failed to save data locally.');
      }
    }
  };

  return (
    <HeaderFooterWrapper>
      <Container maxWidth="md">
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert severity={success ? 'success' : 'error'} onClose={() => setOpenSnackbar(false)}>
            {errorMsg}
          </Alert>
        </Snackbar>

        <Paper elevation={3} sx={{ padding: 3 }}>
          <Typography variant="h5" gutterBottom>Sign Up</Typography>

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
          />

          {names.map((name, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
              <TextField
                label={`Name ${idx + 1}`}
                value={name}
                onChange={(e) => handleArrayChange(setNames, names, idx, e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button onClick={() => handleRemoveField(setNames, names, idx)}>-</Button>
            </Box>
          ))}
          <Button onClick={() => handleAddField(setNames, names)}>Add Name</Button>

          {phoneNumbers.map((phone, idx) => (
            <TextField
              key={idx}
              label={`Phone Number ${idx + 1}`}
              value={phone}
              onChange={(e) => handleArrayChange(setPhoneNumbers, phoneNumbers, idx, e.target.value)}
              fullWidth
              margin="normal"
            />
          ))}
          <Button onClick={() => handleAddField(setPhoneNumbers, phoneNumbers)}>Add Phone</Button>

          <FormControl fullWidth margin="normal">
            <InputLabel>Country Code</InputLabel>
            <Select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              label="Country Code"
            >
              {countryCodes.map((option) => (
                <MenuItem key={option.code} value={option.code}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleSignup}>Sign Up</Button>
        </Paper>
      </Container>
    </HeaderFooterWrapper>
  );
}


