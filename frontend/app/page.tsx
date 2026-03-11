'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import ChartsPanel from '@/components/ChartsPanel';
import ThemeToggle from '@/components/ThemeToggle';
import SectionReveal from '@/components/SectionReveal';
import { AirQualityPoint, ClimatePoint, CropPoint, ThemeMode } from '@/lib/types';

const MapPanel = dynamic(() => import('@/components/MapPanel'), { ssr: false });

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

export default function HomePage() {
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [climate, setClimate] = useState<ClimatePoint[]>([]);
  const [airQuality, setAirQuality] = useState<AirQualityPoint[]>([]);
  const [crops, setCrops] = useState<CropPoint[]>([]);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light', 'gradient');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const load = async () => {
      const [climateRes, airRes, cropsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/climate`).then((r) => r.json()),
        fetch(`${BACKEND_URL}/api/air-quality`).then((r) => r.json()),
        fetch(`${BACKEND_URL}/api/crops`).then((r) => r.json())
      ]);
      setClimate(climateRes.data ?? []);
      setAirQuality(airRes.data ?? []);
      setCrops(cropsRes.data ?? []);
    };
    load().catch(console.error);
  }, []);

  return (
    <main>
      <Navbar />
      <Hero />
      <section id="dashboard" className="section-container">
        <SectionReveal>
          <h2 className="text-3xl font-bold">Interactive Analytics Dashboard</h2>
          <p className="mt-2 text-slate-300">Track climate, air quality, food supply, and emissions trends in one place.</p>
        </SectionReveal>
        <SectionReveal from="right">
          <div className="mt-8">
            <ChartsPanel climate={climate} airQuality={airQuality} crops={crops} />
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
