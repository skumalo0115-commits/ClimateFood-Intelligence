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
import { AirQualityPoint, ClimatePoint, Co2Point, CropPoint, PredictionPoint } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  climate: ClimatePoint[];
  airQuality: AirQualityPoint[];
  crops: CropPoint[];
  co2: Co2Point[];
  predictions: PredictionPoint[];
}

const chartOptions = {
  responsive: true,
  plugins: { legend: { labels: { color: '#fff' } } },
  scales: {
    x: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(148,163,184,0.2)' } },
    y: { ticks: { color: '#cbd5e1' }, grid: { color: 'rgba(148,163,184,0.2)' } }
  }
};

export default function ChartsPanel({ climate, airQuality, crops, co2, predictions }: Props) {
  const co2Germany = co2.filter((point) => point.country === 'Germany');

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
      <ChartCard
        title="CO₂ Emissions (per capita)"
        data={{
          labels: co2Germany.map((d) => d.year),
          datasets: [{ label: 'Germany CO₂ / capita', data: co2Germany.map((d) => d.co_emissions_per_capita), borderColor: '#14b8a6' }]
        }}
      />
      <ChartCard
        title="AI Yield Predictions"
        data={{
          labels: predictions.map((d) => `Scenario ${d.scenario}`),
          datasets: [{ label: 'Predicted yield', data: predictions.map((d) => d.predicted_yield), borderColor: '#f59e0b' }]
        }}
        className="lg:col-span-2"
      />
    </div>
  );
}

function ChartCard({ title, data, className = '' }: { title: string; data: any; className?: string }) {
  const hasData = Array.isArray(data?.labels) && data.labels.length > 0;

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl ${className}`}>
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      {hasData ? (
        <Line data={data} options={chartOptions} />
      ) : (
        <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">Data temporarily unavailable.</div>
      )}
    </div>
  );
}
