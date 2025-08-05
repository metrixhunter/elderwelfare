// src/app/backend/utils/firebaseSave.client.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

// Client-side Firebase config (from .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize app only once
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function saveUserToFirebase(userData) {
  try {
    const docRef = await addDoc(collection(db, 'users'), userData);
    console.log('User saved to Firebase with ID:', docRef.id);
  } catch (err) {
    console.error('Error saving to Firebase:', err);
    throw err;
  }
}
