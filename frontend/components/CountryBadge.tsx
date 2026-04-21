'use client';

interface Props {
  country: string;
  tone?: 'light' | 'dark';
}

export default function CountryBadge({ country, tone = 'light' }: Props) {
  const palette =
    tone === 'dark'
      ? 'border-white/20 bg-white/10 text-white'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${palette}`}>{country}</span>;
}
