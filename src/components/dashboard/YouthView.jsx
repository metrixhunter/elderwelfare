// src/components/dashboard/YouthView.jsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const LOCAL_USER_FILES = ['chamcha.json', 'maja.txt', 'jhola.txt', 'bhola.txt'];

function loadAllUsersFromLocalStorage() {
  const users = [];
  for (const key of LOCAL_USER_FILES) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const user = JSON.parse(raw);
      if (user?.username) users.push(user);
    } catch {}
  }
  return users;
}

export default function YouthView({ user }) {
  const [elders, setElders] = useState([]);
  const [requestStates, setRequestStates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const infoRes = await fetch('/api/auth/informationloader');
        let allUsers = [];
        if (infoRes.ok) {
          const infoJson = await infoRes.json().catch(() => null);
          allUsers = Array.isArray(infoJson?.users) ? infoJson.users : [];
        }
        if (!allUsers.length) {
          allUsers = loadAllUsersFromLocalStorage();
        }

        const eldersList = [];
        allUsers.forEach(userObj => {
          userObj.members?.forEach(member => {
            const age = Number(member.age);
            if (!isNaN(age) && age >= 55) {
              eldersList.push({
                username: userObj.username,
                phone: member.phoneNumbers?.[0]?.number || '',
                countryCode: member.phoneNumbers?.[0]?.countryCode || '+91',
                email: member.emails?.[0] || '',
                qrCodeImageUrl: member.images?.[0] || null
              });
            }
          });
        });

        eldersList.sort((a, b) => a.username.localeCompare(b.username));
        if (!mounted) return;

        setElders(eldersList);
        const initReq = {};
        eldersList.forEach(({ username }) => {
          initReq[username] = {
            medicines: false,
            medicalHelp: false,
            money: false,
            moneyAmount: '',
            requestEmail: false,
            requestPhone: false,
            requestAddress: false,
            message: ''
          };
        });
        setRequestStates(initReq);
      } catch (err) {
        console.error('[YouthView] init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    init();
    return () => { mounted = false; };
  }, []);

  const handleCheckboxChange = (elderUsername, field) => e => {
    setRequestStates(prev => ({
      ...prev,
      [elderUsername]: {
        ...prev[elderUsername],
        [field]: e.target.checked,
        ...(field === 'money' && !e.target.checked ? { moneyAmount: '' } : {})
      }
    }));
  };

  const handleInputChange = (elderUsername, field) => e => {
    setRequestStates(prev => ({
      ...prev,
      [elderUsername]: {
        ...prev[elderUsername],
        [field]: e.target.value
      }
    }));
  };

 const handleSendRequest = async (elderUsername) => {
  const req = requestStates[elderUsername];
  if (!req) return alert('No request info available.');

  if (req.money && (!req.moneyAmount || isNaN(req.moneyAmount) || Number(req.moneyAmount) <= 0)) {
    return alert('Enter valid positive amount.');
  }

  const elderData = elders.find(e => e.username === elderUsername);

 const requestPayload = {
  fromUsername: user.username,
  toUsername: elderUsername,
  fromEmails: Array.isArray(user.emails) ? user.emails : [user.email].filter(Boolean),
  toEmails: Array.isArray(elderData.emails) ? elderData.emails : [elderData.email].filter(Boolean),
  requestHelp: {
    medicines: req.medicines,
    medicalHelp: req.medicalHelp,
    money: req.money ? Number(req.moneyAmount) : 0,
    requestEmail: req.requestEmail,
    requestPhone: req.requestPhone,
    requestAddress: req.requestAddress,
    message: req.message.trim(),
    timestamp: new Date().toISOString()
  }
};


  const res = await fetch('/api/requests/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestPayload)
  });

  if (res.ok) {
    // Send Email Notification
    await fetch('/api/requests/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        elderEmail: elderData.email,
        elderName: elderData.username,
        fromUsername: user.username,
        requestHelp: requestPayload.requestHelp
      })
    });

    alert('Request sent! Elder will be notified via email.');

    setRequestStates(prev => ({
      ...prev,
      [elderUsername]: {
        medicines: false,
        medicalHelp: false,
        money: false,
        moneyAmount: '',
        requestEmail: false,
        requestPhone: false,
        requestAddress: false,
        message: ''
      }
    }));
  } else {
    alert('Failed to send request.');
  }
  // Save request to shared JSON file
await fetch('/api/requests/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestPayload)
});

};



  if (loading) return <Typography>Loading...</Typography>;
  if (!elders.length) return <Typography>No elder users found.</Typography>;

  return (
    <div className="space-y-6">
      {elders.map((elder) => {
        const req = requestStates[elder.username] || {};
        return (
          <Card key={elder.username} className="bg-white shadow-lg rounded-xl p-4 flex flex-col md:flex-row gap-4">
            <Box sx={{ width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6">{elder.username}</Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {`${elder.countryCode} ${elder.phone}`}
              </Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {elder.email}
              </Typography>
              {elder.qrCodeImageUrl && <img src={elder.qrCodeImageUrl} alt="QR Code" style={{ width: 100, marginTop: 8 }} />}
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel control={<Checkbox checked={req.medicines} onChange={handleCheckboxChange(elder.username, 'medicines')} />} label="Request Medicines" />
              <FormControlLabel control={<Checkbox checked={req.medicalHelp} onChange={handleCheckboxChange(elder.username, 'medicalHelp')} />} label="Medical Help" />
              <FormControlLabel control={<Checkbox checked={req.money} onChange={handleCheckboxChange(elder.username, 'money')} />} label="Donate Money" />
              {req.money && (
                <TextField label="Amount (₹)" type="number" value={req.moneyAmount} onChange={handleInputChange(elder.username, 'moneyAmount')} size="small" sx={{ maxWidth: 160 }} />
              )}
              <FormControlLabel control={<Checkbox checked={req.requestEmail} onChange={handleCheckboxChange(elder.username, 'requestEmail')} />} label="Request Email" />
              <FormControlLabel control={<Checkbox checked={req.requestPhone} onChange={handleCheckboxChange(elder.username, 'requestPhone')} />} label="Request Phone" />
              <FormControlLabel control={<Checkbox checked={req.requestAddress} onChange={handleCheckboxChange(elder.username, 'requestAddress')} />} label="Request Address" />
              <TextField label="Additional message" multiline rows={3} value={req.message} onChange={handleInputChange(elder.username, 'message')} fullWidth />
              <Button onClick={() => handleSendRequest(elder.username)}>Confirm / Send Request</Button>
            </Box>
          </Card>
        );
      })}
    </div>
  );
}
