import { DEFAULT_RUNTIME_CONFIG, RuntimeConfig } from '@/lib/runtimeConfigShared';

export interface CountryPreset {
  country: string;
  country_code: string;
  lat: number;
  lon: number;
  aq_radius: number;
  crops_country: string;
}

const COUNTRY_PRESETS: Record<string, CountryPreset> = {
  'South Africa': {
    country: 'South Africa',
    country_code: 'ZAF',
    lat: -26.2041,
    lon: 28.0473,
    aq_radius: 15000,
    crops_country: 'ZAF'
  },
  Kenya: {
    country: 'Kenya',
    country_code: 'KEN',
    lat: -1.286389,
    lon: 36.817223,
    aq_radius: 15000,
    crops_country: 'KEN'
  },
  India: {
    country: 'India',
    country_code: 'IND',
    lat: 28.6139,
    lon: 77.209,
    aq_radius: 15000,
    crops_country: 'IND'
  },
  Germany: {
    country: 'Germany',
    country_code: 'DEU',
    lat: 52.52,
    lon: 13.405,
    aq_radius: 15000,
    crops_country: 'DEU'
  }
};

export const SUPPORTED_COUNTRY_NAMES = Object.keys(COUNTRY_PRESETS);

function asCountryPreset(config: RuntimeConfig): CountryPreset {
  return {
    country: config.country,
    country_code: config.country_code,
    lat: config.lat,
    lon: config.lon,
    aq_radius: config.aq_radius,
    crops_country: config.crops_country
  };
}

export function getCountryPreset(countryName: string, config?: RuntimeConfig): CountryPreset | null {
  if (config && countryName === config.country) {
    return asCountryPreset(config);
  }

  return COUNTRY_PRESETS[countryName] ?? null;
}

export function getAllowedCountryPresets(config: RuntimeConfig): CountryPreset[] {
  const names = Array.from(
    new Set([...(config.co2_countries.length ? config.co2_countries : DEFAULT_RUNTIME_CONFIG.co2_countries), config.country].filter(Boolean))
  );

  return names
    .map((countryName) => getCountryPreset(countryName, config))
    .filter((preset): preset is CountryPreset => preset !== null);
}
