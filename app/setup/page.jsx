'use client';

import { useEffect } from 'react';

// Utility to generate random account and card numbers
function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}
function generateDebitCardNumber() {
  return Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
}
const banks = ['icici', 'hdfc', 'sbi', 'axis'];

export default function SetupPage() {
  useEffect(() => {
    // Setting initial user data in localStorage
    const userData = {
      email: 'user@example.com',
      password: 'password',
      username: 'demoUser',
      phone: '9876543210',
      countryCode: '+91',
      accountNumber: generateAccountNumber(),
      bank: banks[Math.floor(Math.random() * banks.length)],
      debitCardNumber: generateDebitCardNumber(),
    };

    localStorage.setItem('user', JSON.stringify(userData));

    alert('User data has been initialized in localStorage!');
  }, []);

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Setup Page</h1>
      <p>Initial user data has been stored in your browser&apos;s localStorage.</p>
    </main>
  );
}