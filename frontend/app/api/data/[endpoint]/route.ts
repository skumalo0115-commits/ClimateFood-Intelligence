import { NextRequest, NextResponse } from 'next/server';
import { resolveBackendUrl } from '@/lib/backend';

const allowedEndpoints = new Set(['climate', 'air-quality', 'crops', 'co2', 'predict']);

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=900'
};

function fallbackData(endpoint: string) {
  const today = new Date();

  if (endpoint === 'climate') {
    return Array.from({ length: 12 }, (_, i) => ({
      date: new Date(today.getTime() - (11 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      temperature: 18 + (i % 5) * 1.3,
      precipitation: (i % 4) * 1.6
    }));
  }

  if (endpoint === 'air-quality') {
    return Array.from({ length: 12 }, (_, i) => ({
      date: new Date(today.getTime() - (11 - i) * 60 * 60 * 1000).toISOString(),
      pm10: 20 + (i % 6) * 1.4,
      pm2_5: 10 + (i % 4) * 0.9
    }));
  }

  if (endpoint === 'crops') {
    return [
      { year: 2021, item: 'Maize yield (kg/ha)', value: 2400 },
      { year: 2022, item: 'Maize yield (kg/ha)', value: 2600 },
      { year: 2023, item: 'Maize yield (kg/ha)', value: 2550 },
      { year: 2024, item: 'Maize yield (kg/ha)', value: 2700 }
    ];
  }

  if (endpoint === 'co2') {
    return [
      { country: 'South Africa', year: 2021, co_emissions_per_capita: 7.2 },
      { country: 'Kenya', year: 2021, co_emissions_per_capita: 0.4 },
      { country: 'India', year: 2021, co_emissions_per_capita: 1.9 },
      { country: 'Germany', year: 2021, co_emissions_per_capita: 8.1 }
    ];
  }

  if (endpoint === 'predict') {
    return [
      { scenario: 1, predicted_yield: 2.9 },
      { scenario: 2, predicted_yield: 2.4 },
      { scenario: 3, predicted_yield: 3.5 }
    ];
  }

  return [];
}

export async function GET(_: NextRequest, { params }: { params: { endpoint: string } }) {
  const endpoint = params.endpoint;

  if (!allowedEndpoints.has(endpoint)) {
    return NextResponse.json({ error: 'Unsupported endpoint' }, { status: 404, headers: CACHE_HEADERS });
  }

  const backendUrl = resolveBackendUrl();

  try {
    const response = await fetch(`${backendUrl}/api/${endpoint}`, {
      next: { revalidate: 300 }
    });

    const body = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        {
          data: fallbackData(endpoint),
          warning: `Backend request failed (${response.status}). Showing fallback data.`,
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
        data: fallbackData(endpoint),
        warning: 'Backend unreachable. Showing fallback data.',
        backendUrl,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { headers: CACHE_HEADERS }
    );
  }
}
