'use client';

import L from 'leaflet';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, useInView } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';
import { LocationOption, recommendedLocations } from '@/lib/locationData';

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

export default function MapPanel() {
  const { config } = useRuntimeConfig();
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState('');
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.35 });

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

    setLocationsLoading(true);
    setLocationsError('');
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
        setLocationsError('Unable to load location recommendations. Showing fallback list.');
        setLocations(locationsFallback);
        setSelectedLocation('');
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLocationsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [config?.country, locationsFallback]);

  const defaultLocation = useMemo(
    () => ({
      label: config?.country ? `Focus area: ${config.country}` : 'Focus area: South Africa',
      lat: config?.lat ?? -26.2041,
      lon: config?.lon ?? 28.0473,
      note: 'Configured focus coordinates.'
    }),
    [config?.country, config?.lat, config?.lon]
  );

  const activeLocation = useMemo(() => {
    if (locations.length === 0) {
      return defaultLocation;
    }
    if (!selectedLocation) {
      return locations[0];
    }
    return locations.find((loc) => loc.label === selectedLocation) ?? locations[0];
  }, [selectedLocation, locations, defaultLocation]);

  const points = locations.length
    ? locations.map((loc) => ({ lat: loc.lat, lng: loc.lon, label: `${loc.label} — ${loc.note}` }))
    : [{ lat: activeLocation.lat, lng: activeLocation.lon, label: activeLocation.label }];

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
      <div className="px-6 pt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">Recommended harvest locations</p>
            <p className="text-sm text-slate-500">Select a location to see the map and climate focus update.</p>
          </div>
          {locationsLoading ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Loading locations...
            </div>
          ) : locations.length > 0 ? (
            <select
              value={activeLocation.label}
              onChange={(event) => setSelectedLocation(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm"
            >
              {locations.map((loc) => (
                <option key={loc.label} value={loc.label}>
                  {loc.label}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
              No verified location recommendations for this country yet.
            </div>
          )}
          {locationsError ? <p className="text-xs text-rose-600">{locationsError}</p> : null}
        </div>
      </div>
      <MapContainer
        center={[activeLocation.lat, activeLocation.lon]}
        zoom={5}
        scrollWheelZoom={false}
        touchZoom={false}
        className="map-touch-scroll"
        style={{ height: '420px', width: '100%' }}
      >
        <MobileDoubleTapGesture />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => (
          <CircleMarker center={[p.lat, p.lng]} radius={9} pathOptions={{ color: '#10b981', fillColor: '#10b981' }} key={p.label}>
            <Popup>{p.label}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
