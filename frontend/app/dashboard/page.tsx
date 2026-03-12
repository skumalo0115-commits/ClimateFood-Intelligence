'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import ChartsPanel from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import SectionReveal from '@/components/SectionReveal';
import { useDashboardData } from '@/lib/useDashboardData';

const MapPanel = dynamic(() => import('@/components/MapPanel'), { ssr: false });

export default function DashboardPage() {
  const { climate, airQuality, crops, co2, predictions, loading, error } = useDashboardData();

  const statCards = [
    { label: 'Climate points', value: climate.length },
    { label: 'Air quality points', value: airQuality.length },
    { label: 'Crop records', value: crops.length },
    { label: 'CO2 records', value: co2.length },
    { label: 'AI scenarios', value: predictions.length }
  ];

  return (
    <main className="section-container">
      <SectionReveal from="up">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Dashboard</p>
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl dark:text-slate-100">Interactive Analytics Command Center</h1>
          <p className="max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Monitor climate signals, air quality, crop performance, and AI yield scenarios with motion-rich insights.
          </p>
        </div>
      </SectionReveal>

      <DataStatus loading={loading} error={error} />

      {error && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
          <p className="font-semibold">Deployment variables to set exactly:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Frontend: <code>NEXT_PUBLIC_BACKEND_URL=https://climatefood-backend.up.railway.app</code></li>
            <li>Backend: <code>PORT</code> (set automatically by Railway)</li>
            <li>Backend optional: <code>NASA_POWER_API_KEY=Hmxo5MANRISwVLcyWR0eeFi08QOUaAiZuA0N8oB3</code></li>
            <li>Backend optional: <code>FAOSTAT_CSV_PATH=/app/data/faostat_data.csv</code></li>
            <li>CO2 CSV source is in code: <code>https://ourworldindata.org/grapher/co-emissions-per-capita.csv?v=1&csvType=full&useColumnShortNames=true</code></li>
          </ul>
        </div>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/85"
          >
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{stat.value}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <SectionReveal from="left">
        <div className="mt-12">
          <ChartsPanel climate={climate} airQuality={airQuality} crops={crops} co2={co2} predictions={predictions} />
        </div>
      </SectionReveal>

      <SectionReveal from="right">
        <MapPanel />
      </SectionReveal>
    </main>
  );
}
