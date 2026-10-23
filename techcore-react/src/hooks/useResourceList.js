import { useCallback, useEffect, useState } from 'react';

/**
 * Loads a list once and exposes it with loading / error state.
 * - `loading` is true only until the FIRST response (no flicker on later reloads).
 * - `reload()` refreshes silently; on failure `error` is set and the previous items are kept.
 * fetch_list must be a stable reference (e.g. ComponentsApi.list).
 */
export function useResourceList(fetch_list) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true;
    fetch_list()
      .then((rows) => {
        if (!active) return;
        setItems(rows);
        setError(null);
      })
      .catch((failure) => {
        if (active) setError(failure);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetch_list, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  return { items, setItems, loading, error, reload };
}
