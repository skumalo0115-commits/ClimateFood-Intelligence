'use client';

import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';
import { ChartCard } from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import { useDashboardData } from '@/lib/useDashboardData';

export default function ClimatePage() {
  const { climate, loading, error } = useDashboardData();

  const data = {
    labels: climate.map((d) => d.date),
    datasets: [
      { label: 'Temperature C', data: climate.map((d) => d.temperature), borderColor: '#22c55e' },
      { label: 'Precipitation mm', data: climate.map((d) => d.precipitation), borderColor: '#38bdf8' }
    ]
  };

  const backgroundImage =
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/60" />
      <div className="relative z-10">
        <Navbar />
        <section className="section-container">
          <PageHeader
            eyebrow="Climate"
            title="Temperature and precipitation intelligence"
            subtitle="Detect season shifts, surface anomalies, and precipitation patterns with a clean, motion-driven view."
            tone="light"
          />
          <DataStatus loading={loading} error={error} />
          <SectionReveal from="left">
            <div className="mt-10">
              <ChartCard
                title="Temperature & precipitation"
                chartKind="line"
                insight="The temperature and rainfall lines show the most recent 30 days for the focus coordinates. When the temperature line rises while precipitation drops, it signals drying conditions and crop stress risk."
                data={data}
              />
            </div>
          </SectionReveal>
        </section>
      </div>
    </main>
  );
}
