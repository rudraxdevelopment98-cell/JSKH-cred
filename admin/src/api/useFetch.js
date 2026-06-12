import { useCallback, useEffect, useState } from 'react';
import { api } from './client.js';

/**
 * Fetch `path` on mount and whenever `deps` change.
 * Returns { data, error, loading, reload }.
 */
export function useFetch(path, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api(path));
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, loading, reload: load };
}
