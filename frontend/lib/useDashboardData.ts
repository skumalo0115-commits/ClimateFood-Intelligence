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
const STORAGE_KEY = 'cfi_dashboard_cache_v2';
const CACHE_TTL_MS = 60 * 60 * 1000;

let memoryCache: { time: number; data: DashboardData } | null = null;

function readCache() {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryCache = null;
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as { time: number; data: DashboardData };
      if (!parsed?.time || !parsed?.data) return null;
      memoryCache = parsed;
      return parsed;
    } catch {
      return null;
    }
  }

  return memoryCache;
}

function writeCache(data: DashboardData) {
  const payload = { time: Date.now(), data };
  memoryCache = payload;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
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
    const cached = readCache();
    const cacheFresh = cached && Date.now() - cached.time < CACHE_TTL_MS;

    if (cached) {
      setData(cached.data);
      setLoading(false);
    }

    if (cacheFresh) {
      return () => {
        mounted = false;
      };
    }

    const fetchEndpoint = async (endpoint: (typeof ENDPOINTS)[number]) => {
      const response = await fetch(`/api/data/${endpoint}`, { cache: 'force-cache' });
      const payload = (await response.json()) as ProxyPayload;
      if (!response.ok) {
        throw new Error(payload.error || `HTTP ${response.status}`);
      }
      return payload;
    };

    const load = async () => {
      if (!cached) {
        setLoading(true);
      }
      setError('');
      const results = await Promise.allSettled(ENDPOINTS.map((endpoint) => fetchEndpoint(endpoint)));
      const unpack = (index: number) => (results[index].status === 'fulfilled' ? results[index].value?.data ?? [] : []);

      if (!mounted) return;

      const nextData: DashboardData = {
        climate: unpack(0) as ClimatePoint[],
        airQuality: unpack(1) as AirQualityPoint[],
        crops: unpack(2) as CropPoint[],
        co2: unpack(3) as Co2Point[],
        predictions: unpack(4) as PredictionPoint[]
      };

      if (results.every((entry) => entry.status === 'rejected')) {
        setError(
          cached
            ? 'Using saved data. Live API calls failed right now.'
            : 'Unable to retrieve data from backend API. Check backend deployment health and frontend/backend URL variables.'
        );
      } else {
        setError('');
      }

      setData(nextData);
      writeCache(nextData);
      setLoading(false);
    };

    load().catch(() => {
      if (!mounted) return;
      setError(cached ? 'Using saved data. Live API calls failed right now.' : 'Unable to load data right now. Please retry in a moment.');
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { ...data, loading, error };
}
