// src/backend/utils/localSave.js
import fs from 'fs';
import path from 'path';

const basePath = process.cwd();
const primaryPath = path.join(basePath, 'local_users.json');
const backupPath = path.join(basePath, 'local_users_backup.json');

function safeParse(data) {
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return null; // caller will handle fallback/reset
  }
}

function writeAtomic(filePath, content) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, content, 'utf8');
  fs.renameSync(tmpPath, filePath);
}

// Ensure file exists and contains a valid JSON array; if corrupted, overwrite with []
function ensureValidFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      writeAtomic(filePath, '[]');
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8').trim();
    if (!data) {
      writeAtomic(filePath, '[]');
      return [];
    }
    const parsed = safeParse(data);
    if (Array.isArray(parsed)) return parsed;
    // corrupted, reset file and return empty array
    console.warn(`[LocalStorage] Corrupt JSON at ${filePath}, resetting to []`);
    writeAtomic(filePath, '[]');
    return [];
  } catch (err) {
    console.error(`[LocalStorage] ensureValidFile error for ${filePath}:`, err);
    try { writeAtomic(filePath, '[]'); } catch (e) {}
    return [];
  }
}

// Helper to persist an array to a file atomically (with pretty formatting)
function persistArrayToFile(filePath, arr) {
  try {
    const json = JSON.stringify(arr, null, 2);
    writeAtomic(filePath, json);
    return true;
  } catch (err) {
    console.error(`[LocalStorage] Write failed for ${filePath}:`, err);
    return false;
  }
}

/**
 * Save user to local file (writes to primary and backup).
 * - Avoid duplicate username entries.
 * - Ensure both files contain the user. If backup is missing the user, add it.
 */
export async function saveUserLocally(userObj) {
  try {
    // Load primary and backup (ensure valid)
    const primaryUsers = ensureValidFile(primaryPath);
    const backupUsers = ensureValidFile(backupPath);

    // Check duplicates by username
    const username = userObj?.username;
    if (!username) {
      console.warn('[LocalStorage] saveUserLocally called without username.');
      return;
    }

    const primaryHas = primaryUsers.some(u => u && u.username === username);
    const backupHas = backupUsers.some(u => u && u.username === username);

    // Add to primary if missing
    if (!primaryHas) {
      primaryUsers.push(userObj);
      const ok = persistArrayToFile(primaryPath, primaryUsers);
      if (!ok) console.warn('[LocalStorage] Failed to persist primary after adding user.');
    }

    // Add to backup if missing
    if (!backupHas) {
      backupUsers.push(userObj);
      const ok = persistArrayToFile(backupPath, backupUsers);
      if (!ok) console.warn('[LocalStorage] Failed to persist backup after adding user.');
    }

    console.log('[LocalStorage] User saved/ensured in local_users.json and local_users_backup.json');
  } catch (err) {
    console.error('[LocalStorage] Save failed:', err);
  }
}

/**
 * Retrieve user by username.
 * - Try primary first. If primary is corrupted or missing user but backup has it,
 *   return the backup user and also append it into primary (sync).
 */
export async function getUserFromLocal(username) {
  try {
    if (!username) return null;

    // 1) Try primary
    if (fs.existsSync(primaryPath)) {
      const data = fs.readFileSync(primaryPath, 'utf8').trim();
      const parsed = safeParse(data);
      if (Array.isArray(parsed)) {
        const found = parsed.find(u => u && u.username === username);
        if (found) return found;
      } else {
        console.warn('[LocalStorage] Primary JSON corrupted; will try backup.');
      }
    }

    // 2) Try backup
    if (fs.existsSync(backupPath)) {
      const data = fs.readFileSync(backupPath, 'utf8').trim();
      const parsed = safeParse(data);
      if (Array.isArray(parsed)) {
        const found = parsed.find(u => u && u.username === username);
        if (found) {
          // If primary exists and is valid, sync the found user into primary
          try {
            const primaryArr = ensureValidFile(primaryPath);
            const alreadyPrimary = primaryArr.some(u => u && u.username === username);
            if (!alreadyPrimary) {
              primaryArr.push(found);
              persistArrayToFile(primaryPath, primaryArr);
              console.log(`[LocalStorage] Synced user "${username}" from backup into primary file.`);
            }
          } catch (syncErr) {
            console.warn('[LocalStorage] Failed to sync backup user into primary:', syncErr);
          }
          return found;
        }
      } else {
        console.warn('[LocalStorage] Backup JSON corrupted.');
      }
    }

    // not found
    return null;
  } catch (err) {
    console.error('[LocalStorage] Read failed:', err);
    return null;
  }
}

/**
 * Optional helper: remove a user from both files (useful for DELETE endpoints).
 * Returns true if user removed from at least one file.
 */
export async function removeUserFromLocal(username) {
  if (!username) return false;
  let removed = false;
  try {
    // Primary
    const primaryArr = ensureValidFile(primaryPath);
    const newPrimary = primaryArr.filter(u => !u || u.username !== username);
    if (newPrimary.length !== primaryArr.length) {
      persistArrayToFile(primaryPath, newPrimary);
      removed = true;
    }

    // Backup
    const backupArr = ensureValidFile(backupPath);
    const newBackup = backupArr.filter(u => !u || u.username !== username);
    if (newBackup.length !== backupArr.length) {
      persistArrayToFile(backupPath, newBackup);
      removed = true;
    }
  } catch (err) {
    console.error('[LocalStorage] removeUserFromLocal failed:', err);
  }
  return removed;
}
