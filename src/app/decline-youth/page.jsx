'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function DeclineYouthContent() {
  const searchParams = useSearchParams();
  const fromEmail = searchParams.get('from');
  const [youth, setYouth] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        let users = JSON.parse(localStorage.getItem('users'));

        if (!users || !Array.isArray(users) || users.length === 0) {
          const res = await fetch('/api/requestsloader');
          if (res.ok) {
            const data = await res.json();
            users = Array.isArray(data) ? data : data.users || [];
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

  const handleDecline = async () => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: youth?.email,
          subject: 'Youth Request Declined',
          text: `Your request has been declined, ${youth?.name || 'Youth'}.`
        })
      });

      await fetch('/api/requests/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: youth?.email })
      });

      alert('Declined and removed request successfully!');
      setYouth(null);
    } catch (err) {
      console.error('Error in decline flow:', err);
    }
  };

  if (!youth) return <div>Loading youth info...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Decline Youth Request</h1>
      <p>Name: {youth.name}</p>
      <p>Email: {youth.email}</p>
      <button onClick={handleDecline}>Decline</button>
    </div>
  );
}

export default function DeclineYouthPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <DeclineYouthContent />
    </Suspense>
  );
}
