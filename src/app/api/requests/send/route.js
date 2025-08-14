// File: src/app/api/requests/route.js
let inMemoryRequests = []; // stored in memory

export async function POST(req) {
  const body = await req.json();
  const { fromUsername, toUsername, requestHelp } = body;

  if (!fromUsername || !toUsername || !requestHelp) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  try {
    const newRequest = {
      id: Date.now(),
      fromUsername,
      toUsername,
      requestHelp,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    inMemoryRequests.push(newRequest);

    return new Response(JSON.stringify({ success: true, savedTo: 'memory', request: newRequest }), { status: 201 });
  } catch (error) {
    console.error('Error saving request:', error);
    return new Response(JSON.stringify({ error: 'Failed to save request', details: error.message }), { status: 500 });
  }
}
