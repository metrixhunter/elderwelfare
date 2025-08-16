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
        let users = JSON.parse(localStorage.getItem('users'));

        if (!Array.isArray(users)) {
          const res = await fetch('/api/requestsloader');
          if (res.ok) {
            const data = await res.json();
            users = Array.isArray(data) ? data : data.users || [];
            localStorage.setItem('users', JSON.stringify(users));
          } else {
            users = [];
          }
        }

        if (!Array.isArray(users)) users = [];

        const found = users.find(u => u.email === fromEmail);
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
