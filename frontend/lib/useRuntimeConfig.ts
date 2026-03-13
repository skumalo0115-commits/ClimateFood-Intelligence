'use client';

import { useCallback, useEffect, useState } from 'react';

export interface RuntimeConfig {
  country: string;
  country_code: string;
  lat: number;
  lon: number;
  aq_radius: number;
  crops_indicator: string;
  crops_country: string;
  co2_countries: string[];
}

const DEFAULT_CONFIG: RuntimeConfig = {
  country: 'South Africa',
  country_code: 'ZAF',
  lat: -26.2041,
  lon: 28.0473,
  aq_radius: 15000,
  crops_indicator: 'AG.YLD.MAIZ.KG',
  crops_country: 'ZAF',
  co2_countries: ['South Africa', 'Kenya', 'India', 'Germany']
};

const CONFIG_STORAGE_KEY = 'cfi_runtime_config_v1';
const CONFIG_TTL_MS = 6 * 60 * 60 * 1000;

let memoryCache: { time: number; data: RuntimeConfig } | null = null;

function normalizeConfig(input: Partial<RuntimeConfig> | undefined | null): RuntimeConfig {
  if (!input) return { ...DEFAULT_CONFIG };

  return {
    country: input.country ?? DEFAULT_CONFIG.country,
    country_code: input.country_code ?? DEFAULT_CONFIG.country_code,
    lat: typeof input.lat === 'number' ? input.lat : DEFAULT_CONFIG.lat,
    lon: typeof input.lon === 'number' ? input.lon : DEFAULT_CONFIG.lon,
    aq_radius: typeof input.aq_radius === 'number' ? input.aq_radius : DEFAULT_CONFIG.aq_radius,
    crops_indicator: input.crops_indicator ?? DEFAULT_CONFIG.crops_indicator,
    crops_country: input.crops_country ?? DEFAULT_CONFIG.crops_country,
    co2_countries: Array.isArray(input.co2_countries) && input.co2_countries.length > 0 ? input.co2_countries : DEFAULT_CONFIG.co2_countries
  };
}

function readCachedConfig() {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      memoryCache = null;
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as { time: number; data: RuntimeConfig };
      if (!parsed?.time || !parsed?.data) return null;
      memoryCache = parsed;
      return parsed;
    } catch {
      return null;
    }
  }

  return memoryCache;
}

function writeCachedConfig(data: RuntimeConfig) {
  const payload = { time: Date.now(), data };
  memoryCache = payload;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(payload));
  }
}

export function useRuntimeConfig() {
  const [config, setConfig] = useState<RuntimeConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshConfig = useCallback(async (force = false) => {
    const cached = readCachedConfig();
    const isFresh = cached && Date.now() - cached.time < CONFIG_TTL_MS;

    if (cached && !force) {
      setConfig(normalizeConfig(cached.data));
      setLoading(false);
      if (isFresh) return;
    }

    try {
      const response = await fetch('/api/config', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || 'Unable to load config');
      }
      const next = normalizeConfig(body?.data ?? body);
      writeCachedConfig(next);
      setConfig(next);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load config';
      if (!cached) {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const updateConfig = useCallback(async (payload: Partial<RuntimeConfig>) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || 'Unable to update config');
      }
      const next = normalizeConfig(body?.data ?? body);
      writeCachedConfig(next);
      setConfig(next);
      setLoading(false);
      return next;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update config';
      setError(message);
      setLoading(false);
      throw err;
    }
  }, []);

  return { config, loading, error, refreshConfig, updateConfig };
}
