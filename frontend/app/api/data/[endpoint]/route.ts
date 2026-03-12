import { NextRequest, NextResponse } from 'next/server';

const allowedEndpoints = new Set(['climate', 'air-quality', 'crops', 'co2', 'predict']);

function resolveBackendUrl() {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.BACKEND_URL ??
    'https://climatefood-backend.up.railway.app';

  return `${raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`}`
    .replace(/\/$/, '')
    .replace(/\/api$/, '');
}

export async function GET(_: NextRequest, { params }: { params: { endpoint: string } }) {
  const endpoint = params.endpoint;

  if (!allowedEndpoints.has(endpoint)) {
    return NextResponse.json({ error: 'Unsupported endpoint' }, { status: 404 });
  }

  const backendUrl = resolveBackendUrl();

  try {
    const response = await fetch(`${backendUrl}/api/${endpoint}`, {
      cache: 'no-store'
    });

    const body = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend request failed (${response.status})`, backendUrl, details: body },
        { status: response.status }
      );
    }

    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Unable to reach backend service',
        backendUrl,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 502 }
    );
  }
}
