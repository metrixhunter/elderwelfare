import { NextResponse } from 'next/server';
import { dbConnect, getUser, saveUser } from '@/backend/utils/dbConnect';
import { promises as fs } from 'fs';
import path from 'path';

// Helper for base64 encoding
function encodeBase64(data) {
  return Buffer.from(data, 'utf-8').toString('base64');
}

// Helper to save user info to chamcha.json (plain) and maja.txt, jhola.txt, bhola.txt (base64-encoded)
// in both /app and /public/user_data folders.
async function saveToFiles(userObj) {
  const locations = [
    path.resolve(process.cwd(), 'app'),
    path.resolve(process.cwd(), 'public', 'user_data'),
  ];

  const backupStr = JSON.stringify(userObj);
  const encoded = encodeBase64(backupStr);

  for (const dir of locations) {
    try {
      await fs.mkdir(dir, { recursive: true });
      // chamcha.json (plain JSON, newline separated)
      const chamchaPath = path.join(dir, 'chamcha.json');
      await fs.appendFile(chamchaPath, backupStr + '\n', 'utf8');
      // maja.txt, jhola.txt, bhola.txt (base64-encoded, newline separated)
      for (const file of ['maja.txt', 'jhola.txt', 'bhola.txt']) {
        const filePath = path.join(dir, file);
        await fs.appendFile(filePath, encoded + '\n', 'utf8');
      }
    } catch (e) {
      console.error(`Error writing backup in ${dir}:`, e);
    }
  }
}

/**
 * Accepts: POST JSON body with { username, phone, countryCode, bank, accountNumber, debitCardNumber }
 * - Checks if user exists and matches these bank details.
 * - If match: sets linked=true for user, returns success.
 * - If not: returns error.
 * - Works with MongoDB, Redis, or (if both fail) file backup (readonly).
 */
export async function POST(req) {
  try {
    const { username, phone, countryCode, bank, accountNumber, debitCardNumber } = await req.json();

    // Try connecting to DBs
    let dbMode;
    try {
      dbMode = await dbConnect(); // Should return { mongoAvailable, redisAvailable }
    } catch (e) {
      dbMode = { mongoAvailable: false, redisAvailable: false };
    }

    let user = null;
    let canPersist = false;

    // Try Mongo or Redis for user fetch/save
    if (dbMode.mongoAvailable || dbMode.redisAvailable) {
      user = await getUser({ username, phone, countryCode });
      canPersist = true;
    }

    // Fallback: try backup files for readonly user lookup
    if (!user) {
      // Try /app/chamcha.json and /public/user_data/chamcha.json (newline-delimited JSON)
      for (const dir of ['app', 'public/user_data']) {
        try {
          const chamchaPath = path.resolve(process.cwd(), dir, 'chamcha.json');
          const raw = await fs.readFile(chamchaPath, 'utf8');
          const lines = raw.split('\n').filter(Boolean);
          for (const line of lines) {
            let candidate;
            try {
              candidate = JSON.parse(line);
            } catch { continue; }
            if (
              candidate.username === username &&
              candidate.phone === phone &&
              candidate.countryCode === countryCode
            ) {
              user = candidate;
              break;
            }
          }
          if (user) break;
        } catch {}
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found.' },
        { status: 404 }
      );
    }

    // Check if bank details match
    if (
      user.bank !== bank ||
      user.accountNumber !== accountNumber ||
      user.debitCardNumber !== debitCardNumber
    ) {
      return NextResponse.json(
        { success: false, message: 'Bank details do not match.' },
        { status: 401 }
      );
    }

    // Details correct, set linked true if not already and if we have a backend to persist
    if (!user.linked && canPersist) {
      user.linked = true;
      try {
        await saveUser(user); // Save to Mongo/Redis only if available
      } catch (e) {
        // If save fails, continue to backup writing
      }
    } else if (!user.linked) {
      // If only using backup, mark as linked in the backup copy (memory only)
      user.linked = true;
    }

    // Save to backup files (both /app and /public/user_data)
    await saveToFiles(user);

    return NextResponse.json({
      success: true,
      message: 'Bank account linked successfully.',
      linked: true,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Failed to link account.', error: err.message },
      { status: 500 }
    );
  }
}