'use client';

import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';
import { ChartCard } from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import { useDashboardData } from '@/lib/useDashboardData';

export default function EmissionsPage() {
  const { co2, loading, error } = useDashboardData();
  const co2Germany = co2.filter((point) => point.country === 'Germany');

  const data = {
    labels: co2Germany.map((d) => d.year),
    datasets: [{ label: 'Germany CO2 / capita', data: co2Germany.map((d) => d.co_emissions_per_capita), borderColor: '#0ea5e9' }]
  };

  return (
    <main>
      <Navbar />
      <section className="section-container">
        <PageHeader
          eyebrow="Emissions"
          title="CO2 emissions clarity"
          subtitle="Understand emissions intensity and benchmark performance with animated trends."
        />
        <DataStatus loading={loading} error={error} />
        <SectionReveal from="right">
          <div className="mt-10">
            <ChartCard title="CO2 emissions per capita" data={data} />
          </div>
        </SectionReveal>
      </section>
    </main>
  );
}
