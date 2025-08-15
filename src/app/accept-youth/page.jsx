'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AcceptYouthPage() {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const [youth, setYouth] = useState(null);
  const [status, setStatus] = useState('Loading youth info...');

  async function loadUsers() {
    try {
      let users = JSON.parse(localStorage.getItem('users'));
      if (!users) {
        const res = await fetch('/api/informationloader');
        if (!res.ok) throw new Error('Failed to fetch users');
        users = await res.json();
        localStorage.setItem('users', JSON.stringify(users));
      }
      const found = users.youths?.find(
        (u) => u.email === from || u.id?.toString() === from
      );
      if (found) setYouth(found);
      else setStatus('Youth not found.');
    } catch (err) {
      console.error(err);
      setStatus('Error loading youth info.');
    }
  }

  async function handleAccept() {
    if (!youth) return;
    setStatus('Sending acceptance...');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: youth.email,
          subject: 'Youth Request Accepted',
          text: `Hello ${youth.name}, your request has been accepted.`,
        }),
      });
      if (!res.ok) throw new Error('Failed to send email');
      setStatus(`Youth accepted and email sent to ${youth.email}`);
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
      <h1>Accept Youth</h1>
      {youth ? (
        <>
          <p>
            Accept request from <strong>{youth.name}</strong> (
            {youth.email})
          </p>
          <button onClick={handleAccept}>Accept</button>
        </>
      ) : (
        <p>{status}</p>
      )}
    </div>
  );
}
