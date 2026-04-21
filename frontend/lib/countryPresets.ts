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
  },
  Nigeria: {
    country: 'Nigeria',
    country_code: 'NGA',
    lat: 9.0765,
    lon: 7.3986,
    aq_radius: 15000,
    crops_country: 'NGA'
  },
  Egypt: {
    country: 'Egypt',
    country_code: 'EGY',
    lat: 30.0444,
    lon: 31.2357,
    aq_radius: 15000,
    crops_country: 'EGY'
  },
  Ethiopia: {
    country: 'Ethiopia',
    country_code: 'ETH',
    lat: 9.032,
    lon: 38.7469,
    aq_radius: 15000,
    crops_country: 'ETH'
  },
  Tanzania: {
    country: 'Tanzania',
    country_code: 'TZA',
    lat: -6.163,
    lon: 35.7516,
    aq_radius: 15000,
    crops_country: 'TZA'
  },
  Uganda: {
    country: 'Uganda',
    country_code: 'UGA',
    lat: 0.3476,
    lon: 32.5825,
    aq_radius: 15000,
    crops_country: 'UGA'
  },
  Brazil: {
    country: 'Brazil',
    country_code: 'BRA',
    lat: -15.7939,
    lon: -47.8828,
    aq_radius: 15000,
    crops_country: 'BRA'
  },
  Mexico: {
    country: 'Mexico',
    country_code: 'MEX',
    lat: 19.4326,
    lon: -99.1332,
    aq_radius: 15000,
    crops_country: 'MEX'
  },
  'United States': {
    country: 'United States',
    country_code: 'USA',
    lat: 38.9072,
    lon: -77.0369,
    aq_radius: 15000,
    crops_country: 'USA'
  },
  Canada: {
    country: 'Canada',
    country_code: 'CAN',
    lat: 45.4215,
    lon: -75.6972,
    aq_radius: 15000,
    crops_country: 'CAN'
  },
  France: {
    country: 'France',
    country_code: 'FRA',
    lat: 48.8566,
    lon: 2.3522,
    aq_radius: 15000,
    crops_country: 'FRA'
  },
  China: {
    country: 'China',
    country_code: 'CHN',
    lat: 39.9042,
    lon: 116.4074,
    aq_radius: 15000,
    crops_country: 'CHN'
  },
  Japan: {
    country: 'Japan',
    country_code: 'JPN',
    lat: 35.6762,
    lon: 139.6503,
    aq_radius: 15000,
    crops_country: 'JPN'
  },
  Australia: {
    country: 'Australia',
    country_code: 'AUS',
    lat: -35.2809,
    lon: 149.13,
    aq_radius: 15000,
    crops_country: 'AUS'
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

export function getSupportedCountryPresets(): CountryPreset[] {
  return SUPPORTED_COUNTRY_NAMES.map((countryName) => COUNTRY_PRESETS[countryName]);
}

export function getAllowedCountryPresets(config: RuntimeConfig): CountryPreset[] {
  const names = Array.from(
    new Set([...(config.co2_countries.length ? config.co2_countries : DEFAULT_RUNTIME_CONFIG.co2_countries), config.country].filter(Boolean))
  );

  return names
    .map((countryName) => getCountryPreset(countryName, config))
    .filter((preset): preset is CountryPreset => preset !== null);
}
