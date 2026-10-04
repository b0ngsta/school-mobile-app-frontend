import { useCallback, useEffect, useState } from 'react';
import { api } from './api';
import { getLang, setLang, subscribe, t } from './i18n';

// Re-renders the component when the language changes.
// const { t, lang, setLang } = useI18n();
export function useI18n() {
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force(x => x + 1)), []);
  return { t, lang: getLang(), setLang };
}

export interface UseApiResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  refresh: () => void;
}

// Standard data-loading hook:
// const { data, error, loading, refresh } = useApi<HomeworkItem[]>('/student/homework')
export function useApi<T = any>(path: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        setData(await api<T>(path));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [path],
  );

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, refreshing, refresh: () => load(true) };
}
