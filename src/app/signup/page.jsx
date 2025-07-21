'use client';

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
  IconButton,
  Avatar,
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

// Helper for saving to public/user_data via the browser (append)
async function saveToPublicFolder(filename, value) {
  try {
    let key = `public_user_data_${filename}`;
    let existing = localStorage.getItem(key) || '';
    localStorage.setItem(key, existing + value + '\n');
  } catch (err) {
    // Ignore
  }
}

// Helper: Simulate a Redis user entry in localStorage
function saveToRedisLike(phone, userObj) {
  try {
    localStorage.setItem(`user:${phone}`, JSON.stringify(userObj));
  } catch {}
}

// Helper: Try Redis API if Mongo fails
async function tryRedisSignup(userData, setSuccess, setErrorMsg, setOpenSnackbar, redirectToOtp) {
  try {
    const res = await fetch('/api/auth/redis-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Redis signup failed');
    }

    // Save to sessionStorage for OTP and later flow
    sessionStorage.setItem('username', userData.username);
    sessionStorage.setItem('phone', userData.phoneNumbers[0] || '');
    sessionStorage.setItem('countryCode', userData.countryCode);

    localStorage.setItem('otp_temp_phone', userData.phoneNumbers[0] || '');
    localStorage.setItem('otp_temp_countryCode', userData.countryCode);

    setSuccess(true);
    setErrorMsg('Signed up using Redis fallback! Please enter the OTP sent to your phone.');
    setOpenSnackbar(true);
    setTimeout(redirectToOtp, 900);
    return true;
  } catch (err) {
    return false;
  }
}

export default function SignupPage() {
  // Multiple names, phone numbers, emails, birthdates, ages, images as arrays
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [names, setNames] = useState(['']);
  const [phoneNumbers, setPhoneNumbers] = useState(['']);
  const [countryCode, setCountryCode] = useState(countryCodes[0].code);
  const [emails, setEmails] = useState(['']);
  const [birthdates, setBirthdates] = useState(['']);
  const [ages, setAges] = useState(['']);
  const [address, setAddress] = useState('');
  const [images, setImages] = useState([]); // array of image files
  const [imagePreviews, setImagePreviews] = useState([]);

  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
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

  // Image upload
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length) {
      const files = Array.from(e.target.files);
      setImages(files);
      setImagePreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const redirectToOtp = () => {
    router.push(`/otp?redirect=/accountfound`);
  };

  const handleSignup = async () => {
    if (!username.trim()) {
      setErrorMsg('Please enter a username.');
      setOpenSnackbar(true);
      return;
    }
    if (!password) {
      setErrorMsg('Please enter a password.');
      setOpenSnackbar(true);
      return;
    }
    if (names.some(name => !name.trim())) {
      setErrorMsg('Please fill all name fields.');
      setOpenSnackbar(true);
      return;
    }
    if (phoneNumbers.some(p => !p.match(/^\d{10}$/))) {
      setErrorMsg('Please enter valid 10-digit phone numbers.');
      setOpenSnackbar(true);
      return;
    }
    if (emails.some(e => !e.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/))) {
      setErrorMsg('Please enter valid emails.');
      setOpenSnackbar(true);
      return;
    }
    if (birthdates.some(bd => !bd)) {
      setErrorMsg('Please enter all birthdates.');
      setOpenSnackbar(true);
      return;
    }
    if (ages.some(age => !age || isNaN(age) || age < 0)) {
      setErrorMsg('Please enter valid ages.');
      setOpenSnackbar(true);
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please enter your address.');
      setOpenSnackbar(true);
      return;
    }

    // Prepare userData for API (images handled as URLs/previews for now)
    const userData = {
      username,
      password,
      names,
      countryCode,
      phoneNumbers,
      emails,
      birthdates,
      ages,
      address,
      images: imagePreviews,
      timestamp: new Date().toISOString(),
    };

    try {
      // Try MongoDB-backed signup
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.message && data.message.toLowerCase().includes('mongo')) {
          const redisSuccess = await tryRedisSignup(userData, setSuccess, setErrorMsg, setOpenSnackbar, redirectToOtp);
          if (redisSuccess) return;
        }
        setErrorMsg(data.message || 'Signup failed');
        setOpenSnackbar(true);
      } else {
        setSuccess(true);
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('phone', phoneNumbers[0] || '');
        sessionStorage.setItem('countryCode', countryCode);

        localStorage.setItem('otp_temp_phone', phoneNumbers[0] || '');
        localStorage.setItem('otp_temp_countryCode', countryCode);

        setOpenSnackbar(true);
        setTimeout(redirectToOtp, 900);
      }
    } catch (err) {
      // Server unreachable — fallback: save locally
      try {
        saveToRedisLike(phoneNumbers[0] || '', userData);

        localStorage.setItem('chamcha.json', JSON.stringify(userData));
        localStorage.setItem('maja.txt', encrypt(userData));
        localStorage.setItem('jhola.txt', encrypt(userData));
        localStorage.setItem('bhola.txt', encrypt({ ...userData, timestamp: userData.timestamp }));

        await saveToPublicFolder('chamcha.json', JSON.stringify(userData));
        await saveToPublicFolder('maja.txt', encrypt(userData));
        await saveToPublicFolder('jhola.txt', encrypt(userData));
        await saveToPublicFolder('bhola.txt', encrypt({ ...userData, timestamp: userData.timestamp }));

        localStorage.setItem('otp_temp_phone', phoneNumbers[0] || '');
        localStorage.setItem('otp_temp_countryCode', countryCode);

        setSuccess(true);
        setErrorMsg('Server unreachable. Data saved locally and in Redis simulation.');
        setOpenSnackbar(true);
        setTimeout(redirectToOtp, 1200);
      } catch (error) {
        setErrorMsg('Failed to save data locally.');
        setOpenSnackbar(true);
      }
    }
  };

  return (
    <Container maxWidth="sm" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} style={{ padding: '2rem', width: '100%', textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Sign Up</Typography>
        {success && <Alert severity="success">Signed up successfully! Please enter the OTP sent to your phone.</Alert>}

        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Multiple Names */}
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
          {phoneNumbers.map((phone, idx) => (
            <Box key={idx} display="flex" gap={1} alignItems="center" mt={1}>
              {idx === 0 && (
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
              )}
              <TextField
                label={`Phone Number ${phoneNumbers.length > 1 ? idx + 1 : ''}`}
                fullWidth
                margin="normal"
                value={phone}
                onChange={e => handleArrayChange(setPhoneNumbers, phoneNumbers, idx, e.target.value.replace(/\D/, ''))}
                sx={{ flex: 1 }}
              />
              {phoneNumbers.length > 1 && (
                <Button color="error" onClick={() => handleRemoveField(setPhoneNumbers, phoneNumbers, idx)}>-</Button>
              )}
              {idx === phoneNumbers.length - 1 && (
                <Button onClick={() => handleAddField(setPhoneNumbers, phoneNumbers)}>+</Button>
              )}
            </Box>
          ))}
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
            <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
              Upload Image(s) (QR code, profile, etc.)
            </Button>
          </label>
          <Box display="flex" gap={1} mt={1} flexWrap="wrap">
            {imagePreviews.map((src, i) => (
              <Avatar key={i} src={src} sx={{ width: 56, height: 56 }} />
            ))}
          </Box>
        </Box>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '1rem' }}
          onClick={handleSignup}
          disabled={success}
        >
          Sign Up
        </Button>
      </Paper>
      <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={success ? "success" : "error"}>
          {success
            ? "Signed up successfully! Redirecting to OTP page..."
            : errorMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}