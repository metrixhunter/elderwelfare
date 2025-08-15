'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DeclineElderPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const [elder, setElder] = useState(null);
  const [status, setStatus] = useState('Loading elder info...');

  async function loadUsers() {
    try {
      let users = JSON.parse(localStorage.getItem('users'));
      if (!users) {
        const res = await fetch('/api/informationloader');
        if (!res.ok) throw new Error('Failed to fetch users');
        users = await res.json();
        localStorage.setItem('users', JSON.stringify(users));
      }
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

  async function handleDecline() {
    if (!elder) return;
    setStatus('Sending decline...');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: elder.email,
          subject: 'Elder Request Declined',
          text: `Hello ${elder.name}, unfortunately your request has been declined.`,
        }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      setStatus(`Elder declined and email sent to ${elder.email}`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to send decline.');
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Decline Elder</h1>
      {elder ? (
        <>
          <p>
            Decline request from <strong>{elder.name}</strong> (
            {elder.email})
          </p>
          <button onClick={handleDecline}>Decline</button>
        </>
      ) : (
        <p>{status}</p>
      )}
    </div>
  );
}
