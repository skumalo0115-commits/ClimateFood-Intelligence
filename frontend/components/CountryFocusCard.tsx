'use client';

import { useMemo, useState } from 'react';
import CountryBadge from '@/components/CountryBadge';
import { getAllowedCountryPresets, getCountryPreset } from '@/lib/countryPresets';
import type { RuntimeConfig } from '@/lib/runtimeConfigShared';

interface Props {
  config: RuntimeConfig;
  loading?: boolean;
  updateConfig: (payload: Partial<RuntimeConfig>) => Promise<RuntimeConfig>;
  className?: string;
}

export default function CountryFocusCard({ config, loading = false, updateConfig, className = '' }: Props) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const allowedCountries = useMemo(() => getAllowedCountryPresets(config), [config]);

  const handleCountryChange = async (countryName: string) => {
    const selected = getCountryPreset(countryName, config);
    if (!selected || selected.country === config.country) {
      setStatus(selected ? `${selected.country} is already selected.` : 'That country is not configured yet.');
      return;
    }

    setSaving(true);
    setStatus('');

    try {
      await updateConfig({
        country: selected.country,
        country_code: selected.country_code,
        lat: selected.lat,
        lon: selected.lon,
        aq_radius: selected.aq_radius,
        crops_country: selected.crops_country,
        co2_countries: allowedCountries.map((option) => option.country)
      });
      setStatus(`${selected.country} is now active across the charts and cards.`);
    } catch {
      setStatus('Unable to change the country right now. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`mt-6 rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm ${className}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Country focus</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">Showing data for {config.country}</h2>
            <CountryBadge country={config.country} />
          </div>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Choose one of the allowed countries and the charts, graph cards, and map on this page will update to match it.
          </p>
        </div>

        <label className="flex min-w-[220px] flex-col gap-2 text-sm font-semibold text-slate-700">
          Select country
          <select
            value={config.country}
            disabled={loading || saving || allowedCountries.length === 0}
            onChange={(event) => void handleCountryChange(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
          >
            {allowedCountries.map((country) => (
              <option key={country.country} value={country.country}>
                {country.country}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className={`mt-3 text-sm ${status ? 'text-emerald-700' : 'text-slate-500'}`}>
        {status || 'The selected country is shown next to each card heading so people always know what they are looking at.'}
      </p>
    </div>
  );
}
