import { promises as fs } from 'fs';
import path from 'path';

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'requests.json');

// Read requests.json (auto-create if missing or invalid)
async function readRequests() {
  try {
    const data = await fs.readFile(REQUESTS_FILE, 'utf-8');

    // If file is empty, reset it
    if (!data.trim()) {
      await fs.writeFile(REQUESTS_FILE, JSON.stringify([], null, 2));
      return [];
    }

    return JSON.parse(data);
  } catch {
    // If file doesn’t exist, create empty array
    await fs.mkdir(path.dirname(REQUESTS_FILE), { recursive: true });
    await fs.writeFile(REQUESTS_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

// GET → load all requests
export async function GET() {
  try {
    const requests = await readRequests();

    return new Response(
      JSON.stringify({ success: true, count: requests.length, requests }),
      { status: 200 }
    );
  } catch (err) {
    console.error('[Requests Loader Error]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to load requests' }),
      { status: 500 }
    );
  }
}
