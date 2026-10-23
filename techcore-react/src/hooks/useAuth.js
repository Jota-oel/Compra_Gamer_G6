import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.js';

export function useAuth() {
  const value = useContext(AuthContext);
  if (value === null) throw new Error('useAuth must be used inside <AuthProvider> (see provider/AppProviders.jsx)');
  return value;
}
