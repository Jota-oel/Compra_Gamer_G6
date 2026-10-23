import { createContext } from 'react';

/** Value is provided by provider/AuthProvider.jsx. Consume it with the matching hook in hooks/. */
export const AuthContext = createContext(null);
