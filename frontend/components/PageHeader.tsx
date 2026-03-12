'use client';

import SectionReveal from '@/components/SectionReveal';

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export default function PageHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <SectionReveal from="up">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600">{eyebrow}</p>
        <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">{title}</h1>
        <p className="max-w-2xl text-lg text-slate-600">{subtitle}</p>
      </div>
    </SectionReveal>
  );
}
