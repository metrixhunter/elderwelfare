'use client';

import { useEffect, useState } from 'react';
import { Card } from '../ui/card'; // your UI card component
import { Button } from '../ui/button'; // your UI button component
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Default QR placeholder image path (adjust if needed)
const DEFAULT_QR_PLACEHOLDER = '/elderwelfare/default-qr-placeholder.png';

// LocalStorage keys to scan for user data fallback (your signup files)
const LOCAL_USER_FILES = ['chamcha.json', 'maja.txt', 'jhola.txt', 'bhola.txt'];

// Utility: Load all users from localStorage fallback keys
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
      // ignore parse errors, maybe encrypted - skip for now
    }
  }
  return users;
}

export default function YouthView({ user }) {
  const [elders, setElders] = useState([]);
  const [helpStates, setHelpStates] = useState({}); // keyed by elder username

  useEffect(() => {
    // Load users and filter elders (age >= 55)
    const allUsers = loadAllUsersFromLocalStorage();

    // Flatten members if needed, then filter elders
    let eldersList = [];
    allUsers.forEach((userObj) => {
      if (!userObj.members) return;
      userObj.members.forEach((member) => {
        if (member.age >= 55) {
          eldersList.push({
            username: userObj.username,
            phone: member.phoneNumbers?.[0] || '',
            countryCode: member.countryCode || '+91',
            email: member.emails?.[0] || '',
            qrCodeImageUrl: member.images?.[0] || null,
          });
        }
      });
    });

    // Sort elders alphabetically by username
    eldersList.sort((a, b) => a.username.localeCompare(b.username));

    setElders(eldersList);

    // Initialize helpStates for elders if not existing
    const initHelp = {};
    eldersList.forEach(({ username }) => {
      initHelp[username] = {
        medicines: false,
        medicalHelp: false,
        money: false,
        moneyAmount: '',
        message: '',
        showQr: false,
      };
    });
    setHelpStates(initHelp);
  }, []);

  const handleCheckboxChange = (elderUsername, field) => (e) => {
    setHelpStates((prev) => ({
      ...prev,
      [elderUsername]: {
        ...prev[elderUsername],
        [field]: e.target.checked,
        // Reset moneyAmount if money unchecked
        ...(field === 'money' && !e.target.checked ? { moneyAmount: '' } : {}),
      },
    }));
  };

  const handleInputChange = (elderUsername, field) => (e) => {
    setHelpStates((prev) => ({
      ...prev,
      [elderUsername]: {
        ...prev[elderUsername],
        [field]: e.target.value,
      },
    }));
  };

  const handleToggleQr = (elderUsername) => {
    setHelpStates((prev) => ({
      ...prev,
      [elderUsername]: {
        ...prev[elderUsername],
        showQr: !prev[elderUsername].showQr,
      },
    }));
  };

  // Save request to localStorage per elder (can be enhanced to your message system)
  const handleSendRequest = (elderUsername) => {
    const help = helpStates[elderUsername];
    if (!help) return alert('No help info available');

    // Validate money amount if money ticked
    if (help.money && (!help.moneyAmount || isNaN(help.moneyAmount) || Number(help.moneyAmount) <= 0)) {
      return alert('Please enter a valid positive amount for money help.');
    }

    // Construct request object
    const request = {
      fromUsername: user.username,
      toUsername: elderUsername,
      help: {
        medicines: help.medicines,
        medicalHelp: help.medicalHelp,
        money: help.money ? Number(help.moneyAmount) : 0,
        message: help.message.trim(),
        timestamp: new Date().toISOString(),
      },
      confirmed: false, // elder will confirm later
    };

    // Load existing requests from localStorage
    const existingRaw = localStorage.getItem('helpRequests') || '{}';
    let existing;
    try {
      existing = JSON.parse(existingRaw);
    } catch {
      existing = {};
    }

    // Append new request under elderUsername
    if (!existing[elderUsername]) existing[elderUsername] = [];
    existing[elderUsername].push(request);

    localStorage.setItem('helpRequests', JSON.stringify(existing));

    alert('Help request sent! The elder user will confirm soon.');

    // Reset form for this elder
    setHelpStates((prev) => ({
      ...prev,
      [elderUsername]: {
        medicines: false,
        medicalHelp: false,
        money: false,
        moneyAmount: '',
        message: '',
        showQr: false,
      },
    }));
  };

  if (elders.length === 0) {
    return <Typography>No elder users found to offer help.</Typography>;
  }

  return (
    <div className="space-y-6">
      {elders.map((elder) => {
        const help = helpStates[elder.username] || {};
        return (
          <Card
            key={elder.username}
            className="bg-white shadow-lg rounded-xl p-4 flex flex-col md:flex-row gap-4"
            style={{ minWidth: '300px' }}
          >
            <Box className="flex-shrink-0 flex flex-col items-center" style={{ width: '120px' }}>
              <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                {elder.username}
              </Typography>

              <Typography variant="body2" color="textSecondary" noWrap>
                {`${elder.countryCode} ${elder.phone}`}
              </Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {elder.email}
              </Typography>

              <Button
                onClick={() => handleToggleQr(elder.username)}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              >
                {help.showQr ? 'Hide QR Code' : 'Show QR Code'}
              </Button>

              {help.showQr && (
                <Avatar
                  variant="square"
                  src={elder.qrCodeImageUrl || DEFAULT_QR_PLACEHOLDER}
                  alt={`${elder.username} QR Code`}
                  sx={{ width: 120, height: 120, mt: 1 }}
                />
              )}
            </Box>

            <Box className="flex-1 flex flex-col gap-2">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={help.medicines || false}
                    onChange={handleCheckboxChange(elder.username, 'medicines')}
                  />
                }
                label="Offer Medicines"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={help.medicalHelp || false}
                    onChange={handleCheckboxChange(elder.username, 'medicalHelp')}
                  />
                }
                label="Offer Medical Help"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={help.money || false}
                    onChange={handleCheckboxChange(elder.username, 'money')}
                  />
                }
                label="Offer Money"
              />
              {help.money && (
                <TextField
                  label="Amount (₹)"
                  type="number"
                  value={help.moneyAmount || ''}
                  onChange={handleInputChange(elder.username, 'moneyAmount')}
                  inputProps={{ min: 1 }}
                  size="small"
                  sx={{ maxWidth: 160 }}
                />
              )}

              <TextField
                label="Additional message"
                multiline
                rows={3}
                value={help.message || ''}
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
