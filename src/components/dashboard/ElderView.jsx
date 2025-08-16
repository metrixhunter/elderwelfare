// src/components/dashboard/ElderView.jsx
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
      if (user && user.username) {
        users.push(user);
      }
    } catch {
      // Ignore parse errors
    }
  }
  return users;
}

export default function ElderView({ user }) {
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
          allUsers = (infoJson && Array.isArray(infoJson.users)) ? infoJson.users : [];
        }

        if (!Array.isArray(allUsers) || allUsers.length === 0) {
          allUsers = loadAllUsersFromLocalStorage();
        }

        const eldersList = [];
        allUsers.forEach((userObj) => {
          if (!userObj.members) return;
          userObj.members.forEach((member) => {
            const age = (typeof member.age === 'number') ? member.age : (member.age ? Number(member.age) : null);
            if (age !== null && !isNaN(age) && age <= 55) {
              eldersList.push({
                username: userObj.username,
                phone: (member.phoneNumbers?.[0]?.number) || '',
                countryCode: (member.phoneNumbers?.[0]?.countryCode) || '+91',
                email: (member.emails?.[0]) || '',
                qrCodeImageUrl: (member.images?.[0]) || null,
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
            message: '',
          };
        });
        setRequestStates(initReq);
      } catch (err) {
        console.error('[ElderView] init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => { mounted = false; };
  }, []);

  const handleCheckboxChange = (elderUsername, field) => (e) => {
    setRequestStates((prev) => ({
      ...prev,
      [elderUsername]: {
        ...prev[elderUsername],
        [field]: e.target.checked,
        ...(field === 'money' && !e.target.checked ? { moneyAmount: '' } : {}),
      },
    }));
  };

  const handleInputChange = (elderUsername, field) => (e) => {
    setRequestStates((prev) => ({
      ...prev,
      [elderUsername]: {
        ...prev[elderUsername],
        [field]: e.target.value,
      },
    }));
  };

  const handleSendRequest = async (elderUsername) => {
    const req = requestStates[elderUsername];
    if (!req) return alert('No request info available.');

    if (req.money && (!req.moneyAmount || isNaN(req.moneyAmount) || Number(req.moneyAmount) <= 0)) {
      return alert('Please enter a valid positive amount for money request.');
    }

    const elderData = elders.find(e => e.username === elderUsername);

    const requestPayload = {
      fromUsername: user.username,
      toUsername: elderUsername,
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

    // Save to localStorage (offline fallback)
    const existingRaw = localStorage.getItem('requestsToYouth') || '{}';
    let existing;
    try {
      existing = JSON.parse(existingRaw);
    } catch {
      existing = {};
    }
    if (!existing[elderUsername]) existing[elderUsername] = [];
    existing[elderUsername].push(requestPayload);
    localStorage.setItem('requestsToYouth', JSON.stringify(existing));

    // Save request in JSON file via API
    try {
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
      } else {
        const errMsg = await res.text();
        console.error('[ElderView] send request failed:', errMsg);
        alert('Request saved locally but failed to send via server.');
      }
    } catch (err) {
      console.error('[ElderView] send request error:', err);
      alert('Request saved locally but server connection failed.');
    }

    // Save request to shared JSON file
await fetch('/api/requests/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(requestPayload)
});


    // Reset form state
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
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (elders.length === 0) return <Typography>No elder users found to request help from.</Typography>;

  return (
    <div className="space-y-6">
      {elders.map((elder) => {
        const req = requestStates[elder.username] || {};
        return (
          <Card
            key={elder.username}
            className="bg-white shadow-lg rounded-xl p-4 flex flex-col md:flex-row gap-4"
            style={{ minWidth: '300px' }}
          >
            <Box sx={{ width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {elder.username}
              </Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {`${elder.countryCode} ${elder.phone}`}
              </Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {elder.email}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Checkbox checked={req.medicines || false} onChange={handleCheckboxChange(elder.username, 'medicines')} />}
                label="Request Medicines"
              />
              <FormControlLabel
                control={<Checkbox checked={req.medicalHelp || false} onChange={handleCheckboxChange(elder.username, 'medicalHelp')} />}
                label="Request Medical Help"
              />
              <FormControlLabel
                control={<Checkbox checked={req.money || false} onChange={handleCheckboxChange(elder.username, 'money')} />}
                label="Request Money"
              />
              {req.money && (
                <TextField
                  label="Amount (₹)"
                  type="number"
                  value={req.moneyAmount || ''}
                  onChange={handleInputChange(elder.username, 'moneyAmount')}
                  inputProps={{ min: 1 }}
                  size="small"
                  sx={{ maxWidth: 160 }}
                />
              )}

              <FormControlLabel
                control={<Checkbox checked={req.requestEmail || false} onChange={handleCheckboxChange(elder.username, 'requestEmail')} />}
                label="Request Email"
              />
              <FormControlLabel
                control={<Checkbox checked={req.requestPhone || false} onChange={handleCheckboxChange(elder.username, 'requestPhone')} />}
                label="Request Phone Number"
              />
              <FormControlLabel
                control={<Checkbox checked={req.requestAddress || false} onChange={handleCheckboxChange(elder.username, 'requestAddress')} />}
                label="Request Address"
              />

              <TextField
                label="Additional message"
                multiline
                rows={3}
                value={req.message || ''}
                onChange={handleInputChange(elder.username, 'message')}
                placeholder="Write any special requests or notes here..."
                fullWidth
              />

              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSendRequest(elder.username)}
                sx={{ alignSelf: 'flex-start', mt: 1 }}
              >
                Confirm / Send Request
              </Button>
            </Box>
          </Card>
        );
      })}
    </div>
  );
}
