'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ChartsPanel from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import SectionReveal from '@/components/SectionReveal';
import { useDashboardData } from '@/lib/useDashboardData';

const MapPanel = dynamic(() => import('@/components/MapPanel'), { ssr: false });

export default function DashboardPage() {
  const { climate, airQuality, crops, co2, predictions, loading, error } = useDashboardData();
  const backgroundImage =
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80';

  const statCards = [
    { label: 'Climate points', value: climate.length },
    { label: 'Air quality points', value: airQuality.length },
    { label: 'Crop records', value: crops.length },
    { label: 'CO2 records', value: co2.length },
    { label: 'AI scenarios', value: predictions.length }
  ];

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="pointer-events-none absolute inset-0 bg-white/75" />
      <div className="relative z-10 hidden md:block">
        <Navbar />
      </div>
      <section className="section-container relative z-10">
      <SectionReveal from="up">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Dashboard</p>
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">Interactive Analytics Command Centre</h1>
          <p className="max-w-2xl text-lg text-slate-600">
            Monitor climate signals, air quality, crop performance, and AI yield scenarios with motion-rich insights.
          </p>
        </div>
      </SectionReveal>

      <DataStatus loading={loading} error={error} />

      {error && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">Deployment variables to set exactly:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Frontend: <code>NEXT_PUBLIC_BACKEND_URL=https://climatefood-backend.up.railway.app</code> (then redeploy frontend)</li>
            <li>Backend: <code>OPENAQ_API_KEY=your_openaq_key</code> (required for air quality)</li>
            <li>Backend: <code>METEOSTAT_API_KEY=your_rapidapi_key</code> and <code>METEOSTAT_HOST=meteostat.p.rapidapi.com</code> (required for climate)</li>
            <li>Backend: <code>CO2_JSON_URL=https://owid-public.owid.io/data/co2/owid-co2-data.json</code></li>
            <li>Backend: <code>CROPS_JSON_URL=https://api.worldbank.org/v2/country/ZAF/indicator/AG.YLD.MAIZ.KG?format=json&per_page=20000</code></li>
            <li>Backend optional: <code>CO2_COUNTRIES=South Africa,Kenya,India,Germany</code></li>
            <li>Backend optional: <code>CROPS_COUNTRY=ZAF</code> and <code>CROPS_INDICATOR=AG.YLD.MAIZ.KG</code></li>
            <li>Backend optional location: <code>OPENAQ_LAT</code>/<code>OPENAQ_LON</code> and <code>METEOSTAT_LAT</code>/<code>METEOSTAT_LON</code> (default South Africa)</li>
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

      <div className="mt-12">
        <ChartsPanel climate={climate} airQuality={airQuality} crops={crops} co2={co2} predictions={predictions} />
      </div>

      <SectionReveal from="right">
        <MapPanel />
      </SectionReveal>
      </section>
    </main>
  );
}
