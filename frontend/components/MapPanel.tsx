'use client';

import L from 'leaflet';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, useInView } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import { getCountryPreset, getSupportedCountryPresets } from '@/lib/countryPresets';
import { useDashboardData } from '@/lib/useDashboardData';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';
import type { RuntimeConfig } from '@/lib/runtimeConfigShared';

interface Props {
  config: RuntimeConfig;
}

function MobileDoubleTapGesture() {
  const map = useMap();

  useEffect(() => {
    if (typeof window === 'undefined' || !L.Browser.mobile) return;
    const container = map.getContainer();
    let lastTap = 0;
    let disableTimer: number | null = null;
    let unlocked = false;

    const disableGestures = () => {
      unlocked = false;
      map.dragging.disable();
      map.touchZoom.disable();
    };

    const enableGestures = () => {
      unlocked = true;
      map.dragging.enable();
      map.touchZoom.enable();
    };

    disableGestures();

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) return;
      const now = Date.now();
      if (now - lastTap < 300) {
        if (unlocked) {
          disableGestures();
        } else {
          enableGestures();
        }
      }
      lastTap = now;
    };

    const onTouchEnd = () => {
      if (!unlocked) return;
      if (disableTimer) window.clearTimeout(disableTimer);
      disableTimer = window.setTimeout(() => {
        disableGestures();
      }, 5000);
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      if (disableTimer) window.clearTimeout(disableTimer);
      map.dragging.enable();
      map.touchZoom.enable();
    };
  }, [map]);

  return null;
}

function getRecommendedCrop(country: string, climate: { temperature: number; precipitation: number }[], crops: { value: number }[]) {
  const recentClimate = climate.slice(-10);
  const avgTemp = recentClimate.length
    ? recentClimate.reduce((sum, item) => sum + item.temperature, 0) / recentClimate.length
    : 22;
  const avgRain = recentClimate.length
    ? recentClimate.reduce((sum, item) => sum + item.precipitation, 0) / recentClimate.length
    : 500;

  const recentYield = crops.slice(-5);
  const yieldAvg = recentYield.length
    ? recentYield.reduce((sum, item) => sum + item.value, 0) / recentYield.length
    : 0;

  if (country.toLowerCase().includes('india') || (avgTemp > 27 && avgRain > 700)) return { crop: 'Rice', reason: 'Warm temperatures and strong rainfall support paddy crop cycles.' };
  if (country.toLowerCase().includes('germany') || (avgTemp > 18 && avgRain > 500)) return { crop: 'Wheat', reason: 'Temperate conditions and moderate rainfall suit wheat well.' };
  if (country.toLowerCase().includes('brazil') || (avgTemp > 24 && avgRain > 600)) return { crop: 'Maize', reason: 'A warm, humid pattern is favourable for maize growth.' };
  if (avgTemp > 22 && avgRain > 350) return { crop: 'Maize', reason: 'The recent climate pattern suggests strong maize suitability.' };
  if (yieldAvg > 2000) return { crop: 'Sorghum', reason: 'The current yield profile is strong enough to justify resilient cereal rotation.' };
  return { crop: 'Cabbage', reason: 'This area is more stable for a shorter-cycle, high-water-output crop.' };
}

export default function MapPanel({ config }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const { updateConfig } = useRuntimeConfig();
  const { climate, crops } = useDashboardData();

  const lat = config?.lat ?? -26.2041;
  const lon = config?.lon ?? 28.0473;
  const countryOptions = useMemo(() => getSupportedCountryPresets(), []);
  const selectedCountry = config?.country ?? 'South Africa';
  const recommendation = useMemo(
    () => getRecommendedCrop(selectedCountry, climate, crops),
    [climate, crops, selectedCountry]
  );

  const handleCountryChange = async (countryName: string) => {
    const preset = getCountryPreset(countryName, config);
    if (!preset) return;
    const nextCountries = Array.from(new Set([...(config.co2_countries ?? []), preset.country].filter(Boolean)));
    await updateConfig({
      country: preset.country,
      country_code: preset.country_code,
      lat: preset.lat,
      lon: preset.lon,
      aq_radius: preset.aq_radius,
      crops_country: preset.crops_country,
      co2_countries: nextCountries
    });
  };

  const points = [{ lat, lng: lon, label: `Focus area: ${selectedCountry}` }];

  return (
    <div
      ref={ref}
      className="relative z-0 isolation-isolate mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
    >
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="pointer-events-none absolute left-6 right-6 top-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400"
      />
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4 px-6 pb-0 pt-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Live Focus Map</h3>
          <p className="mt-1 text-sm text-slate-600">Pinpoint the exact area and review the best crop match before planting.</p>
        </div>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Pinpointed location
          <select
            value={selectedCountry}
            onChange={(event) => handleCountryChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-800"
          >
            {countryOptions.map((country) => (
              <option key={country.country} value={country.country}>
                {country.country}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Good crop to plant</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{recommendation.crop}</p>
        </div>
        <p className="max-w-md text-sm text-slate-600">{recommendation.reason}</p>
      </div>

      <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full border border-slate-200 bg-white/90 p-2 shadow-sm">
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="12.5" fill="none" stroke="#0f172a" strokeOpacity="0.2" />
          <path d="M14 5L17 14L14 23L11 14L14 5Z" fill="#10b981" />
          <path d="M14 5L17 14H14V5Z" fill="#0f172a" />
          <text x="14" y="7.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="#0f172a">
            N
          </text>
        </svg>
      </div>
      <MapContainer
        center={[lat, lon]}
        zoom={5}
        scrollWheelZoom={false}
        touchZoom={false}
        className="map-touch-scroll"
        style={{ height: '420px', width: '100%' }}
      >
        <MobileDoubleTapGesture />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => (
          <CircleMarker center={[p.lat, p.lng]} radius={10} pathOptions={{ color: '#10b981', fillColor: '#10b981' }} key={p.label}>
            <Popup>{`${p.label} • Best crop: ${recommendation.crop}`}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
