'use client';

import CountryBadge from '@/components/CountryBadge';
import SectionReveal from '@/components/SectionReveal';
import { getCountryPreset, getSupportedCountryPresets } from '@/lib/countryPresets';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';

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
  const { config, updateConfig } = useRuntimeConfig();
  const countryOptions = getSupportedCountryPresets();
  const currentCountry = country ?? config.country ?? 'South Africa';

  const handleCountryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countryName = event.target.value;
    const preset = getCountryPreset(countryName, config);
    if (!preset) return;
    const nextCountries = Array.from(new Set([...(config.co2_countries ?? []), preset.country].filter(Boolean)));
    await updateConfig({
      country: preset.country,
      country_code: preset.country_code,
      lat: preset.lat,
      lon: preset.lon,
      aq_radius: preset.aq_radius,
      crops_country: preset.crops_country,
      co2_countries: nextCountries
    });
  };

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
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <label className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] ${isLight ? 'text-emerald-100' : 'text-slate-500'}`}>
                <span>Pinpointed location</span>
                <select
                  value={currentCountry}
                  onChange={handleCountryChange}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium normal-case tracking-normal ${isLight ? 'border-white/20 bg-slate-950/20 text-white' : 'border-slate-200 bg-white text-slate-800'}`}
                >
                  {countryOptions.map((option) => (
                    <option key={option.country} value={option.country}>
                      {option.country}
                    </option>
                  ))}
                </select>
              </label>
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
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <label className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] ${isLight ? 'text-emerald-100' : 'text-slate-500'}`}>
              <span>Pinpointed location</span>
              <select
                value={currentCountry}
                onChange={handleCountryChange}
                className={`rounded-xl border px-3 py-2 text-sm font-medium normal-case tracking-normal ${isLight ? 'border-white/20 bg-slate-950/20 text-white' : 'border-slate-200 bg-white text-slate-800'}`}
              >
                {countryOptions.map((option) => (
                  <option key={option.country} value={option.country}>
                    {option.country}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className={`max-w-2xl text-lg ${subtitleClass}`}>{subtitle}</p>
        </div>
      )}
    </SectionReveal>
  );
}
