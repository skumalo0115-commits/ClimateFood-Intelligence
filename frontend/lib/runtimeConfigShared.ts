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

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  country: 'South Africa',
  country_code: 'ZAF',
  lat: -26.2041,
  lon: 28.0473,
  aq_radius: 15000,
  crops_indicator: 'AG.YLD.MAIZ.KG',
  crops_country: 'ZAF',
  co2_countries: ['South Africa', 'Kenya', 'India', 'Germany']
};

export const CONFIG_STORAGE_KEY = 'cfi_runtime_config_v1';
export const DASHBOARD_STORAGE_KEY = 'cfi_dashboard_cache_v2';
export const CONFIG_UPDATE_KEY = 'cfi_config_updated_at';
export const CONFIG_UPDATED_EVENT = 'cfi:config-updated';
export const CONFIG_TTL_MS = 6 * 60 * 60 * 1000;

export function normalizeRuntimeConfig(input: Partial<RuntimeConfig> | undefined | null): RuntimeConfig {
  if (!input) return { ...DEFAULT_RUNTIME_CONFIG };

  return {
    country: input.country ?? DEFAULT_RUNTIME_CONFIG.country,
    country_code: input.country_code ?? DEFAULT_RUNTIME_CONFIG.country_code,
    lat: typeof input.lat === 'number' ? input.lat : DEFAULT_RUNTIME_CONFIG.lat,
    lon: typeof input.lon === 'number' ? input.lon : DEFAULT_RUNTIME_CONFIG.lon,
    aq_radius: typeof input.aq_radius === 'number' ? input.aq_radius : DEFAULT_RUNTIME_CONFIG.aq_radius,
    crops_indicator: input.crops_indicator ?? DEFAULT_RUNTIME_CONFIG.crops_indicator,
    crops_country: input.crops_country ?? DEFAULT_RUNTIME_CONFIG.crops_country,
    co2_countries:
      Array.isArray(input.co2_countries) && input.co2_countries.length > 0 ? input.co2_countries : DEFAULT_RUNTIME_CONFIG.co2_countries
  };
}

export function markRuntimeConfigUpdated() {
  if (typeof window === 'undefined') return;

  const updatedAt = Date.now();
  window.localStorage.removeItem(DASHBOARD_STORAGE_KEY);
  window.localStorage.setItem(CONFIG_UPDATE_KEY, String(updatedAt));
  window.dispatchEvent(new CustomEvent(CONFIG_UPDATED_EVENT, { detail: { updatedAt } }));
}
