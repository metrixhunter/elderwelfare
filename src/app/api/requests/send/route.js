// File: src/app/api/requests/route.js
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  const body = await req.json();
  const { fromUsername, toUsername, requestHelp } = body;

  if (!fromUsername || !toUsername || !requestHelp) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    const filePath = path.join(process.cwd(), 'helpRequests.json');

    let existingRequests = [];
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      existingRequests = JSON.parse(data || '[]');
    }

    const newRequest = {
      id: Date.now(), // unique ID
      fromUsername,
      toUsername,
      requestHelp,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    existingRequests.push(newRequest);

    fs.writeFileSync(filePath, JSON.stringify(existingRequests, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true, savedTo: filePath, request: newRequest }), { status: 201 });
  } catch (error) {
    console.error('Error saving request:', error);
    return new Response(JSON.stringify({ error: 'Failed to save request to file', details: error.message }), { status: 500 });
  }
}
