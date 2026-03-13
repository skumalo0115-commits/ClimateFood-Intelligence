'use client';

import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';
import { ChartCard } from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import { useDashboardData } from '@/lib/useDashboardData';

export default function AirQualityPage() {
  const { airQuality, loading, error } = useDashboardData();

  const data = {
    labels: airQuality.map((d) => d.date),
    datasets: [
      { label: 'PM10', data: airQuality.map((d) => d.pm10), borderColor: '#f97316' },
      { label: 'PM2.5', data: airQuality.map((d) => d.pm2_5), borderColor: '#e11d48' }
    ]
  };

  const backgroundImage =
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80';

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/60" />
      <div className="relative z-10">
        <Navbar />
        <section className="section-container">
          <PageHeader
            eyebrow="Air quality"
            title="Pollution visibility at a glance"
            subtitle="Track particulate concentrations alongside climate context to understand air health in a single narrative."
            tone="light"
          />
          <DataStatus loading={loading} error={error} />
          <SectionReveal from="right">
            <div className="mt-10">
              <ChartCard
                title="PM10 and PM2.5 trends"
                chartKind="line"
                insight="PM10 (coarse dust) and PM2.5 (fine particles) move differently when wind, traffic, or fires shift. A rising PM2.5 line is the clearest signal of health risk."
                autoInsight
                data={data}
              />
            </div>
          </SectionReveal>
        </section>
      </div>
    </main>
  );
}
