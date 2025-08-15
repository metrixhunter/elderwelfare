'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function AcceptElderContent() {
  const searchParams = useSearchParams();
  const fromEmail = searchParams.get('from');
  const [elder, setElder] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        let users = JSON.parse(localStorage.getItem('users'));
        if (!users || !Array.isArray(users) || users.length === 0) {
          const res = await fetch('/api/informationloader');
          if (res.ok) {
            users = await res.json();
            localStorage.setItem('users', JSON.stringify(users));
          }
        }
        const found = users?.find(u => u.email === fromEmail);
        setElder(found || null);
      } catch (err) {
        console.error('Error loading elder:', err);
      }
    }
    if (fromEmail) loadUser();
  }, [fromEmail]);

  const handleAccept = async () => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: elder?.email,
          subject: 'Elder Request Accepted',
          text: `Your request has been accepted, ${elder?.name || 'Elder'}.`
        })
      });
      alert('Accepted successfully!');
    } catch (err) {
      console.error('Error sending accept email:', err);
    }
  };

  if (!elder) return <div>Loading elder info...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Accept Elder Request</h1>
      <p>Name: {elder.name}</p>
      <p>Email: {elder.email}</p>
      <button onClick={handleAccept}>Accept</button>
    </div>
  );
}

export default function AcceptElderPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <AcceptElderContent />
    </Suspense>
  );
}
