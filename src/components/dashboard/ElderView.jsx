// src/components/dashboard/ElderView.jsx
'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/card'; // Your Card UI component
import { Button } from '../ui/button'; // Your Button UI component
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Your fallback user files keys
const LOCAL_USER_FILES = ['chamcha.json', 'maja.txt', 'jhola.txt', 'bhola.txt'];

// Load all users from localStorage fallback keys
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
  const [requestStates, setRequestStates] = useState({}); // keyed by elder username
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        // Prefer server aggregated data
        const infoRes = await fetch('/api/auth/informationloader');
        let allUsers = [];
        if (infoRes.ok) {
          const infoJson = await infoRes.json().catch(() => null);
          allUsers = (infoJson && Array.isArray(infoJson.users)) ? infoJson.users : [];
        }

        // fallback to localStorage if server returned no users
        if (!Array.isArray(allUsers) || allUsers.length === 0) {
          allUsers = loadAllUsersFromLocalStorage();
        }

        // SWAPPED LOGIC: show members with age >= 55 (elders)
        const eldersList = [];
        allUsers.forEach((userObj) => {
          if (!userObj.members) return;
          userObj.members.forEach((member) => {
            const age = (typeof member.age === 'number') ? member.age : (member.age ? Number(member.age) : null);
            if (age !== null && !isNaN(age) && age <= 55) {
              eldersList.push({
                username: userObj.username,
                phone: (member.phoneNumbers && member.phoneNumbers[0] && member.phoneNumbers[0].number) || '',
                countryCode: (member.phoneNumbers && member.phoneNumbers[0] && member.phoneNumbers[0].countryCode) || '+91',
                email: (member.emails && member.emails[0]) || '',
                qrCodeImageUrl: (member.images && member.images[0]) || null,
              });
            }
          });
        });

        eldersList.sort((a, b) => a.username.localeCompare(b.username));
        if (!mounted) return;

        setElders(eldersList);

        // initialize request states
        const initReq = {};
        eldersList.forEach(({ username }) => {
          initReq[username] = {
            medicines: false,
            medicalHelp: false,
            money: false,
            moneyAmount: '',
            requestEmail: false,
            requestPhone: false,
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

  const handleSendRequest = (elderUsername) => {
    const req = requestStates[elderUsername];
    if (!req) return alert('No request info available.');

    if (req.money && (!req.moneyAmount || isNaN(req.moneyAmount) || Number(req.moneyAmount) <= 0)) {
      return alert('Please enter a valid positive amount for money request.');
    }

    const request = {
      fromUsername: user.username,
      toUsername: elderUsername,
      requestHelp: {
        medicines: req.medicines,
        medicalHelp: req.medicalHelp,
        money: req.money ? Number(req.moneyAmount) : 0,
        requestEmail: req.requestEmail,
        requestPhone: req.requestPhone,
        message: req.message.trim(),
        timestamp: new Date().toISOString(),
      },
      confirmed: false,
    };

    // Save requests to localStorage (keyed by elderUsername)
    const existingRaw = localStorage.getItem('requestsToYouth') || '{}';
    let existing;
    try {
      existing = JSON.parse(existingRaw);
    } catch {
      existing = {};
    }

    if (!existing[elderUsername]) existing[elderUsername] = [];
    existing[elderUsername].push(request);
    localStorage.setItem('requestsToYouth', JSON.stringify(existing));

    alert('Request sent! The elder user will respond soon.');

    // Reset form for this elder
    setRequestStates((prev) => ({
      ...prev,
      [elderUsername]: {
        medicines: false,
        medicalHelp: false,
        money: false,
        moneyAmount: '',
        requestEmail: false,
        requestPhone: false,
        message: '',
      },
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

              <TextField
                label="Additional message"
                multiline
                rows={3}
                value={req.message || ''}
                onChange={handleInputChange(elder.username, 'message')}
                placeholder="Write any special requests or notes here..."
                fullWidth
              />

              <Button variant="contained" color="primary" onClick={() => handleSendRequest(elder.username)} sx={{ alignSelf: 'flex-start', mt: 1 }}>
                Confirm / Send Request
              </Button>
            </Box>
          </Card>
        );
      })}
    </div>
  );
}
