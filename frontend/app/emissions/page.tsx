'use client';

import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';
import { ChartCard } from '@/components/ChartsPanel';
import DataStatus from '@/components/DataStatus';
import { useDashboardData } from '@/lib/useDashboardData';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';

export default function EmissionsPage() {
  const { co2, loading, error } = useDashboardData();
  const { config } = useRuntimeConfig();
  const primaryCountry = config?.country ?? 'South Africa';
  const filtered = co2.filter((point) => point.country === primaryCountry);
  const series = filtered.length ? filtered : co2;

  const data = {
    labels: series.map((d) => d.year),
    datasets: [
      {
        label: `${primaryCountry} CO2 / capita`,
        data: series.map((d) => d.co_emissions_per_capita),
        borderColor: '#0ea5e9'
      }
    ]
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
            <ChartCard
              title={`CO2 emissions per capita - ${primaryCountry}`}
              chartKind="area"
              insight="The filled curve highlights how per-capita CO2 changes over time. A flattening curve signals stabilizing emissions intensity, while steeper slopes show acceleration."
              data={data}
            />
          </div>
        </SectionReveal>
      </section>
    </main>
  );
}
