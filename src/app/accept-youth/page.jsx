'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function AcceptYouthContent() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from'); // e.g. "hai" or "hai@gmail.com"
  const [youth, setYouth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        let users = null;

        // Try localStorage first
        try {
          users = JSON.parse(localStorage.getItem('users'));
        } catch {
          users = null;
        }

        // If localStorage empty → load from API
        if (!Array.isArray(users) || users.length === 0) {
          const res = await fetch('/api/requestsloader');
          if (res.ok) {
            const data = await res.json();
            users = Array.isArray(data.requests) ? data.requests : [];
            localStorage.setItem('users', JSON.stringify(users));
          } else {
            users = [];
          }
        }

        if (!Array.isArray(users)) users = [];

        // 🔥 Flexible matching:
        // - Exact email match
        // - Or username match before "@"
        const matches = users.filter((u) => {
          if (!u.email) return false;
          if (u.email === fromParam) return true;
          if (u.email.split('@')[0] === fromParam) return true;
          return false;
        });

        console.log('[ACCEPT-YOUTH] param =', fromParam, 'matches =', matches);

        // Pick latest by timestamp
        let found = null;
        if (matches.length > 0) {
          found = matches.reduce((latest, current) =>
            (current.timestamp || 0) > (latest.timestamp || 0)
              ? current
              : latest
          );
        }

        setYouth(found || null);
      } catch (err) {
        console.error('Error loading user:', err);
        setYouth(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [fromParam]);

  const handleAccept = async () => {
    if (!youth) return;

    try {
      // Step 1: send email
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: youth.email,
          subject: 'Youth Request Accepted',
          text: `Your request has been accepted, ${youth.name || 'Youth'}.`
        })
      });

      // Step 2: remove request
      await fetch('/api/requests/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: youth.email })
      });

      alert('Accepted and removed request successfully!');
      setYouth(null);
    } catch (err) {
      console.error('Error in accept flow:', err);
    }
  };

  if (loading) return <div>Loading youth info...</div>;
  if (!youth) return <div>No matching youth found for "{fromParam}".</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Accept Youth Request</h1>
      <p><b>Name:</b> {youth.name}</p>
      <p><b>Email:</b> {youth.email}</p>
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
