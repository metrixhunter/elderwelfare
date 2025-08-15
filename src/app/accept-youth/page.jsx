'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function AcceptYouthContent() {
  const searchParams = useSearchParams();
  const fromEmail = searchParams.get('from');
  const [youth, setYouth] = useState(null);

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
        setYouth(found || null);
      } catch (err) {
        console.error('Error loading youth:', err);
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
          to: youth?.email,
          subject: 'Youth Request Accepted',
          text: `Your request has been accepted, ${youth?.name || 'Youth'}.`
        })
      });
      alert('Accepted successfully!');
    } catch (err) {
      console.error('Error sending accept email:', err);
    }
  };

  if (!youth) return <div>Loading youth info...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Accept Youth Request</h1>
      <p>Name: {youth.name}</p>
      <p>Email: {youth.email}</p>
      <button onClick={handleAccept}>Accept</button>
    </div>
  );
}

export default function AcceptYouthPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <AcceptYouthContent />
    </Suspense>
  );
}
