'use client';

import L from 'leaflet';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import CountryBadge from '@/components/CountryBadge';
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

export default function MapPanel({ config }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.35 });

  const lat = config?.lat ?? -26.2041;
  const lon = config?.lon ?? 28.0473;
  const label = config?.country ? `Focus area: ${config.country}` : 'Focus area: South Africa';

  const points = [{ lat, lng: lon, label }];

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
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-slate-900">Live Focus Map</h3>
            <CountryBadge country={config.country ?? 'South Africa'} />
          </div>
          <p className="mt-1 text-sm text-slate-600">The map pin marks the active country focus used for climate and air quality lookups.</p>
        </div>
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
            <Popup>{p.label}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
