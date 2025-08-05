import fs from 'fs';
import path from 'path';

export default function readUserFromLocalJson(phone) {
  try {
    const filePath = path.join(process.cwd(), 'eldercare-welfare', 'local_users.json');
    if (!fs.existsSync(filePath)) return null;

    const data = fs.readFileSync(filePath, 'utf8');
    const users = JSON.parse(data);
    return users.find(u => u.phone?.number === phone) || null;
  } catch (e) {
    console.error('Error reading local_users.json:', e);
    return null;
  }
}
