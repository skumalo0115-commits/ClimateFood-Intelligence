'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AirQualityPoint, ClimatePoint, CropPoint } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  climate: ClimatePoint[];
  airQuality: AirQualityPoint[];
  crops: CropPoint[];
}

export default function ChartsPanel({ climate, airQuality, crops }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard
        title="Temperature & Precipitation"
        data={{
          labels: climate.map((d) => d.date),
          datasets: [
            { label: 'Temperature °C', data: climate.map((d) => d.temperature), borderColor: '#22c55e' },
            { label: 'Precipitation mm', data: climate.map((d) => d.precipitation), borderColor: '#3b82f6' }
          ]
        }}
      />
      <ChartCard
        title="Air Quality (PM10 / PM2.5)"
        data={{
          labels: airQuality.map((d) => d.date),
          datasets: [
            { label: 'PM10', data: airQuality.map((d) => d.pm10), borderColor: '#f97316' },
            { label: 'PM2.5', data: airQuality.map((d) => d.pm2_5), borderColor: '#e11d48' }
          ]
        }}
      />
      <ChartCard
        title="Crop Production Trends"
        data={{
          labels: crops.map((d) => d.year),
          datasets: [{ label: 'Production', data: crops.map((d) => d.value), borderColor: '#a855f7' }]
        }}
      />
    </div>
  );
}

function ChartCard({ title, data }: { title: string; data: any }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <Line data={data} options={{ responsive: true, plugins: { legend: { labels: { color: '#fff' } } } }} />
    </div>
  );
}
