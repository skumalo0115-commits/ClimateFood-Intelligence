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
import { motion } from 'framer-motion';
import { AirQualityPoint, ClimatePoint, Co2Point, CropPoint, PredictionPoint } from '@/lib/types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface Props {
  climate: ClimatePoint[];
  airQuality: AirQualityPoint[];
  crops: CropPoint[];
  co2: Co2Point[];
  predictions: PredictionPoint[];
}

export const chartOptions = {
  responsive: true,
  plugins: { legend: { labels: { color: '#0f172a' } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,0.3)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(148,163,184,0.3)' } }
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
            { label: 'Temperature C', data: climate.map((d) => d.temperature), borderColor: '#22c55e' },
            { label: 'Precipitation mm', data: climate.map((d) => d.precipitation), borderColor: '#38bdf8' }
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
          datasets: [{ label: 'Production', data: crops.map((d) => d.value), borderColor: '#6366f1' }]
        }}
      />
      <ChartCard
        title="CO2 Emissions (per capita)"
        data={{
          labels: co2Germany.map((d) => d.year),
          datasets: [{ label: 'Germany CO2 / capita', data: co2Germany.map((d) => d.co_emissions_per_capita), borderColor: '#0ea5e9' }]
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

export function ChartCard({ title, data, className = '' }: { title: string; data: any; className?: string }) {
  const hasData = Array.isArray(data?.labels) && data.labels.length > 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className={`rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${className}`}
    >
      <h3 className="mb-4 text-lg font-semibold text-slate-900">{title}</h3>
      {hasData ? (
        <Line data={data} options={chartOptions} />
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
          Data temporarily unavailable.
        </div>
      )}
    </motion.div>
  );
}
