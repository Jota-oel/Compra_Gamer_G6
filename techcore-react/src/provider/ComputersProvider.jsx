import { useCallback, useMemo } from 'react';
import { ComputersContext } from '../context/ComputersContext.js';
import { ComputersApi } from '../api/Computers.js';
import { build_computer as build_computer_service } from '../services/inventory.js';
import { useComponents } from '../hooks/useComponents.js';
import { useResourceList } from '../hooks/useResourceList.js';

export function ComputersProvider({ children }) {
  const { items, setItems, loading, error, reload } = useResourceList(ComputersApi.list);
  const { reload: reload_components } = useComponents();

  /**
   * Builds `data.stock` units from catalog components (see services/inventory.js):
   * checks essentials and stock, discounts the parts, stores the computer, rolls back on failure.
   * data: { name, type, stock, price?, url? }   component_ids: string[]
   */
  const build_computer = useCallback(async (data, component_ids) => {
    const created = await build_computer_service(data, component_ids);
    setItems((current) => [...current, created]);
    reload_components(); // the parts lost stock
    return created;
  }, [setItems, reload_components]);

  const update = useCallback(async (id, changes) => {
    const updated = await ComputersApi.update(id, changes);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...updated } : item)));
    return updated;
  }, [setItems]);

  const remove = useCallback(async (id) => {
    await ComputersApi.remove(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, [setItems]);

  const value = useMemo(
    () => ({ computers: items, loading, error, reload, build_computer, update, remove }),
    [items, loading, error, reload, build_computer, update, remove],
  );

  return <ComputersContext.Provider value={value}>{children}</ComputersContext.Provider>;
}
