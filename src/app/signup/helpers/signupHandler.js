// src/app/signup/helpers/signupHandler.js
import { encrypt } from '@/app/utils/encryption';

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
    sessionStorage.setItem('phone', userData.members[0].phoneNumbers[0]?.number || '');
    sessionStorage.setItem('countryCode', userData.members[0].phoneNumbers[0]?.countryCode || '');

    localStorage.setItem('otp_temp_phone', userData.members[0].phoneNumbers[0]?.number || '');
    localStorage.setItem('otp_temp_countryCode', userData.members[0].phoneNumbers[0]?.countryCode || '');

    setSuccess(true);
    setErrorMsg('Signed up using Redis fallback! Please enter the OTP sent to your phone.');
    setOpenSnackbar(true);
    setTimeout(redirectToOtp, 900);
    return true;
  } catch {
    return false;
  }
}

export async function handleSignupAction({
  userData,
  setSuccess,
  setErrorMsg,
  setOpenSnackbar,
  redirectToOtp,
}) {
  const saveToLocalBackup = async () => {
    const phone = userData.members[0].phoneNumbers[0]?.number || '';
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
        const redisSuccess = await tryRedisSignup(
          userData,
          setSuccess,
          setErrorMsg,
          setOpenSnackbar,
          redirectToOtp
        );
        if (redisSuccess) return;
      }
      setErrorMsg(result.message || 'Signup failed');
      setOpenSnackbar(true);
      return;
    }

    await saveToLocalBackup();

    sessionStorage.setItem('username', userData.username);
    sessionStorage.setItem('phone', userData.members[0].phoneNumbers[0]?.number || '');
    localStorage.setItem('otp_temp_phone', userData.members[0].phoneNumbers[0]?.number || '');
    setSuccess(true);
    setOpenSnackbar(true);
    setTimeout(redirectToOtp, 1000);
  } catch {
    try {
      await saveToLocalBackup();
      sessionStorage.setItem('username', userData.username);
      sessionStorage.setItem('phone', userData.members[0].phoneNumbers[0]?.number || '');
      localStorage.setItem('otp_temp_phone', userData.members[0].phoneNumbers[0]?.number || '');
      setSuccess(true);
      setErrorMsg('Server unreachable. Data saved locally and in Redis simulation.');
      setOpenSnackbar(true);
      setTimeout(redirectToOtp, 1200);
    } catch {
      setErrorMsg('Failed to save data locally.');
      setOpenSnackbar(true);
    }
  }
}
