import { useContext } from 'react';
import { ComputersContext } from '../context/ComputersContext.js';

export function useComputers() {
  const value = useContext(ComputersContext);
  if (value === null) throw new Error('useComputers must be used inside <ComputersProvider> (see provider/AppProviders.jsx)');
  return value;
}
