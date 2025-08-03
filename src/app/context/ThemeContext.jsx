'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    // Try to load a previously selected background from localStorage
    const stored = localStorage.getItem('finedge_bg');
    if (stored) setBgImage(stored);
  }, []);

  const updateBgImage = (newBg) => {
    setBgImage(newBg);
    if (newBg) localStorage.setItem('finedge_bg', newBg);
    else localStorage.removeItem('finedge_bg');
  };

  return (
    <ThemeContext.Provider value={{ bgImage, updateBgImage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}