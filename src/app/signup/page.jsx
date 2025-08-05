'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TextField, Button, Typography, Container, Paper, Alert, Snackbar, IconButton, Box, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { encrypt } from '@/app/utils/encryption';
// If this client helper doesn't exist in your project, comment out the next line.
import saveUserToFirebase from '@/backend/utils/firebaseSave.client';

const WAIT_TIMEOUT_MS = 15000; // time to wait for API before treating it as "slow" and redirecting

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
    const key = `public_user_data_${filename}`;
    let existing = localStorage.getItem(key) || '';
    localStorage.setItem(key, existing + value + '\n');
  } catch {}
}

function saveToRedisLike(phone, userObj) {
  try {
    localStorage.setItem(`user:${phone}`, JSON.stringify(userObj));
  } catch {}
}

function isUserSaved(phone) {
  return localStorage.getItem(`user:${phone}`) !== null;
}

async function tryRedisSignup(userData, setSuccess, setErrorMsg, setOpenSnackbar, redirectToDashboard) {
  try {
    const res = await fetch('/api/auth/redis-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || 'Redis signup failed');

    sessionStorage.setItem('username', userData.username);
    sessionStorage.setItem('phone', userData.phone?.number || '');
    sessionStorage.setItem('countryCode', userData.phone?.countryCode || '');

    localStorage.setItem('otp_temp_phone', userData.phone?.number || '');
    localStorage.setItem('otp_temp_countryCode', userData.phone?.countryCode || '');

    setSuccess(true);
    setErrorMsg('Signed up using Redis fallback! Please enter the OTP sent to your phone.');
    setOpenSnackbar(true);
    setTimeout(redirectToDashboard, 900);
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

  const redirectToDashboard = () => router.push('/dashboard');
  const setErr = (msg) => {
    setErrorMsg(msg);
    setOpenSnackbar(true);
  };

  const saveToLocalBackup = async (userData) => {
    const phone = userData.phone?.number || '';
    const encrypted = encrypt(userData);

    try { await saveUserToFirebase?.(userData); } catch {}

    try {
      localStorage.setItem('chamcha.json', JSON.stringify(userData));
      localStorage.setItem('maja.txt', encrypted);
      localStorage.setItem('jhola.txt', encrypted);
      localStorage.setItem('bhola.txt', encrypt({ ...userData, timestamp: userData.timestamp }));

      await saveToPublicFolder('chamcha.json', JSON.stringify(userData));
      await saveToPublicFolder('maja.txt', encrypted);
      await saveToPublicFolder('jhola.txt', encrypted);
      await saveToPublicFolder('bhola.txt', encrypt({ ...userData, timestamp: userData.timestamp }));

      saveToRedisLike(phone, userData);

      // attempt server-side local JSON save (your API must exist)
      fetch('/api/save-to-local-json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }).catch(() => {});
    } catch (e) {
      console.warn('Local backup failed', e);
    }
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
      if (!emails[i]?.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) return setErr(`Invalid email at member ${i + 1}`);
      if (!phoneNumbers[i]?.match(/^\d{10}$/)) return setErr(`Invalid phone number at member ${i + 1}`);
    }

    if (!address.trim()) return setErr('Please enter your address.');

    const members = names.map((name, idx) => ({
      name,
      phoneNumbers: [{ countryCode, number: phoneNumbers[idx] || phoneNumbers[0] }],
      emails: emails[idx] ? [emails[idx]] : [emails[0]],
      birthdate: birthdates[idx] || null,
      age: ages[idx] ? Number(ages[idx]) : null,
      images: images[idx] ? [imagePreviews[idx]] : [],
    }));

    const userData = {
      username,
      password,
      address,
      phone: { countryCode, number: phoneNumbers[0] },
      members,
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    const phone = phoneNumbers[0];
    if (isUserSaved(phone)) return setErr('User already registered locally.');

    // store session/local placeholders immediately
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('phone', phone);
    sessionStorage.setItem('countryCode', countryCode);
    localStorage.setItem('otp_temp_phone', phone);
    localStorage.setItem('otp_temp_countryCode', countryCode);

    // Start the API call
    const fetchPromise = fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ timedOut: true }), WAIT_TIMEOUT_MS);
    });

    try {
      const raceResult = await Promise.race([fetchPromise.then(r => r), timeoutPromise]);

      if (raceResult && !raceResult.timedOut) {
        // API responded within WAIT_TIMEOUT_MS
        const res = raceResult;
        if (res.status === 409) {
          const json = await res.json().catch(() => ({}));
          return setErr(json.message || 'User already exists.');
        }

        if (res.ok) {
          // success -> save backups and redirect to dashboard
          await saveToLocalBackup(userData);
          setSuccess(true);
          setOpenSnackbar(true);
          setTimeout(redirectToDashboard, 600);
          return;
        }

        // non-2xx, non-409
        const json = await res.json().catch(() => ({}));
        return setErr(json.message || `Signup failed with status ${res.status}`);
      } else {
        // timed out -> treat as slow backend: run background tasks and redirect immediately
        (async () => {
          try {
            const bgRes = await fetchPromise;
            if (bgRes && bgRes.ok) {
              await saveToLocalBackup(userData);
            } else if (bgRes && bgRes.status === 409) {
              console.warn('Backend eventually returned 409 (user exists).');
            } else {
              // background failed — attempt redis fallback & local backup
              await tryRedisSignup(userData, setSuccess, setErrorMsg, setOpenSnackbar, redirectToDashboard);
              await saveToLocalBackup(userData);
            }
          } catch (e) {
            await tryRedisSignup(userData, setSuccess, setErrorMsg, setOpenSnackbar, redirectToDashboard);
            await saveToLocalBackup(userData);
          }
        })();

        // immediate redirect for slow backend
        redirectToDashboard();
        return;
      }
    } catch (err) {
      // unexpected error — fallback: save locally and redirect
      console.warn('Signup error:', err);
      (async () => {
        try { await saveToLocalBackup(userData); } catch {}
      })();
      redirectToDashboard();
      return;
    }
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>Signup</Typography>
        <TextField fullWidth label="Username" value={username} onChange={(e) => setUsername(e.target.value)} margin="normal" />
        <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" />
        <TextField fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />

        {names.map((name, idx) => (
          <Box key={idx} sx={{ mt: 3, mb: 3, border: '1px solid #ccc', p: 2, borderRadius: 2 }}>
            <Typography variant="h6">Member {idx + 1}</Typography>
            <TextField fullWidth label="Name" value={name} onChange={(e) => handleArrayChange(setNames, names, idx, e.target.value)} margin="normal" />
            <TextField fullWidth label="Phone Number" value={phoneNumbers[idx]} onChange={(e) => handleArrayChange(setPhoneNumbers, phoneNumbers, idx, e.target.value)} margin="normal" />
            <FormControl fullWidth margin="normal">
              <InputLabel>Country Code</InputLabel>
              <Select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} label="Country Code">
                {countryCodes.map(cc => (
                  <MenuItem key={cc.code} value={cc.code}>{cc.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField fullWidth label="Email" value={emails[idx]} onChange={(e) => handleArrayChange(setEmails, emails, idx, e.target.value)} margin="normal" />
            <TextField fullWidth type="date" label="Birthdate" InputLabelProps={{ shrink: true }} value={birthdates[idx]} onChange={(e) => handleArrayChange(setBirthdates, birthdates, idx, e.target.value)} margin="normal" />
            <TextField fullWidth label="Age" type="number" value={ages[idx]} onChange={(e) => handleArrayChange(setAges, ages, idx, e.target.value)} margin="normal" />
            <IconButton color="primary" component="label">
              <PhotoCamera />
              <input hidden accept="image/*" type="file" onChange={handleImageChange} />
            </IconButton>
          </Box>
        ))}

        <Button onClick={() => handleAddField(setNames, names)} sx={{ mr: 2 }}>Add Member</Button>
        <Button onClick={handleSignup} variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>Submit</Button>

        <Snackbar open={openSnackbar} autoHideDuration={5000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity={success ? "success" : "error"}>{errorMsg}</Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}
