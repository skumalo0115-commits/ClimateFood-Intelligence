'use client';

import { motion } from 'framer-motion';
import ChartsPanel from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import MapPanel from '@/components/MapPanel';
import SectionReveal from '@/components/SectionReveal';
import { useDashboardData } from '@/lib/useDashboardData';

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
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">Interactive Analytics Command Center</h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Monitor climate signals, air quality, crop performance, and AI yield scenarios with motion-rich insights.
          </p>
        </div>
      </SectionReveal>

      <DataStatus loading={loading} error={error} />

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -6 }}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm"
          >
            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
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
