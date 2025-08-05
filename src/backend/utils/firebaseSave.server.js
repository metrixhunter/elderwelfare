import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { saveUserLocally, getUserFromLocal } from './localSave';

let db;

try {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n')
    );
    initializeApp({ credential: cert(serviceAccount) });
  }
  db = getFirestore();
} catch (err) {
  console.error('[Firebase Init Error]', err.message);
  db = null;
}

export async function saveUserToFirebase(userObj) {
  if (!db) {
    console.warn('[Firebase] Not initialized. Saving to local.');
    return await saveUserLocally(userObj);
  }

  try {
    const docRef = db.collection('users').doc(userObj.username);
    await docRef.set(userObj);
  } catch (err) {
    console.error('[Firebase] Save failed. Saving locally instead.', err.message);
    await saveUserLocally(userObj);
  }
}

export async function getUserFromFirebase({ username }) {
  if (!db) {
    console.warn('[Firebase] Not initialized. Reading from local.');
    return await getUserFromLocal(username);
  }

  try {
    const doc = await db.collection('users').doc(username).get();
    return doc.exists ? doc.data() : null;
  } catch (err) {
    console.error('[Firebase] Read failed. Reading from local instead.', err.message);
    return await getUserFromLocal(username);
  }
}
