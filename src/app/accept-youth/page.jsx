'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function AcceptYouthContent() {
  const searchParams = useSearchParams();
  const fromEmail = searchParams.get('from');
  const [youth, setYouth] = useState(null);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  async function loadUser() {
    try {
      let users = null;

      // Try to read from localStorage safely
      try {
        users = JSON.parse(localStorage.getItem('users'));
      } catch {
        users = null;
      }

      // If nothing valid in localStorage, load from API
      if (!Array.isArray(users) || users.length === 0) {
        const res = await fetch('/api/requestsloader');
        if (res.ok) {
          const data = await res.json();
          users = Array.isArray(data.users) ? data.users : [];
          localStorage.setItem('users', JSON.stringify(users));
        } else {
          users = [];
        }
      }

      // Still make sure it’s an array
      if (!Array.isArray(users)) users = [];

      // Find by email
      const found = users.find((u) => u.email === fromEmail);
      setYouth(found || null);
    } catch (err) {
      console.error('Error loading user:', err);
      setYouth(null);
    } finally {
      setLoading(false);
    }
  }

  loadUser();
}, [fromEmail]);


  const handleAccept = async () => {
    try {
      // Step 1: send email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: youth?.email,
          subject: 'Youth Request Accepted',
          text: `Your request has been accepted, ${youth?.name || 'Youth'}.`
        })
      });

      // Step 2: remove request
      await fetch('/api/requests/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: youth?.email })
      });

      alert('Accepted and removed request successfully!');
      setYouth(null);
    } catch (err) {
      console.error('Error in accept flow:', err);
    }
  };

  if (loading) return <div>Loading youth info...</div>;
  if (!youth) return <div>No matching youth found.</div>;

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
