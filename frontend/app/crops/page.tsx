'use client';

import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';
import { ChartCard } from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import { useDashboardData } from '@/lib/useDashboardData';

export default function CropsPage() {
  const { crops, loading, error } = useDashboardData();

  const data = {
    labels: crops.map((d) => d.year),
    datasets: [{ label: 'Yield (kg/ha)', data: crops.map((d) => d.value), borderColor: '#6366f1' }]
  };

  const backgroundImage =
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80';

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/60" />
      <div className="relative z-10">
        <Navbar />
        <section className="section-container">
          <PageHeader
            eyebrow="Crops"
            title="Crop production momentum"
            subtitle="Reveal yield trajectories and production shifts with a clean, animated line of sight."
            tone="light"
          />
          <DataStatus loading={loading} error={error} />
          <SectionReveal from="left">
            <div className="mt-10">
              <ChartCard
                title="Maize yield trends"
                chartKind="bar"
                insight="Each bar represents the maize yield per hectare for the selected country. Peaks mark strong seasons, while dips can indicate climate stress or input gaps."
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
