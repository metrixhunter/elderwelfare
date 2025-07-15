'use client';
import { Box, Button, Typography } from '@mui/material';
import { useThemeContext } from '@/app/context/ThemeContext';
import { useRef } from 'react';

export default function ThemePicker() {
  const { updateBgImage } = useThemeContext();
  const fileRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => updateBgImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const clearBackground = () => updateBgImage('');

  return (
    <Box sx={{
      position: 'fixed', bottom: 20, left: 20, zIndex: 9999,
      background: 'rgba(255,255,255,0.95)', borderRadius: 2, p: 2, boxShadow: 2,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start'
    }}>
      <Typography fontWeight="bold" gutterBottom>🎨 Theme</Typography>
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={() => fileRef.current.click()}
        sx={{ mb: 1 }}
      >
        Upload Background
      </Button>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        style={{ display: 'none' }}
        onChange={handleFile}
      />
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        onClick={clearBackground}
      >
        Reset to Default
      </Button>
    </Box>
  );
}