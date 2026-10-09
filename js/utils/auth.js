/**
 * Minimal login for the management portal (catalog.html).
 * The session lives in sessionStorage: it ends when the tab is closed.
 *
 * NOTE: this is front-end only. Anyone can read the credentials in the browser,
 * so it keeps casual visitors out but it is not real security (that needs a server).
 */
// SESSION_KEY / SESSION_VALUE must match the guard in <head> of pages/catalog.html
const SESSION_KEY = 'techcore:session';
const SESSION_VALUE = 'authenticated';

const AUTHORIZED_USER = Object.freeze({ email: 'pepe@gmail.com', password: '1234' });

/** Returns true (and starts the session) only for the authorized user. */
export function login(email, password) {
  const valid =
    String(email ?? '').trim().toLowerCase() === AUTHORIZED_USER.email &&
    String(password ?? '') === AUTHORIZED_USER.password;
  if (valid) {
    try {
      sessionStorage.setItem(SESSION_KEY, SESSION_VALUE);
    } catch (error) {
      console.error('Could not start the session:', error);
      return false;
    }
  }
  return valid;
}

export function is_authenticated() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === SESSION_VALUE;
  } catch {
    return false;
  }
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing to clear */
  }
}
