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

interface ProxyPayload {
  data?: unknown[];
  error?: string;
}

const ENDPOINTS = ['climate', 'air-quality', 'crops', 'co2', 'predict'] as const;

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

  // Legacy safety alias to avoid stale build references to normalizedBackendUrl.
  const normalizedBackendUrl = '/api/data';

  useEffect(() => {
    let mounted = true;

    const fetchEndpoint = async (endpoint: (typeof ENDPOINTS)[number]) => {
      const response = await fetch(`/api/data/${endpoint}`);
      const payload = (await response.json()) as ProxyPayload;
      if (!response.ok) {
        throw new Error(payload.error || `HTTP ${response.status}`);
      }
      return payload;
    };

    const load = async () => {
      setLoading(true);
      setError('');

      const results = await Promise.allSettled(ENDPOINTS.map((endpoint) => fetchEndpoint(endpoint)));
      const unpack = (index: number) => (results[index].status === 'fulfilled' ? results[index].value?.data ?? [] : []);

      if (!mounted) return;

      setData({
        climate: unpack(0) as ClimatePoint[],
        airQuality: unpack(1) as AirQualityPoint[],
        crops: unpack(2) as CropPoint[],
        co2: unpack(3) as Co2Point[],
        predictions: unpack(4) as PredictionPoint[]
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
