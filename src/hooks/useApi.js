import { useState, useEffect, useCallback } from 'react';

/**
 * A simple hook for fetching data from the API.
 * Returns { data, loading, error, refetch }.
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err?.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [fetcher, ...deps]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook for lazy fetching (on demand).
 */
export function useLazyApi(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetcher(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err?.message || 'Terjadi kesalahan');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetcher],
  );

  return { data, loading, error, execute };
}
