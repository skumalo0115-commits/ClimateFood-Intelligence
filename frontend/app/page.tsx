'use client';

import Link from 'next/link';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import SectionReveal from '@/components/SectionReveal';

const features = [
  {
    title: 'Climate pulse in real time',
    description:
      'Track temperature and precipitation trends with a high fidelity lens. Identify sudden anomalies and seasonal shifts before they impact planning.',
    image:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    href: '/climate',
    cta: 'Explore climate intelligence'
  },
  {
    title: 'Air quality signals that matter',
    description:
      'Measure PM10 and PM2.5 levels alongside weather context. Turn air quality into a clear signal for field response and operations.',
    image:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    href: '/air-quality',
    cta: 'See air quality'
  },
  {
    title: 'Crop production momentum',
    description:
      'Understand yield trajectories by region and crop. Spot growth accelerators and disruptions early using trend-driven dashboards.',
    image:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
    href: '/crops',
    cta: 'View crop analytics'
  },
  {
    title: 'Emissions and impact',
    description:
      'Relate per-capita emissions to climate stress and food security risk. Build a sharper picture of sustainability tradeoffs.',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    href: '/emissions',
    cta: 'Review emissions'
  },
  {
    title: 'AI yield forecasts',
    description:
      'Use predictive scenarios to anticipate yield changes. Keep stakeholders aligned with forward-looking insights.',
    image:
      'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
    href: '/predictions',
    cta: 'Open AI scenarios'
  },
  {
    title: 'Geo intelligence',
    description:
      'Layer contextual maps with data markers to see patterns by region. Navigate global hotspots in a single canvas.',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    href: '/map',
    cta: 'Open live map'
  }
];

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />

      <section className="section-container">
        <SectionReveal from="up">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">Platform focus</p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-900 md:text-5xl">
              Integrated climate, air, crop, emissions, and prediction intelligence in one platform.
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Explore dedicated pages for climate conditions, air quality, crop performance, emissions, predictive modeling, and map-based context. The platform is designed to help teams compare signals quickly and make confident, data-backed decisions.
            </p>
          </div>
        </SectionReveal>

        <div className="mt-16 space-y-16">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`grid items-center gap-10 lg:grid-cols-[1.05fr,0.95fr] ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}
            >
              <SectionReveal from={index % 2 === 0 ? 'left' : 'right'}>
                <div className="glow-card">
                  <img src={feature.image} alt={feature.title} className="h-72 w-full rounded-2xl object-cover" />
                </div>
              </SectionReveal>
              <SectionReveal from={index % 2 === 0 ? 'right' : 'left'}>
                <div>
                  <h3 className="text-3xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-4 text-lg text-slate-600">{feature.description}</p>
                  <Link
                    href={feature.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-900"
                  >
                    {feature.cta} {'>'}
                  </Link>
                </div>
              </SectionReveal>
            </div>
          ))}
        </div>
      </section>

      <section className="section-container">
        <SectionReveal from="down">
          <div className="glow-card grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Launch dashboard</p>
              <h2 className="mt-4 text-4xl font-semibold text-slate-900">The analytics command center.</h2>
              <p className="mt-4 text-lg text-slate-600">
                The dashboard brings every signal together with motion, clarity, and spatial navigation. Ready to explore live data?
              </p>
            </div>
            <div className="flex items-center justify-start lg:justify-end">
              <Link
                href="/dashboard"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-2px] hover:bg-slate-800"
              >
                Enter dashboard
              </Link>
            </div>
          </div>
        </SectionReveal>
      </section>
    </main>
  );
}
