import { useCallback, useMemo } from 'react';
import { ComponentsContext } from '../context/ComponentsContext.js';
import { ComponentsApi } from '../api/Components.js';
import { useResourceList } from '../hooks/useResourceList.js';

/**
 * Actions REJECT on validation / network errors: the caller (dialog, page) decides how to show them
 * (inside the dialog or with useNotify). The list in `components` is always plain objects.
 */
export function ComponentsProvider({ children }) {
  const { items, setItems, loading, error, reload } = useResourceList(ComponentsApi.list);

  const create = useCallback(async (data) => {
    const created = await ComponentsApi.create(data);
    setItems((current) => [...current, created]);
    return created;
  }, [setItems]);

  const update = useCallback(async (id, changes) => {
    const updated = await ComponentsApi.update(id, changes);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    return updated;
  }, [setItems]);

  const remove = useCallback(async (id) => {
    await ComponentsApi.remove(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, [setItems]);

  const modify_stock = useCallback(async (id, amount) => {
    const updated = await ComponentsApi.modify_stock(id, amount);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    return updated;
  }, [setItems]);

  const value = useMemo(
    () => ({ components: items, loading, error, reload, create, update, remove, modify_stock }),
    [items, loading, error, reload, create, update, remove, modify_stock],
  );

  return <ComponentsContext.Provider value={value}>{children}</ComponentsContext.Provider>;
}
