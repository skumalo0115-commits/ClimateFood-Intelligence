import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendUrl } from '@/lib/backend';

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=900'
};

const FALLBACK_LOCATIONS = [];

export async function GET(request: NextRequest) {
  const backendUrl = resolveBackendUrl();
  const query = request.nextUrl.searchParams.toString();
  const backendEndpoint = `${backendUrl}/api/locations${query ? `?${query}` : ''}`;

  try {
    const response = await fetch(backendEndpoint, {
      next: { revalidate: 300 }
    });

    const body = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        {
          data: FALLBACK_LOCATIONS,
          warning: `Backend request failed (${response.status}). Showing fallback locations.`,
          backendUrl,
          details: body
        },
        { headers: CACHE_HEADERS }
      );
    }

    return NextResponse.json(body, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        data: FALLBACK_LOCATIONS,
        warning: 'Backend unreachable. Showing fallback locations.',
        backendUrl,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { headers: CACHE_HEADERS }
    );
  }
}
