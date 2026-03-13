import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendUrl } from '@/lib/backend';

const CACHE_HEADERS = {
  'Cache-Control': 'no-store'
};

export async function GET() {
  const backendUrl = resolveBackendUrl();

  try {
    const response = await fetch(`${backendUrl}/api/config`, { cache: 'no-store' });
    const body = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to load config', details: body }, { status: response.status, headers: CACHE_HEADERS });
    }
    return NextResponse.json(body, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend unreachable', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502, headers: CACHE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  const backendUrl = resolveBackendUrl();
  const payload = await request.json();

  try {
    const response = await fetch(`${backendUrl}/api/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    const body = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to update config', details: body }, { status: response.status, headers: CACHE_HEADERS });
    }
    return NextResponse.json(body, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: 'Backend unreachable', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502, headers: CACHE_HEADERS }
    );
  }
}
