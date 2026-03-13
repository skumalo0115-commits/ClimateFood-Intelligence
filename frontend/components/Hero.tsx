'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const stats = [
  { label: 'Active sensors', value: '2,418' },
  { label: 'Crop regions', value: '196' },
  { label: 'Daily forecasts', value: '72k' }
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-sheen" />
      <div className="section-container grid min-h-[80vh] items-center gap-12 py-24 lg:grid-cols-[1.05fr,0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Climatefood Intelligence
          </p>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight text-slate-900 md:text-6xl">
            Design a smarter food system with climate intelligence.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-600">
            Monitor rainfall, air quality, and yield forecasts with a unified, cinematic dashboard built for real-world decision making.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/dashboard"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-2px] hover:bg-slate-800"
            >
              Launch dashboard
            </Link>
            <Link
              href="/climate"
              className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:shadow-md"
            >
              Explore climate data
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
              >
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="magic-frame">
            <img
              src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80"
              alt="Landscape"
              className="h-full w-full rounded-[28px] object-cover"
            />
            <div className="absolute -top-6 left-6 z-10 rounded-2xl bg-white/85 p-4 shadow-lg backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Predictive yield</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">+18.4%</p>
              <p className="text-sm text-slate-500">Projected season uplift</p>
            </div>
          </div>
          <div className="absolute -right-6 top-10 hidden w-40 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg lg:block">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Air quality</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">PM2.5 12</p>
            <p className="text-xs text-emerald-600">Healthy range</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
