import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'requests.json');

// Read requests.json (create if missing)
async function readRequests() {
  try {
    const data = await fs.readFile(REQUESTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // If file doesn’t exist, create an empty array file
    await fs.mkdir(path.dirname(REQUESTS_FILE), { recursive: true });
    await fs.writeFile(REQUESTS_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

// Write to requests.json
async function writeRequests(requests) {
  await fs.mkdir(path.dirname(REQUESTS_FILE), { recursive: true });
  await fs.writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

// POST → add a new request
export async function POST(req) {
  try {
    const body = await req.json();
    const requests = await readRequests();

    const newRequest = { id: uuidv4(), ...body };
    requests.push(newRequest);

    await writeRequests(requests);

    return new Response(JSON.stringify(newRequest), { status: 200 });
  } catch (err) {
    console.error('[Save Request Error]', err);
    return new Response('Failed to save request', { status: 500 });
  }
}

// GET → fetch all requests
export async function GET() {
  try {
    const requests = await readRequests();
    return new Response(JSON.stringify({ success: true, count: requests.length, requests }), { status: 200 });
  } catch (err) {
    console.error('[Load Request Error]', err);
    return new Response(JSON.stringify({ success: false, error: 'Failed to load requests' }), { status: 500 });
  }
}
