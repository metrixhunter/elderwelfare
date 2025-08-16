import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'requests.json');

async function readRequests() {
  if (process.env.NODE_ENV !== 'development') {
    // In production → just return []
    return [];
  }

  try {
    const data = await fs.readFile(REQUESTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    await fs.mkdir(path.dirname(REQUESTS_FILE), { recursive: true });
    await fs.writeFile(REQUESTS_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

async function writeRequests(requests) {
  if (process.env.NODE_ENV !== 'development') {
    // In production → skip writing to disk
    return;
  }
  await fs.mkdir(path.dirname(REQUESTS_FILE), { recursive: true });
  await fs.writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

export async function POST(req) {
  try {
    const body = await req.json();
    const newRequest = { id: uuidv4(), ...body };

    if (process.env.NODE_ENV === 'development') {
      // Local: write to file
      const requests = await readRequests();
      requests.push(newRequest);
      await writeRequests(requests);
    }

    return new Response(JSON.stringify(newRequest), { status: 200 });
  } catch (err) {
    console.error('[Save Request Error]', err);
    return new Response('Failed to save request', { status: 500 });
  }
}

export async function GET() {
  try {
    if (process.env.NODE_ENV === 'development') {
      const requests = await readRequests();
      return new Response(
        JSON.stringify({ success: true, count: requests.length, requests }),
        { status: 200 }
      );
    } else {
      // Prod: no-op / empty
      return new Response(
        JSON.stringify({ success: true, requests: [] }),
        { status: 200 }
      );
    }
  } catch (err) {
    console.error('[Load Request Error]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to load requests' }),
      { status: 500 }
    );
  }
}
