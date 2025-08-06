import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * DELETE /api/auth/remove-local-user?username=...
 * Removes the given username from local_users_backup.json.
 */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Missing username query parameter' },
        { status: 400 }
      );
    }

    const filePath = path.join(process.cwd(), 'local_users_backup.json');

    // If file doesn't exist, nothing to delete
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, message: 'Backup file not found' },
        { status: 404 }
      );
    }

    // Read and parse backup file
    const raw = fs.readFileSync(filePath, 'utf8');
    let users = [];
    if (raw.trim()) {
      try {
        users = JSON.parse(raw);
        if (!Array.isArray(users)) {
          return NextResponse.json(
            { success: false, message: 'Backup file contains invalid data' },
            { status: 500 }
          );
        }
      } catch (err) {
        return NextResponse.json(
          { success: false, message: 'Failed to parse backup file', error: err.message },
          { status: 500 }
        );
      }
    }

    // Filter out the user
    const initialLength = users.length;
    users = users.filter((u) => u.username !== username);

    if (users.length === initialLength) {
      return NextResponse.json(
        { success: false, message: 'User not found in backup file' },
        { status: 404 }
      );
    }

    // Write updated array back to file
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8');

    return NextResponse.json({ success: true, removed: username }, { status: 200 });
  } catch (err) {
    console.error('[RemoveLocalUser] Unexpected error:', err);
    return NextResponse.json(
      { success: false, message: 'Server error', error: err.message },
      { status: 500 }
    );
  }
}
