import { http } from './http.js';

const RESOURCE = '/orders';

/** order: { id, userId, lines: [{ id, name, price, quantity }], total, createdAt } */
export function create(order) {
  return http.post(RESOURCE, order);
}

export function list() {
  return http.get(RESOURCE);
}

export const OrdersApi = { create, list };
