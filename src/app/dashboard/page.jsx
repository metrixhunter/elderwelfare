'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ElderView from '@/components/dashboard/ElderView';
import YouthView from '@/components/dashboard/YouthView';
import { logout } from '@/app/logout/logout';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';

const WAIT_BEFORE_INFOLOAD_MS = 15000; // wait 15 seconds before calling informationloader

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userAge, setUserAge] = useState(undefined);
  const [persistedMessages, setPersistedMessages] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      // 1) Determine "current username" from sessionStorage (preferred) or localStorage fallback
      const sessionUsername = sessionStorage.getItem('username') || null;

      // fallback: find first localStorage key starting with "user:" and parse it for username
      let fallbackUsername = null;
      const userKey = Object.keys(localStorage).find((key) => key.startsWith('user:'));
      if (userKey) {
        try {
          const parsed = JSON.parse(localStorage.getItem(userKey));
          if (parsed?.username) fallbackUsername = parsed.username;
        } catch {
          // ignore parse errors
        }
      }

      const usernameToFind = sessionUsername || fallbackUsername;
      if (!usernameToFind) {
        setError('No local user found. Please sign up or log in.');
        setTimeout(() => router.replace('/'), 1500);
        return;
      }

      // WAIT before calling informationloader (as requested)
      try {
        await new Promise((resolve) => setTimeout(resolve, WAIT_BEFORE_INFOLOAD_MS));
      } catch (e) {
        // ignore
      }

      // 2) Try to fetch the aggregated data from informationloader (which reads primary & backup JSONs)
      try {
        const res = await fetch('/api/auth/informationloader', { method: 'GET' });
        if (res.ok) {
          const json = await res.json().catch(() => null);
          const users = (json && Array.isArray(json.users)) ? json.users : [];

          // Find user by username (exact match)
          const matched = users.find(u => u && u.username === usernameToFind);

          if (matched) {
            // Use matched object from informationloader
            setUser(matched);

            // derive age: prefer top-level age if present, otherwise first member's age
            const age = typeof matched.age === 'number' ? matched.age : (matched.members?.[0]?.age ?? undefined);
            setUserAge(age);

            // load persisted messages based on age
            const msgKey = (age >= 55) ? 'elderMessages' : 'youthMessages';
            const savedMessages = localStorage.getItem(msgKey);
            if (savedMessages) {
              try { setPersistedMessages(JSON.parse(savedMessages)); } catch {}
            }

            return;
          }
        } else {
          // Non-OK response — log and fall through to fallback below
          console.warn('[Dashboard] informationloader returned non-OK status:', res.status);
        }
      } catch (err) {
        console.warn('[Dashboard] Failed to call informationloader:', err);
      }

      // 3) Fallback: try to read the first local user stored in localStorage ('user:' keys)
      if (userKey) {
        try {
          const parsed = JSON.parse(localStorage.getItem(userKey));
          if (!parsed || !parsed.members || !Array.isArray(parsed.members) || parsed.members.length === 0) {
            setError('Incomplete local user data. Please sign up again.');
            setTimeout(() => router.replace('/'), 1500);
            return;
          }

          setUser(parsed);
          const age = typeof parsed.age === 'number' ? parsed.age : (parsed.members[0]?.age ?? undefined);
          setUserAge(age);

          const msgKey = (age >= 55) ? 'elderMessages' : 'youthMessages';
          const savedMessages = localStorage.getItem(msgKey);
          if (savedMessages) {
            try { setPersistedMessages(JSON.parse(savedMessages)); } catch {}
          }
          return;
        } catch (e) {
          setError('Corrupted local user data. Please sign up again.');
          setTimeout(() => router.replace('/'), 1500);
          return;
        }
      }

      // If nothing found
      setError('User not found. Please sign up or log in.');
      setTimeout(() => router.replace('/'), 1500);
    }

    load();
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
        {error}
      </div>
    );
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  const role = userAge >= 55 ? 'elder' : 'youth';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 to-yellow-50">
      <Header role={role} onLogout={handleLogout} user={user} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6">
        {role === 'elder' ? (
          <ElderView user={user} userAge={userAge} persistedMessages={persistedMessages} />
        ) : (
          <YouthView user={user} userAge={userAge} persistedMessages={persistedMessages} />
        )}
      </main>
      <BottomNav role={role} onLogout={handleLogout} />
    </div>
  );
}

