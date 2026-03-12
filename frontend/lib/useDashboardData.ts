'use client';

import { useEffect, useState } from 'react';
import { AirQualityPoint, ClimatePoint, Co2Point, CropPoint, PredictionPoint } from '@/lib/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000';

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
        endpoints.map((endpoint) => fetch(`${BACKEND_URL}/api/${endpoint}`).then((r) => r.json()))
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
        setError('Unable to connect to backend API. Please verify deployment and API URL.');
      }

      setLoading(false);
    };

    load().catch(() => {
      if (!mounted) return;
      setError('Unable to load data right now.');
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { ...data, loading, error };
}
