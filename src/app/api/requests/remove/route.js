
import { promises as fs } from 'fs';
import path from 'path';

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

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    let requests = await readRequests();
    requests = requests.filter(r => r.id !== id);
    await writeRequests(requests);
    return new Response('Request deleted', { status: 200 });
  } catch (err) {
    console.error('[Remove Request Error]', err);
    return new Response('Failed to delete request', { status: 500 });
  }
}
