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

  return (
    <main>
      <Navbar />
      <section className="section-container">
        <PageHeader
          eyebrow="Air quality"
          title="Pollution visibility at a glance"
          subtitle="Track particulate concentrations alongside climate context to understand air health in a single narrative."
        />
        <DataStatus loading={loading} error={error} />
        <SectionReveal from="right">
          <div className="mt-10">
            <ChartCard title="PM10 and PM2.5 trends" data={data} />
          </div>
        </SectionReveal>
      </section>
    </main>
  );
}
