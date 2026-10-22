import { http, ApiError } from './http.js';
import { Computer } from '../models/Computer.js';

const RESOURCE = '/computers';
const EDITABLE = ['name', 'description', 'price', 'type', 'url', 'stock'];

const pick = (object, keys) => Object.fromEntries(keys.filter((key) => key in object).map((key) => [key, object[key]]));

/**
 * All functions resolve with PLAIN objects. To build a NEW computer from components
 * (stock discount + essentials check) use services/inventory.js, not create().
 */

export function list() {
  return http.get(RESOURCE);
}

export async function get(id) {
  try {
    return await http.get(`${RESOURCE}/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) throw new Error(`Computer ${id} not found`);
    throw error;
  }
}

/** Stores an already built computer (plain object from Computer.create_computer(...).toJSON()). */
export function create(data) {
  const computer = new Computer(data); // validates
  return http.post(RESOURCE, computer.toJSON());
}

export async function update(id, changes) {
  const current = await get(id);
  const allowed = pick(changes, EDITABLE);
  const next = new Computer({ ...current, ...allowed }).toJSON(); // validates the merged result
  return http.patch(`${RESOURCE}/${encodeURIComponent(id)}`, pick(next, Object.keys(allowed)));
}

export async function modify_stock(id, amount) {
  const computer = new Computer(await get(id));
  computer.modify_stock(amount);
  return http.patch(`${RESOURCE}/${encodeURIComponent(id)}`, { stock: computer.stock });
}

export function remove(id) {
  return http.delete(`${RESOURCE}/${encodeURIComponent(id)}`);
}

export const ComputersApi = { list, get, create, update, modify_stock, remove };
