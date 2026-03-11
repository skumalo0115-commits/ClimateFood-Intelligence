'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const points = [
  { lat: -1.2921, lng: 36.8219, label: 'Nairobi Crop Region' },
  { lat: 52.52, lng: 13.41, label: 'Berlin Climate Station' }
];

export default function MapPanel() {
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-slate-800">
      <MapContainer center={[10, 20]} zoom={2} style={{ height: '420px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => (
          <Marker position={[p.lat, p.lng]} key={p.label}>
            <Popup>{p.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
