import { useContext } from 'react';
import { ComponentsContext } from '../context/ComponentsContext.js';

export function useComponents() {
  const value = useContext(ComponentsContext);
  if (value === null) throw new Error('useComponents must be used inside <ComponentsProvider> (see provider/AppProviders.jsx)');
  return value;
}
