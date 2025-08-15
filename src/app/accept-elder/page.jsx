'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AcceptElderPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const [elder, setElder] = useState(null);
  const [status, setStatus] = useState('Loading elder info...');

  async function loadUsers() {
    try {
      // 1️⃣ Try localStorage
      let users = JSON.parse(localStorage.getItem('users'));
      if (!users) {
        // 2️⃣ If not in localStorage, fetch from API
        const res = await fetch('/api/informationloader');
        if (!res.ok) throw new Error('Failed to fetch users');
        users = await res.json();
        localStorage.setItem('users', JSON.stringify(users));
      }
      // 3️⃣ Find elder by email or id
      const found = users.elders?.find(
        (u) => u.email === from || u.id?.toString() === from
      );
      if (found) setElder(found);
      else setStatus('Elder not found.');
    } catch (err) {
      console.error(err);
      setStatus('Error loading elder info.');
    }
  }

  async function handleAccept() {
    if (!elder) return;
    setStatus('Sending acceptance...');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: elder.email,
          subject: 'Elder Request Accepted',
          text: `Hello ${elder.name}, your request has been accepted.`,
        }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      setStatus(`Elder accepted and email sent to ${elder.email}`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to send acceptance.');
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Accept Elder</h1>
      {elder ? (
        <>
          <p>
            Accept request from <strong>{elder.name}</strong> (
            {elder.email})
          </p>
          <button onClick={handleAccept}>Accept</button>
        </>
      ) : (
        <p>{status}</p>
      )}
    </div>
  );
}
