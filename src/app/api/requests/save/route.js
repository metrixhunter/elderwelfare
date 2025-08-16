import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'requests.json');

async function readRequests() {
  try {
    const data = await fs.readFile(REQUESTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeRequests(requests) {
  await fs.mkdir(path.dirname(REQUESTS_FILE), { recursive: true });
  await fs.writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

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
