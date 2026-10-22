import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext.js';

/** const { notify } = useNotify();  notify('Saved', 'success')  // severity: success | info | warning | error */
export function useNotify() {
  const value = useContext(NotificationContext);
  if (value === null) throw new Error('useNotify must be used inside <NotificationProvider> (see provider/AppProviders.jsx)');
  return value;
}
