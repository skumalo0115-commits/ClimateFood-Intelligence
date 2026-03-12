'use client';

import { useEffect, useState } from 'react';
import { AirQualityPoint, ClimatePoint, Co2Point, CropPoint, PredictionPoint } from '@/lib/types';

interface DashboardData {
  climate: ClimatePoint[];
  airQuality: AirQualityPoint[];
  crops: CropPoint[];
  co2: Co2Point[];
  predictions: PredictionPoint[];
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    climate: [],
    airQuality: [],
    crops: [],
    co2: [],
    predictions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');

      const endpoints = ['climate', 'air-quality', 'crops', 'co2', 'predict'];
      const results = await Promise.allSettled(
        endpoints.map(async (endpoint) => {
          const response = await fetch(`/api/data/${endpoint}`);
          const payload = await response.json();
          if (!response.ok) {
            throw new Error(payload?.error || `HTTP ${response.status}`);
          }
          return payload;
        })
      );

      const unpack = (index: number) => (results[index].status === 'fulfilled' ? results[index].value?.data ?? [] : []);

      if (!mounted) return;

      setData({
        climate: unpack(0),
        airQuality: unpack(1),
        crops: unpack(2),
        co2: unpack(3),
        predictions: unpack(4)
      });

      if (results.every((entry) => entry.status === 'rejected')) {
        setError('Unable to retrieve data from backend API. Check backend deployment health and frontend/backend URL variables.');
      }

      setLoading(false);
    };

    load().catch(() => {
      if (!mounted) return;
      setError('Unable to load data right now. Please retry in a moment.');
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { ...data, loading, error };
}
