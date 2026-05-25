import { NextResponse } from 'next/server';

const AUTH_TOKEN_ENDPOINT = process.env.AUTH_TOKEN_ENDPOINT;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const GRANT_TYPE = process.env.GRANT_TYPE;

export const revalidate = 0;

export async function GET() {
  return new NextResponse(
    'This endpoint only accepts POST requests. Use fetch("/api/token", { method: "POST" }) instead.',
    { status: 405, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}

export async function POST() {
  if (!AUTH_TOKEN_ENDPOINT) {
    return new NextResponse('AUTH_TOKEN_ENDPOINT is not defined', { status: 500 });
  }
  if (!CLIENT_ID || !CLIENT_SECRET || !GRANT_TYPE) {
    return new NextResponse('CLIENT_ID, CLIENT_SECRET, or GRANT_TYPE is not defined', { status: 500 });
  }

  try {
    // console.log('Requesting token from endpoint:', AUTH_TOKEN_ENDPOINT);
    // console.log('Using client_id:', CLIENT_ID);
    // console.log('Using client_secret:', CLIENT_SECRET); // Do not log the actual secret
    // console.log('Using grant_type:', GRANT_TYPE);
    const res = await fetch(AUTH_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: GRANT_TYPE,
      }),
    });

    // console.log('Token endpoint response text:', res.text ? await res.text() : 'No response text');

    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(text, { status: res.status });
    }

    const raw = await res.json();
    console.log('Received token response:', raw);

    const { server_url, participant_token, nick_name, room_name, identity } = raw.data ?? {};

    const data = {
      serverUrl: server_url,
      participantToken: participant_token,
      identity: identity,
      nickName: nick_name,
      roomName: room_name,
    };

    const headers = new Headers({ 'Cache-Control': 'no-store' });
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Unknown error',
      { status: 500 },
    );
  }
}
