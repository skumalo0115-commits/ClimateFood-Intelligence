'use client';

import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';
import MapPanel from '@/components/MapPanel';

export default function MapPage() {
  return (
    <main>
      <Navbar />
      <section className="section-container">
        <PageHeader
          eyebrow="Map"
          title="Geo intelligence canvas"
          subtitle="Navigate the world with spatial context layered on climate and food analytics."
        />
        <SectionReveal from="down">
          <MapPanel />
        </SectionReveal>
      </section>
    </main>
  );
}
