// src/app/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ add this
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCIWZv-6uMJd8t7gxhAPtKX77L0sxbBmp0",
  authDomain: "project-172ab.firebaseapp.com",
  projectId: "project-172ab",
  storageBucket: "project-172ab.firebasestorage.app",
  messagingSenderId: "623414371551",
  appId: "1:623414371551:web:0eab5defa11f18a92b756a",
  measurementId: "G-Q6K5HN0995",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
const db = getFirestore(app);

// ✅ Initialize Analytics (only if window is defined)
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// ✅ Export everything you need
export { app, db, analytics };
