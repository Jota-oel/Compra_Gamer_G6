import { http, ApiError } from './http.js';

/**
 * ASSUMPTION: users look like { id, name, email, password, role: 'admin' | 'user' }.
 * Passwords are plain text because this JSON only EMULATES a backend: never do this for real.
 * If the project already has its own api/Users.js, merge it with this one.
 */
const RESOURCE = '/users';

/** Resolves with the user WITHOUT the password, or null when the credentials do not match. */
export async function find_by_credentials(email, password) {
  const rows = await http.get(`${RESOURCE}?email=${encodeURIComponent(email)}`);
  const user = rows.find((row) => row.password === password);
  if (!user) return null;
  const { password: _password, ...safe_user } = user;
  return safe_user;
}

/** Resolves with the user WITHOUT the password, or null when it does not exist (used to restore the session). */
export async function get_public(id) {
  try {
    const { password: _password, ...safe_user } = await http.get(`${RESOURCE}/${encodeURIComponent(id)}`);
    return safe_user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export const UsersApi = { find_by_credentials, get_public };
