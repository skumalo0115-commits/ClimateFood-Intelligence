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
import { useEffect, useMemo, useRef, useState } from 'react';
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
        autoInsight
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
        autoInsight
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
        autoInsight
        data={{
          labels: crops.map((d) => d.year),
          datasets: [{ label: 'Yield (kg/ha)', data: crops.map((d) => d.value), borderColor: '#6366f1' }]
        }}
      />
      <ChartCard
        title={`CO2 Emissions (per capita) - ${primaryCountry}`}
        chartKind="area"
        insight="This area line tracks per-capita CO2 for the selected country. The slope shows whether emissions intensity is accelerating or stabilizing relative to population."
        autoInsight
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
        autoInsight
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
  delay = 0,
  autoInsight = false
}: {
  title: string;
  data: any;
  chartKind?: ChartKind;
  insight: string;
  className?: string;
  revealOnMount?: boolean;
  delay?: number;
  autoInsight?: boolean;
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

  const availableYears = useMemo(() => {
    if (!Array.isArray(adjustedData?.labels)) return [];
    const extractYear = (label: unknown) => {
      if (typeof label === 'number' && Number.isFinite(label)) return Math.trunc(label);
      if (typeof label === 'string') {
        const match = label.match(/(19|20)\d{2}/);
        if (match) return Number(match[0]);
      }
      return null;
    };
    const years = adjustedData.labels
      .map((label: unknown) => extractYear(label))
      .filter((value: number | null): value is number => value !== null);
    return Array.from(new Set<number>(years)).sort((a: number, b: number) => a - b);
  }, [adjustedData]);

  const [yearFrom, setYearFrom] = useState<number | ''>('');
  const [yearTo, setYearTo] = useState<number | ''>('');

  const availableDates = useMemo(() => {
    if (!Array.isArray(adjustedData?.labels)) return [];
    const dates = adjustedData.labels
      .map((label: unknown) => {
        if (typeof label !== 'string') return null;
        if (!label.includes('-')) return null;
        const iso = label.split('T')[0];
        const parsed = new Date(iso);
        if (Number.isNaN(parsed.getTime())) return null;
        return iso;
      })
      .filter((value: string | null): value is string => value !== null);
    return Array.from(new Set<string>(dates)).sort();
  }, [adjustedData]);

  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    if (availableYears.length >= 2) {
      setYearFrom(availableYears[0]);
      setYearTo(availableYears[availableYears.length - 1]);
    } else {
      setYearFrom('');
      setYearTo('');
    }
  }, [availableYears]);

  useEffect(() => {
    if (availableDates.length >= 2) {
      setDateFrom(availableDates[0]);
      setDateTo(availableDates[availableDates.length - 1]);
    } else {
      setDateFrom('');
      setDateTo('');
    }
  }, [availableDates]);

  const filteredData = useMemo(() => {
    const hasDateRange = availableDates.length >= 2 && dateFrom && dateTo;
    if (hasDateRange) {
      const from = dateFrom <= dateTo ? dateFrom : dateTo;
      const to = dateFrom <= dateTo ? dateTo : dateFrom;
      const indices = adjustedData.labels
        .map((label: unknown, index: number) => {
          if (typeof label !== 'string') return null;
          const iso = label.split('T')[0];
          if (!iso.includes('-')) return null;
          return { index, iso };
        })
        .filter((entry: { index: number; iso: string } | null) => {
          if (!entry) return false;
          return entry.iso >= from && entry.iso <= to;
        }) as { index: number; iso: string }[];

      if (!indices.length) return adjustedData;

      return {
        ...adjustedData,
        labels: indices.map((entry: { index: number }) => adjustedData.labels[entry.index]),
        datasets: adjustedData.datasets.map((dataset: any) => ({
          ...dataset,
          data: indices.map((entry: { index: number }) => dataset.data[entry.index])
        }))
      };
    }

    if (!availableYears.length || yearFrom === '' || yearTo === '') return adjustedData;
    const extractYear = (label: unknown) => {
      if (typeof label === 'number' && Number.isFinite(label)) return Math.trunc(label);
      if (typeof label === 'string') {
        const match = label.match(/(19|20)\d{2}/);
        if (match) return Number(match[0]);
      }
      return null;
    };
    const from = Math.min(Number(yearFrom), Number(yearTo));
    const to = Math.max(Number(yearFrom), Number(yearTo));
    const indices = adjustedData.labels
      .map((label: unknown, index: number) => ({ index, year: extractYear(label) }))
      .filter((entry: { index: number; year: number | null }) => entry.year !== null && entry.year >= from && entry.year <= to);

    if (!indices.length) return adjustedData;

    return {
      ...adjustedData,
      labels: indices.map((entry: { index: number }) => adjustedData.labels[entry.index]),
      datasets: adjustedData.datasets.map((dataset: any) => ({
        ...dataset,
        data: indices.map((entry: { index: number }) => dataset.data[entry.index])
      }))
    };
  }, [adjustedData, availableYears, yearFrom, yearTo]);

  const generatedInsight = useMemo(() => {
    if (!autoInsight) return insight;
    if (!filteredData?.datasets?.length || !filteredData.labels?.length) {
      return 'Not enough data points in the selected range yet.';
    }
    const datasetSummaries = filteredData.datasets.slice(0, 2).map((dataset: any) => {
      const values = (dataset.data || []).filter((value: unknown) => typeof value === 'number') as number[];
      if (values.length < 2) return `${dataset.label ?? 'Series'} has limited data.`;
      const first = values[0];
      const last = values[values.length - 1];
      const change = last - first;
      const pct = first !== 0 ? (change / first) * 100 : 0;
      const direction = Math.abs(change) < 0.001 ? 'holding steady' : change > 0 ? 'rising' : 'falling';
      return `${dataset.label ?? 'Series'} is ${direction}, moving from ${first.toFixed(2)} to ${last.toFixed(
        2
      )} (${pct.toFixed(1)}%).`;
    });

    const hasDateRange = availableDates.length >= 2 && dateFrom && dateTo;
    const rangeNote = hasDateRange
      ? ` Range: ${dateFrom} to ${dateTo}.`
      : availableYears.length >= 2 && yearFrom !== '' && yearTo !== ''
      ? ` Range: ${yearFrom}-${yearTo}.`
      : '';

    return `${datasetSummaries.join(' ')}${rangeNote}`;
  }, [autoInsight, filteredData, insight, availableDates.length, availableYears.length, dateFrom, dateTo, yearFrom, yearTo]);

  return (
    <motion.div
      ref={ref}
      {...revealMotion}
      whileHover={{ y: -6 }}
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] ${className}`}
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
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">Tap / click AI for assistant insight</p>
        </div>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/20"
        >
          AI
        </button>
      </div>

      {availableDates.length >= 2 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Date range</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-9 w-40 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="h-9 w-40 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700"
            />
          </div>
        </div>
      ) : availableYears.length >= 2 ? (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Year range</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={yearFrom}
              onChange={(event) => setYearFrom(event.target.value ? Number(event.target.value) : '')}
              className="h-9 w-24 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="number"
              value={yearTo}
              onChange={(event) => setYearTo(event.target.value ? Number(event.target.value) : '')}
              className="h-9 w-24 rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700"
            />
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex-1">
        {hasData ? (
          <div className="h-[280px]">
            {chartKind === 'bar' ? <Bar data={filteredData} options={chartOptions} /> : <Line data={filteredData} options={chartOptions} />}
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
                <p className="mt-2 text-sm text-slate-700">{generatedInsight}</p>
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
