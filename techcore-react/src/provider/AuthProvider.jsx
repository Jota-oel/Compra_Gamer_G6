import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext.js';
import { SessionApi } from '../api/Session.js';
import { UsersApi } from '../api/Users.js';
import { useNotify } from '../hooks/useNotify.js';

/**
 * The session lives in the JSON (api/Session.js), not in localStorage.
 * `ready` is false until the stored session has been read: wait for it before redirecting to /login.
 */
export function AuthProvider({ children }) {
  const { notify } = useNotify();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { userId } = await SessionApi.get();
        const restored = userId ? await UsersApi.get_public(userId) : null;
        if (active) setUser(restored);
      } catch {
        // API down or session unreadable: start logged out (the data providers report the API error)
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  /** Rejects with Error('Invalid email or password') or a network error. Resolves with the user. */
  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const found = await UsersApi.find_by_credentials(email, password);
      if (!found) throw new Error('Invalid email or password');
      await SessionApi.set(found.id);
      setUser(found);
      return found;
    } finally {
      setLoading(false);
    }
  }, []);

  /** The user is logged out immediately; closing the stored session happens in the background. */
  const logout = useCallback(async () => {
    setUser(null);
    try {
      await SessionApi.set(null);
    } catch {
      notify('Could not close the session on the server', 'error');
    }
  }, [notify]);

  const value = useMemo(
    () => ({ user, ready, isAuthenticated: user !== null, isAdmin: user?.role === 'admin', loading, login, logout }),
    [user, ready, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
