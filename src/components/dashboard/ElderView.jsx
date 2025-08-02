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
  const [youths, setYouths] = useState([]);
  const [requestStates, setRequestStates] = useState({}); // keyed by youth username

  useEffect(() => {
    // Load users and filter youths (age < 55)
    const allUsers = loadAllUsersFromLocalStorage();

    let youthsList = [];
    allUsers.forEach((userObj) => {
      if (!userObj.members) return;
      userObj.members.forEach((member) => {
        if (member.age < 55) {
          youthsList.push({
            username: userObj.username,
            phone: member.phoneNumbers?.[0] || '',
            countryCode: member.countryCode || '+91',
            email: member.emails?.[0] || '',
          });
        }
      });
    });

    youthsList.sort((a, b) => a.username.localeCompare(b.username));
    setYouths(youthsList);

    // Initialize request states for youths
    const initReq = {};
    youthsList.forEach(({ username }) => {
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
  }, []);

  const handleCheckboxChange = (youthUsername, field) => (e) => {
    setRequestStates((prev) => ({
      ...prev,
      [youthUsername]: {
        ...prev[youthUsername],
        [field]: e.target.checked,
        ...(field === 'money' && !e.target.checked ? { moneyAmount: '' } : {}),
      },
    }));
  };

  const handleInputChange = (youthUsername, field) => (e) => {
    setRequestStates((prev) => ({
      ...prev,
      [youthUsername]: {
        ...prev[youthUsername],
        [field]: e.target.value,
      },
    }));
  };

  const handleSendRequest = (youthUsername) => {
    const req = requestStates[youthUsername];
    if (!req) return alert('No request info available.');

    if (req.money && (!req.moneyAmount || isNaN(req.moneyAmount) || Number(req.moneyAmount) <= 0)) {
      return alert('Please enter a valid positive amount for money request.');
    }

    const request = {
      fromUsername: user.username,
      toUsername: youthUsername,
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

    // Save requests to localStorage (keyed by youthUsername)
    const existingRaw = localStorage.getItem('requestsToYouth') || '{}';
    let existing;
    try {
      existing = JSON.parse(existingRaw);
    } catch {
      existing = {};
    }

    if (!existing[youthUsername]) existing[youthUsername] = [];
    existing[youthUsername].push(request);
    localStorage.setItem('requestsToYouth', JSON.stringify(existing));

    alert('Request sent! The youth user will respond soon.');

    // Reset form for this youth
    setRequestStates((prev) => ({
      ...prev,
      [youthUsername]: {
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

  if (youths.length === 0) {
    return <Typography>No youth users found to request help from.</Typography>;
  }

  return (
    <div className="space-y-6">
      {youths.map((youth) => {
        const req = requestStates[youth.username] || {};
        return (
          <Card
            key={youth.username}
            className="bg-white shadow-lg rounded-xl p-4 flex flex-col md:flex-row gap-4"
            style={{ minWidth: '300px' }}
          >
            <Box sx={{ width: 140, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {youth.username}
              </Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {`${youth.countryCode} ${youth.phone}`}
              </Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {youth.email}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={req.medicines || false}
                    onChange={handleCheckboxChange(youth.username, 'medicines')}
                  />
                }
                label="Request Medicines"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={req.medicalHelp || false}
                    onChange={handleCheckboxChange(youth.username, 'medicalHelp')}
                  />
                }
                label="Request Medical Help"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={req.money || false}
                    onChange={handleCheckboxChange(youth.username, 'money')}
                  />
                }
                label="Request Money"
              />
              {req.money && (
                <TextField
                  label="Amount (₹)"
                  type="number"
                  value={req.moneyAmount || ''}
                  onChange={handleInputChange(youth.username, 'moneyAmount')}
                  inputProps={{ min: 1 }}
                  size="small"
                  sx={{ maxWidth: 160 }}
                />
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={req.requestEmail || false}
                    onChange={handleCheckboxChange(youth.username, 'requestEmail')}
                  />
                }
                label="Request Email"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={req.requestPhone || false}
                    onChange={handleCheckboxChange(youth.username, 'requestPhone')}
                  />
                }
                label="Request Phone Number"
              />

              <TextField
                label="Additional message"
                multiline
                rows={3}
                value={req.message || ''}
                onChange={handleInputChange(youth.username, 'message')}
                placeholder="Write any special requests or notes here..."
                fullWidth
              />

              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSendRequest(youth.username)}
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
