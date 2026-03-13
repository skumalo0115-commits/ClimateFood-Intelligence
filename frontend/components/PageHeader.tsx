'use client';

import SectionReveal from '@/components/SectionReveal';

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  backgroundImage?: string;
  tone?: 'light' | 'dark';
}

export default function PageHeader({ eyebrow, title, subtitle, backgroundImage, tone = 'dark' }: Props) {
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
            <h1 className={`text-4xl font-semibold md:text-5xl ${titleClass}`}>{title}</h1>
            <p className={`max-w-2xl text-lg ${subtitleClass}`}>{subtitle}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">{eyebrow}</p>
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">{title}</h1>
          <p className="max-w-2xl text-lg text-slate-600">{subtitle}</p>
        </div>
      )}
    </SectionReveal>
  );
}
