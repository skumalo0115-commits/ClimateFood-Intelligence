import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendUrl } from '@/lib/backend';

const allowedEndpoints = new Set(['climate', 'air-quality', 'crops', 'co2', 'predict']);

const CACHE_HEADERS = {
  'Cache-Control': 'no-store'
};

export async function GET(_: NextRequest, { params }: { params: { endpoint: string } }) {
  const endpoint = params.endpoint;

  if (!allowedEndpoints.has(endpoint)) {
    return NextResponse.json({ error: 'Unsupported endpoint' }, { status: 404, headers: CACHE_HEADERS });
  }

  const backendUrl = resolveBackendUrl();

  try {
    const response = await fetch(`${backendUrl}/api/${endpoint}`, {
      cache: 'no-store'
    });

    const body = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Backend request failed (${response.status}).`,
          backendUrl,
          details: body
        },
        { status: response.status, headers: CACHE_HEADERS }
      );
    }

    return NextResponse.json(body, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Backend unreachable.',
        backendUrl,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 502, headers: CACHE_HEADERS }
    );
  }
}
