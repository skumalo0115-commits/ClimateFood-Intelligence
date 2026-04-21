'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import PageHeader from '@/components/PageHeader';
import SectionReveal from '@/components/SectionReveal';
import { getAllowedCountryPresets, getCountryPreset, SUPPORTED_COUNTRY_NAMES } from '@/lib/countryPresets';
import { useRuntimeConfig } from '@/lib/useRuntimeConfig';

const INDICATOR_OPTIONS = [
  { label: 'Maize yield (kg/ha)', value: 'AG.YLD.MAIZ.KG' },
  { label: 'Crop production index (2004-2006=100)', value: 'AG.PRD.CROP.XD' },
  { label: 'Cereal yield (kg/ha)', value: 'AG.YLD.CREL.KG' }
];

export default function AdminPage() {
  const { config, loading, error, warning, updateConfig } = useRuntimeConfig();
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const backgroundImage =
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80';
  const [form, setForm] = useState({
    country: '',
    country_code: '',
    lat: '',
    lon: '',
    aq_radius: '',
    crops_indicator: '',
    crops_country: '',
    co2_countries: ''
  });

  useEffect(() => {
    if (!config) return;
    setForm({
      country: config.country,
      country_code: config.country_code,
      lat: String(config.lat),
      lon: String(config.lon),
      aq_radius: String(config.aq_radius),
      crops_indicator: config.crops_indicator,
      crops_country: config.crops_country,
      co2_countries: config.co2_countries.join(', ')
    });
  }, [config]);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const parsedAllowedCountries = useMemo(
    () =>
      form.co2_countries
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
    [form.co2_countries]
  );

  const allowedCountryOptions = useMemo(
    () =>
      getAllowedCountryPresets({
        country: form.country || config.country,
        country_code: form.country_code || config.country_code,
        lat: Number(form.lat) || config.lat,
        lon: Number(form.lon) || config.lon,
        aq_radius: Number(form.aq_radius) || config.aq_radius,
        crops_indicator: form.crops_indicator || config.crops_indicator,
        crops_country: form.crops_country || config.crops_country,
        co2_countries: parsedAllowedCountries.length ? parsedAllowedCountries : config.co2_countries
      }),
    [config, form, parsedAllowedCountries]
  );

  const onCountrySelect = (countryName: string) => {
    const selected = getCountryPreset(countryName, {
      country: form.country || config.country,
      country_code: form.country_code || config.country_code,
      lat: Number(form.lat) || config.lat,
      lon: Number(form.lon) || config.lon,
      aq_radius: Number(form.aq_radius) || config.aq_radius,
      crops_indicator: form.crops_indicator || config.crops_indicator,
      crops_country: form.crops_country || config.crops_country,
      co2_countries: parsedAllowedCountries.length ? parsedAllowedCountries : config.co2_countries
    });

    if (!selected) {
      onChange('country', countryName);
      return;
    }

    setForm((prev) => ({
      ...prev,
      country: selected.country,
      country_code: selected.country_code,
      lat: String(selected.lat),
      lon: String(selected.lon),
      aq_radius: String(selected.aq_radius),
      crops_country: selected.crops_country
    }));
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('');
    setSaving(true);

    const payload = {
      country: form.country.trim(),
      country_code: form.country_code.trim().toUpperCase(),
      lat: Number(form.lat),
      lon: Number(form.lon),
      aq_radius: Number(form.aq_radius),
      crops_indicator: form.crops_indicator,
      crops_country: form.crops_country.trim().toUpperCase(),
      co2_countries: form.co2_countries
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    };

    try {
      await updateConfig(payload);
      setStatus('Saved. Data caches cleared so the next visit loads the new location.');
    } catch {
      setStatus('Unable to save changes. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="relative z-10">
        <Navbar />
        <section className="section-container">
          <PageHeader
            eyebrow="Admin"
            title="Live location controls"
            subtitle="Update country focus and coordinates without redeploying. Changes apply immediately to live API calls."
            tone="light"
            country={form.country || config.country}
          />

        {warning && <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{warning}</div>}
        {error && <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
        {status && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{status}</div>}

        <SectionReveal from="up">
          <form onSubmit={onSubmit} className="mt-10 grid gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Selected country
                <select
                  value={form.country}
                  onChange={(event) => onCountrySelect(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
                >
                  {allowedCountryOptions.map((country) => (
                    <option key={country.country} value={country.country}>
                      {country.country}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Country code (ISO)
                <input
                  value={form.country_code}
                  onChange={(event) => onChange('country_code', event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Latitude
                <input
                  value={form.lat}
                  onChange={(event) => onChange('lat', event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Longitude
                <input
                  value={form.lon}
                  onChange={(event) => onChange('lon', event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Air quality radius (m)
                <input
                  value={form.aq_radius}
                  onChange={(event) => onChange('aq_radius', event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Crops indicator
                <select
                  value={form.crops_indicator}
                  onChange={(event) => onChange('crops_indicator', event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
                >
                  {INDICATOR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                Crops country code
                <input
                  value={form.crops_country}
                  onChange={(event) => onChange('crops_country', event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Allowed countries (comma separated)
              <input
                value={form.co2_countries}
                onChange={(event) => onChange('co2_countries', event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-900"
              />
              <span className="text-xs font-normal text-slate-500">
                Supported presets: {SUPPORTED_COUNTRY_NAMES.join(', ')}. The dropdown only shows the countries that are currently allowed.
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={loading || saving}
                className="rounded-full border border-emerald-200 bg-emerald-500 px-6 py-2 text-sm font-semibold text-white transition hover:border-emerald-300 hover:bg-emerald-600"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
              <p className="text-xs text-slate-500">These settings persist on the backend and update live API calls.</p>
            </div>
          </form>
        </SectionReveal>
        </section>
      </div>
    </main>
  );
}
