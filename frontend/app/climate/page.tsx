'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';
import { ChartCard } from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import { useDashboardData } from '@/lib/useDashboardData';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';
import { LocationOption, recommendedLocations } from '@/lib/locationData';

export default function ClimatePage() {
  const { climate, loading, error } = useDashboardData();
  const { config } = useRuntimeConfig();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const defaultLocation = useMemo(
    () => ({
      label: `${config?.country ?? 'Focus'} location`,
      lat: config?.lat ?? -26.2041,
      lon: config?.lon ?? 28.0473,
      note: 'Configured focus coordinates.'
    }),
    [config?.country, config?.lat, config?.lon]
  );

  const locationsFallback = useMemo(() => {
    if (!config?.country) return [];
    return recommendedLocations[config.country] ?? [];
  }, [config?.country]);

  useEffect(() => {
    if (!config?.country) {
      setLocations([]);
      setSelectedLocation('');
      return;
    }

    setLocationLoading(true);
    setLocationError('');
    const controller = new AbortController();

    fetch(`/api/locations?country=${encodeURIComponent(config.country)}`, {
      cache: 'no-store',
      signal: controller.signal
    })
      .then(async (response) => {
        const payload = await response.json();
        const backendLocations = Array.isArray(payload?.data) ? payload.data : [];
        if (backendLocations.length > 0) {
          setLocations(backendLocations);
        } else {
          setLocations(locationsFallback);
        }
        setSelectedLocation('');
      })
      .catch(() => {
        setLocationError('Unable to load location recommendations. Showing fallback list.');
        setLocations(locationsFallback);
        setSelectedLocation('');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLocationLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [config?.country, locationsFallback]);

  const activeLocation = useMemo(() => {
    if (locations.length === 0) return defaultLocation;
    if (!selectedLocation) return locations[0];
    return locations.find((loc) => loc.label === selectedLocation) ?? locations[0];
  }, [selectedLocation, locations, defaultLocation]);

  const [climateData, setClimateData] = useState(climate);
  const [climateLoading, setClimateLoading] = useState(false);
  const [climateError, setClimateError] = useState('');

  useEffect(() => {
    if (climate.length > 0 && !climateLoading && !climateError) {
      setClimateData(climate);
    }
  }, [climate, climateLoading, climateError]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const fetchClimate = async () => {
      setClimateLoading(true);
      setClimateError('');
      try {
        const response = await fetch(
          `/api/data/climate?lat=${encodeURIComponent(activeLocation.lat)}&lon=${encodeURIComponent(activeLocation.lon)}`,
          { cache: 'no-store', signal: controller.signal }
        );
        const payload = await response.json();
        if (!response.ok || !Array.isArray(payload?.data)) {
          throw new Error(payload?.error || 'Unable to load climate data.');
        }
        if (active) {
          setClimateData(payload.data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setClimateError('Unable to load location-specific climate data right now.');
        }
      } finally {
        if (active) {
          setClimateLoading(false);
        }
      }
    };

    fetchClimate();
    return () => {
      active = false;
      controller.abort();
    };
  }, [activeLocation.lat, activeLocation.lon]);

  const data = {
    labels: climateData.map((d) => d.date),
    datasets: [
      { label: 'Temperature C', data: climateData.map((d) => d.temperature), borderColor: '#22c55e' },
      { label: 'Precipitation mm', data: climateData.map((d) => d.precipitation), borderColor: '#38bdf8' }
    ]
  };

  const backgroundImage =
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/60" />
      <div className="relative z-10">
        <Navbar />
        <section className="section-container">
          <PageHeader
            eyebrow="Climate"
            title="Temperature and precipitation intelligence"
            subtitle="Detect season shifts, surface anomalies, and precipitation patterns with a clean, motion-driven view."
            tone="light"
          />
          <DataStatus loading={loading || climateLoading} error={error || climateError} />
          <div className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:grid-cols-[1fr_320px]">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">Select a location for exact climate context</p>
              <p className="text-sm text-slate-500">
                Pick a verified location within the selected country and see the climate dashboard respond with that coordinate.
              </p>
              {locationLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Loading locations...</div>
              ) : locations.length > 0 ? (
                <select
                  value={activeLocation?.label ?? ''}
                  onChange={(event) => setSelectedLocation(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm"
                >
                  {locations.map((loc) => (
                    <option key={loc.label} value={loc.label}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  Verified data is not available for this country yet.
                </div>
              )}
              {locationError ? <p className="text-xs text-rose-600">{locationError}</p> : null}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Location details</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">{activeLocation?.label ?? `${config?.country ?? 'Selected country'} focus`}</p>
              <p className="mt-2 text-sm text-slate-600">{activeLocation?.note ?? 'Using the configured focus coordinates for this country.'}</p>
              {activeLocation ? (
                <div className="mt-4 grid gap-2 text-sm text-slate-700">
                  <div>Latitude: {activeLocation.lat.toFixed(4)}</div>
                  <div>Longitude: {activeLocation.lon.toFixed(4)}</div>
                </div>
              ) : null}
            </div>
          </div>
          <SectionReveal from="left">
            <div className="mt-10">
              <ChartCard
                title="Temperature & precipitation"
                chartKind="line"
                insight="The temperature and rainfall lines show the most recent 30 days for the focus coordinates. When the temperature line rises while precipitation drops, it signals drying conditions and crop stress risk."
                autoInsight
                data={data}
              />
            </div>
          </SectionReveal>
        </section>
      </div>
    </main>
  );
}
