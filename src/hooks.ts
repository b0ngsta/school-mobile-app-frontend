import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { api, peek } from './api';
import { getLang, setLang, subscribe, t } from './i18n';

// Re-renders the component when the language changes.
// const { t, lang, setLang } = useI18n();
export function useI18n() {
  const [, force] = useState(0);
  useEffect(() => subscribe(() => force(x => x + 1)), []);
  return { t, lang: getLang(), setLang };
}

// True while the OS asks for less motion (iOS "Reduce Motion", Android
// "Remove animations") — skip decorative animations then.
export function useReduceMotion(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(
      enabled => {
        if (mounted) setReduceMotion(enabled);
      },
      () => {},
    );
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return reduceMotion;
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
// Opens with the last cached response for `path` (if any) and refreshes it in
// the background, so `loading` is only true when there is nothing to show yet.
export function useApi<T = any>(path: string): UseApiResult<T> {
  const [data, setData] = useState<T | null>(() => peek<T>(path));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(() => peek(path) === null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else {
        const cached = peek<T>(path);
        if (cached !== null) setData(cached);
        setLoading(cached === null);
      }
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
