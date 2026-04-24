'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CONFIG_STORAGE_KEY,
  CONFIG_TTL_MS,
  CONFIG_UPDATE_KEY,
  CONFIG_UPDATED_EVENT,
  DEFAULT_RUNTIME_CONFIG,
  RuntimeConfig,
  markRuntimeConfigUpdated,
  normalizeRuntimeConfig
} from '@/lib/runtimeConfigShared';

let memoryCache: { time: number; data: RuntimeConfig } | null = null;

function readCachedConfig() {
  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      memoryCache = null;
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as { time: number; data: RuntimeConfig };
      if (!parsed?.time || !parsed?.data) return null;
      memoryCache = parsed;
      return parsed;
    } catch {
      return null;
    }
  }

  return memoryCache;
}

function writeCachedConfig(data: RuntimeConfig) {
  const payload = { time: Date.now(), data };
  memoryCache = payload;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(payload));
  }
}

export function useRuntimeConfig() {
  const [config, setConfig] = useState<RuntimeConfig>(DEFAULT_RUNTIME_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const refreshConfig = useCallback(async (force = false) => {
    const cached = readCachedConfig();
    const isFresh = cached && Date.now() - cached.time < CONFIG_TTL_MS;

    if (cached && !force) {
      setConfig(normalizeRuntimeConfig(cached.data));
      setLoading(false);
      if (isFresh) return;
    }

    try {
      const response = await fetch('/api/config', { cache: 'no-store' });
      const body = await response.json();
      const next = normalizeRuntimeConfig(body?.data ?? body);
      if (body?.warning) {
        setWarning(body.warning);
      } else {
        setWarning('');
      }
      if (!response.ok && !body?.data) {
        throw new Error(body?.error || 'Unable to load config');
      }
      writeCachedConfig(next);
      setConfig(next);
      setError('');
    } catch {
      setWarning(cached ? 'Using saved config. Backend unreachable right now.' : 'Using default config until the backend is reachable.');
      setError('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromCache = () => {
      const cached = readCachedConfig();
      if (!cached?.data) return;
      setConfig(normalizeRuntimeConfig(cached.data));
      setLoading(false);
    };

    const onConfigUpdated = () => {
      syncFromCache();
      setError('');
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === CONFIG_STORAGE_KEY || event.key === CONFIG_UPDATE_KEY) {
        syncFromCache();
      }
    };

    window.addEventListener(CONFIG_UPDATED_EVENT, onConfigUpdated as EventListener);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener(CONFIG_UPDATED_EVENT, onConfigUpdated as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const updateConfig = useCallback(async (payload: Partial<RuntimeConfig>) => {
    setLoading(true);
    setError('');
    setWarning('');
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || 'Unable to update config');
      }
      const next = normalizeRuntimeConfig(body?.data ?? body);
      if (body?.warning) {
        setWarning(body.warning);
      } else {
        setWarning('');
      }
      writeCachedConfig(next);
      setConfig(next);
      markRuntimeConfigUpdated();
      setLoading(false);
      return next;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to update config';
      setError(message);
      setLoading(false);
      throw err;
    }
  }, []);

  return { config, loading, error, warning, refreshConfig, updateConfig };
}
