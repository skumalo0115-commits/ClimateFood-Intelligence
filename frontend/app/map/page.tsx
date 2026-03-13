'use client';

import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';

const MapPanel = dynamic(() => import('@/components/MapPanel'), { ssr: false });

export default function MapPage() {
  const backgroundImage =
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80';

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="pointer-events-none absolute inset-0 bg-white/70" />
      <div className="relative z-10">
        <Navbar />
        <section className="section-container">
          <PageHeader
            eyebrow="Map"
            title="Geo intelligence canvas"
            subtitle="Navigate the world with spatial context layered on climate and food analytics."
            tone="dark"
          />
          <SectionReveal from="down">
            <MapPanel />
          </SectionReveal>
        </section>
      </div>
    </main>
  );
}
