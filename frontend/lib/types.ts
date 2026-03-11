export type ThemeMode = 'dark' | 'light' | 'gradient';

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
