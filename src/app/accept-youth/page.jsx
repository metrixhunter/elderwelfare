'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function AcceptYouthContent() {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from'); // could be username or email
  const [youth, setYouth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        // Step 1: Load all requests
        let requests = [];
        try {
          requests = JSON.parse(localStorage.getItem('users')) || [];
        } catch {
          requests = [];
        }

        if (!Array.isArray(requests) || requests.length === 0) {
          const res = await fetch('/api/requestsloader');
          if (res.ok) {
            const data = await res.json();
            requests = Array.isArray(data.requests) ? data.requests : [];
            localStorage.setItem('users', JSON.stringify(requests));
          }
        }

        // Step 2: Load informationloader (for all user emails)
        let infoUsers = [];
        try {
          const infoRes = await fetch('/api/auth/informationloader');
          if (infoRes.ok) {
            const infoJson = await infoRes.json().catch(() => null);
            infoUsers = Array.isArray(infoJson?.users) ? infoJson.users : [];
          }
        } catch {}
        
        // fallback if info empty
        if (!Array.isArray(infoUsers)) infoUsers = [];

        // Step 3: Try to find matching request
        let found = null;

        for (const req of requests) {
          if (!req.username) continue;

          // find same username in info loader
          const matchedUser = infoUsers.find(u => u.username === req.username);
          if (!matchedUser) continue;

          // collect all possible emails for this user
          const allEmails = [];
          matchedUser.members?.forEach(member => {
            if (Array.isArray(member.emails)) {
              allEmails.push(...member.emails);
            } else if (member.email) {
              allEmails.push(member.email);
            }
          });

          // check if fromParam matches username or any email
          if (
            req.username === fromParam ||
            allEmails.includes(fromParam) ||
            allEmails.some(e => e.split('@')[0] === fromParam)
          ) {
            // pick latest request if multiple
            if (!found || (req.timestamp || 0) > (found.timestamp || 0)) {
              found = { ...req, emails: allEmails };
            }
          }
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

  // for now, just show matching success
  if (loading) return <div>Loading youth info...</div>;
  if (!youth) return <div>No matching youth found for "{fromParam}".</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>✅ Found Youth Request</h1>
      <p><b>Name:</b> {youth.name}</p>
      <p><b>Username:</b> {youth.username}</p>
      <p><b>Emails:</b> {youth.emails?.join(', ') || '(none)'}</p>
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
