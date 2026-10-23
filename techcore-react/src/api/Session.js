import { http } from './http.js';

/**
 * Who is logged in, kept in the JSON as a single `session` object: { userId: string | null }.
 * It emulates a server-side session (no localStorage). Fine for a demo with one browser at a time.
 */
export function get() {
  return http.get('/session');
}

export function set(user_id) {
  return http.put('/session', { userId: user_id });
}

export const SessionApi = { get, set };
