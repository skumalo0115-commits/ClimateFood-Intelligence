'use client';

import L from 'leaflet';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';

function MobileTwoFingerGesture() {
  const map = useMap();

  useEffect(() => {
    if (typeof window === 'undefined' || !L.Browser.mobile) return;
    const container = map.getContainer();

    map.dragging.disable();
    map.touchZoom.disable();

    const enableGestures = (event: TouchEvent) => {
      if (event.touches.length >= 2) {
        map.dragging.enable();
        map.touchZoom.enable();
      }
    };

    const disableGestures = (event: TouchEvent) => {
      if (event.touches.length < 2) {
        map.dragging.disable();
        map.touchZoom.disable();
      }
    };

    container.addEventListener('touchstart', enableGestures, { passive: true });
    container.addEventListener('touchend', disableGestures);
    container.addEventListener('touchcancel', disableGestures);

    return () => {
      container.removeEventListener('touchstart', enableGestures);
      container.removeEventListener('touchend', disableGestures);
      container.removeEventListener('touchcancel', disableGestures);
      map.dragging.enable();
      map.touchZoom.enable();
    };
  }, [map]);

  return null;
}

export default function MapPanel() {
  const { config } = useRuntimeConfig();
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
      <MapContainer
        center={[lat, lon]}
        zoom={5}
        scrollWheelZoom={false}
        touchZoom={false}
        className="map-touch-scroll"
        style={{ height: '420px', width: '100%' }}
      >
        <MobileTwoFingerGesture />
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
