export interface ClimatePoint {
  date: string;
  temperature: number;
  precipitation: number;
}

export interface AirQualityPoint {
  date: string;
  pm10: number;
  pm2_5: number;
}

export interface CropPoint {
  year: number;
  item: string;
  value: number;
}

export interface Co2Point {
  country: string;
  year: number;
  co_emissions_per_capita: number;
}

export interface PredictionPoint {
  scenario: number;
  predicted_yield: number;
}
