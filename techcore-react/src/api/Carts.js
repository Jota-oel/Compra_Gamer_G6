import { http, ApiError } from './http.js';

/** One cart per logged-in user: { id: 'CART-<userId>', userId, lines: [{ id, name, price, url, quantity }], updatedAt } */
const RESOURCE = '/carts';
const cart_path = (user_id) => `${RESOURCE}/${encodeURIComponent(`CART-${user_id}`)}`;

/** Resolves with the stored cart, or null when the user has none yet. */
export async function get(user_id) {
  try {
    return await http.get(cart_path(user_id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Creates or replaces the user's cart. Call it one at a time per user (CartProvider queues the calls). */
export async function save(user_id, lines) {
  const body = { id: `CART-${user_id}`, userId: user_id, lines, updatedAt: new Date().toISOString() };
  return (await get(user_id)) ? http.put(cart_path(user_id), body) : http.post(RESOURCE, body);
}

export const CartsApi = { get, save };
