'use client';

import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const points = [
  { lat: -1.2921, lng: 36.8219, label: 'Nairobi Crop Region' },
  { lat: 52.52, lng: 13.41, label: 'Berlin Climate Station' }
];

export default function MapPanel() {
  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <MapContainer center={[10, 20]} zoom={2} scrollWheelZoom={false} touchZoom={false} style={{ height: '420px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => (
          <CircleMarker center={[p.lat, p.lng]} radius={8} pathOptions={{ color: '#10b981', fillColor: '#10b981' }} key={p.label}>
            <Popup>{p.label}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
