import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    const filePath = path.join(process.cwd(), 'eldercare-welfare', 'local_users.json');

    let users = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      users = JSON.parse(raw);
    }

    users.push(body);
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error saving to local_users.json:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
