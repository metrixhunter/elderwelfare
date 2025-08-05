import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'local_users.json');

// Save user to local file
export async function saveUserLocally(userObj) {
  try {
    let users = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      users = JSON.parse(data);
    }
    users.push(userObj);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    console.log('[LocalStorage] User saved to local_users.json');
  } catch (err) {
    console.error('[LocalStorage] Save failed:', err);
  }
}

// Retrieve user by username
export async function getUserFromLocal(username) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(data);
    return users.find(user => user.username === username) || null;
  } catch (err) {
    console.error('[LocalStorage] Read failed:', err);
    return null;
  }
}
