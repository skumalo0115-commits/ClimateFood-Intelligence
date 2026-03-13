'use client';

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { AirQualityPoint, ClimatePoint, Co2Point, CropPoint, PredictionPoint } from '@/lib/types';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

interface Props {
  climate: ClimatePoint[];
  airQuality: AirQualityPoint[];
  crops: CropPoint[];
  co2: Co2Point[];
  predictions: PredictionPoint[];
}

type ChartKind = 'line' | 'bar' | 'area';

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  elements: { line: { tension: 0.35 }, point: { radius: 2 } },
  plugins: {
    legend: { labels: { color: '#0f172a' } },
    tooltip: { titleColor: '#ffffff', bodyColor: '#86efac' }
  },
  scales: {
    x: {
      ticks: { color: '#1f2937' },
      grid: { color: 'rgba(15,23,42,0.25)' },
      border: { color: '#1f2937' }
    },
    y: {
      ticks: { color: '#1f2937' },
      grid: { color: 'rgba(15,23,42,0.25)' },
      border: { color: '#1f2937' }
    }
  }
};

function hexToRgba(color: string, alpha: number) {
  if (color.startsWith('rgba(')) {
    return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }

  const hex = color.replace('#', '');
  if (hex.length !== 6) return color;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function ChartsPanel({ climate, airQuality, crops, co2, predictions }: Props) {
  const { config } = useRuntimeConfig();
  const primaryCountry = config?.country ?? 'South Africa';
  const co2Primary = co2.filter((point) => point.country === primaryCountry);
  const co2Series = co2Primary.length ? co2Primary : co2;

  return (
    <div className="grid auto-rows-fr items-stretch gap-6 lg:grid-cols-2">
      <ChartCard
        title="Temperature & precipitation"
        chartKind="line"
        insight="The two lines track the last 30 days of temperature and rainfall at the focus coordinates. Watch for rising temperature with falling precipitation to spot drought pressure and timing shifts."
        revealOnMount
        delay={0.05}
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
        chartKind="line"
        insight="PM10 reflects coarse dust while PM2.5 captures finer particles that penetrate deeper into lungs. Diverging lines mean changing pollution sources or wind conditions."
        revealOnMount
        delay={0.18}
        data={{
          labels: airQuality.map((d) => d.date),
          datasets: [
            { label: 'PM10', data: airQuality.map((d) => d.pm10), borderColor: '#f97316' },
            { label: 'PM2.5', data: airQuality.map((d) => d.pm2_5), borderColor: '#e11d48' }
          ]
        }}
      />
      <ChartCard
        title="Maize Yield Trends"
        chartKind="bar"
        insight="Bars show maize yield per hectare across the available years. A steady climb suggests productivity gains, while sharp dips often line up with climate stress or input constraints."
        data={{
          labels: crops.map((d) => d.year),
          datasets: [{ label: 'Yield (kg/ha)', data: crops.map((d) => d.value), borderColor: '#6366f1' }]
        }}
      />
      <ChartCard
        title={`CO2 Emissions (per capita) - ${primaryCountry}`}
        chartKind="area"
        insight="This area line tracks per-capita CO2 for the selected country. The slope shows whether emissions intensity is accelerating or stabilizing relative to population."
        data={{
          labels: co2Series.map((d) => d.year),
          datasets: [
            {
              label: `${primaryCountry} CO2 / capita`,
              data: co2Series.map((d) => d.co_emissions_per_capita),
              borderColor: '#0ea5e9'
            }
          ]
        }}
      />
      <ChartCard
        title="AI Yield Predictions"
        chartKind="bar"
        insight="Scenario bars compare modelled yield outcomes under different climate and input assumptions. Taller bars indicate more optimistic yield scenarios."
        data={{
          labels: predictions.map((d) => `Scenario ${d.scenario}`),
          datasets: [{ label: 'Predicted yield', data: predictions.map((d) => d.predicted_yield), borderColor: '#f59e0b' }]
        }}
        className="lg:col-span-2"
      />
    </div>
  );
}

export function ChartCard({
  title,
  data,
  chartKind = 'line',
  insight,
  className = '',
  revealOnMount = false,
  delay = 0
}: {
  title: string;
  data: any;
  chartKind?: ChartKind;
  insight: string;
  className?: string;
  revealOnMount?: boolean;
  delay?: number;
}) {
  const hasData = Array.isArray(data?.labels) && data.labels.length > 0;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const revealMotion = revealOnMount
    ? { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: 'easeOut', delay } }
    : { initial: false };

  const adjustedData = useMemo(() => {
    if (!data?.datasets) return data;

    return {
      ...data,
      datasets: data.datasets.map((dataset: any) => {
        const baseColor = dataset.borderColor || '#0ea5e9';
        if (chartKind === 'bar') {
          return {
            ...dataset,
            backgroundColor: dataset.backgroundColor || hexToRgba(baseColor, 0.6),
            borderColor: baseColor,
            borderWidth: 1,
            borderRadius: 10
          };
        }
        if (chartKind === 'area') {
          return {
            ...dataset,
            fill: true,
            backgroundColor: dataset.backgroundColor || hexToRgba(baseColor, 0.18),
            borderColor: baseColor
          };
        }
        return {
          ...dataset,
          borderColor: baseColor
        };
      })
    };
  }, [chartKind, data]);

  return (
    <motion.div
      ref={ref}
      {...revealMotion}
      whileHover={{ y: -6 }}
      onClick={() => setOpen((prev) => !prev)}
      className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${className}`}
    >
      <motion.span
        initial={{ scaleX: 0, opacity: 0 }}
        animate={inView ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="pointer-events-none absolute left-6 right-6 top-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-400"
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">Click for assistant insight</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">
          AI
        </span>
      </div>

      <div className="mt-4 flex-1">
        {hasData ? (
          <div className="h-[280px]">
            {chartKind === 'bar' ? <Bar data={adjustedData} options={chartOptions} /> : <Line data={adjustedData} options={chartOptions} />}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            Data temporarily unavailable.
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-6 top-6 z-20 max-w-xs rounded-2xl border border-emerald-100 bg-white/95 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.2)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <img
                src="/icon.svg"
                alt="ClimateFood Intelligence"
                className="h-9 w-9 flex-shrink-0 rounded-2xl shadow-sm"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-500">Insight</p>
                <p className="mt-2 text-sm text-slate-700">{insight}</p>
              </div>
              <button
                type="button"
                className="ml-auto text-xs font-semibold text-slate-400 transition hover:text-slate-600"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
