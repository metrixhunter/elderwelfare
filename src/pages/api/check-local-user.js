import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'eldercare-welfare', 'local_users.json');
  try {
    const exists = fs.existsSync(filePath);
    return res.status(200).json({ exists });
  } catch (error) {
    console.error('Error checking file:', error);
    return res.status(500).json({ exists: false, error: 'Internal Server Error' });
  }
}
