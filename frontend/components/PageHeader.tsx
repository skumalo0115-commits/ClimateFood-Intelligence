'use client';

import CountryBadge from '@/components/CountryBadge';
import SectionReveal from '@/components/SectionReveal';

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  tone?: 'light' | 'dark';
  country?: string;
}

export default function PageHeader({ eyebrow, title, subtitle, backgroundImage, tone = 'dark', country }: Props) {
  const isLight = tone === 'light';
  const eyebrowClass = isLight ? 'text-emerald-200' : 'text-emerald-600';
  const titleClass = isLight ? 'text-white' : 'text-slate-900';
  const subtitleClass = isLight ? 'text-white/80' : 'text-slate-600';

  return (
    <SectionReveal from="up">
      {backgroundImage ? (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900/10 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
          <div className={`absolute inset-0 ${isLight ? 'bg-slate-950/55' : 'bg-white/70'}`} />
          <div className="relative z-10 flex flex-col gap-3 px-8 py-10 md:px-12">
            <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${eyebrowClass}`}>{eyebrow}</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={`text-4xl font-semibold md:text-5xl ${titleClass}`}>{title}</h1>
              {country ? <CountryBadge country={country} tone={isLight ? 'dark' : 'light'} /> : null}
            </div>
            <p className={`max-w-2xl text-lg ${subtitleClass}`}>{subtitle}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${eyebrowClass}`}>{eyebrow}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className={`text-4xl font-semibold md:text-5xl ${titleClass}`}>{title}</h1>
            {country ? <CountryBadge country={country} tone={isLight ? 'dark' : 'light'} /> : null}
          </div>
          <p className={`max-w-2xl text-lg ${subtitleClass}`}>{subtitle}</p>
        </div>
      )}
    </SectionReveal>
  );
}
