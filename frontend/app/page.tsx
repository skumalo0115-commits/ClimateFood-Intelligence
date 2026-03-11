'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import ChartsPanel from '@/components/ChartsPanel';
import ThemeToggle from '@/components/ThemeToggle';
import SectionReveal from '@/components/SectionReveal';
import { AirQualityPoint, ClimatePoint, Co2Point, CropPoint, PredictionPoint, ThemeMode } from '@/lib/types';

const MapPanel = dynamic(() => import('@/components/MapPanel'), { ssr: false });
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export default function HomePage() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [climate, setClimate] = useState<ClimatePoint[]>([]);
  const [airQuality, setAirQuality] = useState<AirQualityPoint[]>([]);
  const [crops, setCrops] = useState<CropPoint[]>([]);
  const [co2, setCo2] = useState<Co2Point[]>([]);
  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light', 'gradient');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      const endpoints = ['climate', 'air-quality', 'crops', 'co2', 'predict'];
      const results = await Promise.allSettled(
        endpoints.map((endpoint) => fetch(`${BACKEND_URL}/api/${endpoint}`).then((r) => r.json()))
      );

      const unpack = (index: number) => (results[index].status === 'fulfilled' ? results[index].value?.data ?? [] : []);

      setClimate(unpack(0));
      setAirQuality(unpack(1));
      setCrops(unpack(2));
      setCo2(unpack(3));
      setPredictions(unpack(4));

      if (results.every((entry) => entry.status === 'rejected')) {
        setError('Unable to connect to backend API. Please verify deployment and API URL.');
      }

      setLoading(false);
    };

    load().catch(() => {
      setError('Unable to load data right now.');
      setLoading(false);
    });
  }, []);

  return (
    <main>
      <Navbar />
      <Hero />
      <section id="dashboard" className="section-container">
        <SectionReveal>
          <h2 className="text-3xl font-bold">Interactive Analytics Dashboard</h2>
          <p className="mt-2 text-slate-300">Track climate, air quality, food supply, emissions and AI yield scenarios in one place.</p>
        </SectionReveal>

        {error && <div className="mt-6 rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-200">{error}</div>}
        {loading && <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-slate-300">Loading live dashboard data...</div>}

        <SectionReveal from="right">
          <div id="data-insights" className="mt-8">
            <ChartsPanel climate={climate} airQuality={airQuality} crops={crops} co2={co2} predictions={predictions} />
          </div>
        </SectionReveal>
        <SectionReveal>
          <MapPanel />
        </SectionReveal>
      </section>
      <ThemeToggle mode={theme} onChange={setTheme} />
    </main>
  );
}
