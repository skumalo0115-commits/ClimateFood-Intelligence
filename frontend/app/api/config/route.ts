import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendUrl } from '@/lib/backend';

const CACHE_HEADERS = {
  'Cache-Control': 'no-store'
};

const FALLBACK_CONFIG = {
  country: 'South Africa',
  country_code: 'ZAF',
  lat: -26.2041,
  lon: 28.0473,
  aq_radius: 15000,
  crops_indicator: 'AG.YLD.MAIZ.KG',
  crops_country: 'ZAF',
  co2_countries: ['South Africa', 'Kenya', 'India', 'Germany']
};

export async function GET() {
  const backendUrl = resolveBackendUrl();

  try {
    const response = await fetch(`${backendUrl}/api/config`, { cache: 'no-store' });
    const body = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        {
          data: FALLBACK_CONFIG,
          warning: 'Backend config unavailable. Using defaults.',
          details: body
        },
        { headers: CACHE_HEADERS }
      );
    }
    return NextResponse.json(body, { headers: CACHE_HEADERS });
  } catch (error) {
    return NextResponse.json(
      {
        data: FALLBACK_CONFIG,
        warning: 'Backend unreachable. Using defaults.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { headers: CACHE_HEADERS }
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
