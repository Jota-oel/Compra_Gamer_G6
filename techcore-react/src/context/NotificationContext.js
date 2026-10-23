import { createContext } from 'react';

/** Value is provided by provider/NotificationProvider.jsx. Consume it with the matching hook in hooks/. */
export const NotificationContext = createContext(null);
