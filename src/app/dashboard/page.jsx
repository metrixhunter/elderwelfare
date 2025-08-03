'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ElderView from '@/components/dashboard/ElderView';
import YouthView from '@/components/dashboard/YouthView';
import { logout } from '@/app/logout/logout';
import Header from '@/components/common/Header';
import BottomNav from '@/components/common/BottomNav';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userAge, setUserAge] = useState(undefined);
  const [persistedMessages, setPersistedMessages] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Find the first localStorage key starting with "user:"
    const userKey = Object.keys(localStorage).find((key) => key.startsWith('user:'));
    if (!userKey) {
      setError('No local user found. Please sign up or log in.');
      setTimeout(() => router.replace('/'), 1500);
      return;
    }

    let userObj;
    try {
      userObj = JSON.parse(localStorage.getItem(userKey));
    } catch (e) {
      setError('Corrupted local user data. Please sign up again.');
      setTimeout(() => router.replace('/'), 1500);
      return;
    }

    if (!userObj || !userObj.members || !Array.isArray(userObj.members) || userObj.members.length === 0) {
      setError('Incomplete local user data. Please sign up again.');
      setTimeout(() => router.replace('/'), 1500);
      return;
    }

    // Get user age from userObj.age or first member's age
    let age = typeof userObj.age === 'number' ? userObj.age : (userObj.members[0]?.age ?? undefined);

    setUser(userObj);
    setUserAge(age);

    // Load persisted messages for elder or youth
    const msgKey = age >= 55 ? 'elderMessages' : 'youthMessages';
    const savedMessages = localStorage.getItem(msgKey);
    if (savedMessages) {
      try {
        setPersistedMessages(JSON.parse(savedMessages));
      } catch {
        // ignore parse errors
      }
    }
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
