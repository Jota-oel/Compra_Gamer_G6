import { useMemo } from 'react';
import { filter_list } from '../utils/filters.js';

/**
 * useFilteredList(components, { type: 'gpu', text: 'asus' }) -> filtered array (memoized).
 * type: 'all' | one type | array of types. For totals use value_total() from utils/filters.js.
 */
export function useFilteredList(list, { type = 'all', text = '' } = {}) {
  return useMemo(() => filter_list(list, { type, text }), [list, type, text]);
}
