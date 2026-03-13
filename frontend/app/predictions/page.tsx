'use client';

import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';
import { ChartCard } from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import { useDashboardData } from '@/lib/useDashboardData';

export default function PredictionsPage() {
  const { predictions, loading, error } = useDashboardData();

  const data = {
    labels: predictions.map((d) => `Scenario ${d.scenario}`),
    datasets: [{ label: 'Predicted yield', data: predictions.map((d) => d.predicted_yield), borderColor: '#f59e0b' }]
  };

  const backgroundImage =
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80';

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="relative z-10">
        <Navbar />
        <section className="section-container">
          <PageHeader
            eyebrow="Predictions"
            title="AI yield scenario modeling"
            subtitle="Compare outcomes across scenarios to keep plans resilient and adaptable."
            tone="dark"
          />
          <DataStatus loading={loading} error={error} />
          <SectionReveal from="left">
            <div className="mt-10">
              <ChartCard
                title="Predicted yield scenarios"
                chartKind="bar"
                insight="Each bar is a scenario the model simulated. Bigger bars represent more optimistic yield outcomes under that scenario's climate and input assumptions."
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
