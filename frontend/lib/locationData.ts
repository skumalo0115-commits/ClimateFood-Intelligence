export interface LocationOption {
  label: string;
  lat: number;
  lon: number;
  note: string;
}

export const recommendedLocations: Record<string, LocationOption[]> = {
  'South Africa': [
    {
      label: 'Johannesburg',
      lat: -26.2041,
      lon: 28.0473,
      note: 'High coverage climate station; strong maize production history.'
    },
    {
      label: 'Pietermaritzburg',
      lat: -29.6000,
      lon: 30.3833,
      note: 'Good rainfall patterns for late-season crops.'
    },
    {
      label: 'Durban',
      lat: -29.8587,
      lon: 31.0218,
      note: 'Coastal harvest zone with higher humidity and stable weather data.'
    }
  ],
  Kenya: [
    {
      label: 'Nairobi',
      lat: -1.2921,
      lon: 36.8219,
      note: 'Central hub with reliable climate reporting.'
    },
    {
      label: 'Eldoret',
      lat: 0.5167,
      lon: 35.2833,
      note: 'Important maize-growing highland region.'
    },
    {
      label: 'Kisumu',
      lat: -0.0917,
      lon: 34.7680,
      note: 'Lake region with strong crop moisture context.'
    }
  ],
  India: [
    {
      label: 'New Delhi',
      lat: 28.6139,
      lon: 77.209,
      note: 'Major climate station with national reporting.'
    },
    {
      label: 'Patna',
      lat: 25.5941,
      lon: 85.1376,
      note: 'Agricultural plain with strong food production significance.'
    },
    {
      label: 'Nagpur',
      lat: 21.1458,
      lon: 79.0882,
      note: 'Central India area with crop-relevant weather trends.'
    }
  ],
  Germany: [
    {
      label: 'Berlin',
      lat: 52.52,
      lon: 13.405,
      note: 'Capital region with high-quality climate monitoring.'
    },
    {
      label: 'Hamburg',
      lat: 53.5511,
      lon: 9.9937,
      note: 'Northern region with maritime weather influences.'
    },
    {
      label: 'Munich',
      lat: 48.1351,
      lon: 11.582,
      note: 'Southern region with alpine-influenced climate data.'
    }
  ]
};
