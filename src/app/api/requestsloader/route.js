import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'eldercare-welfare', 'requests.json');

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'requests.json not found' }, { status: 404 });
    }

    const fileData = fs.readFileSync(filePath, 'utf-8');
    let requests = [];

    try {
      requests = JSON.parse(fileData);
    } catch (err) {
      console.error('Error parsing requests.json:', err);
      return NextResponse.json({ success: false, error: 'Invalid JSON format' }, { status: 500 });
    }

    // Ensure it is always an array
    if (!Array.isArray(requests)) requests = [];

    return NextResponse.json({ success: true, count: requests.length, users: requests });
  } catch (err) {
    console.error('Error loading requests:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
