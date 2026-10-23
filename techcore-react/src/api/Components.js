import { http, ApiError } from './http.js';
import { Component } from '../models/Component.js';

const RESOURCE = '/components';
const EDITABLE = ['name', 'description', 'price', 'type', 'url', 'stock'];

const pick = (object, keys) => Object.fromEntries(keys.filter((key) => key in object).map((key) => [key, object[key]]));

/** All functions resolve with PLAIN objects. Writes are validated with the Component model first. */

export function list() {
  return http.get(RESOURCE);
}

export async function get(id) {
  try {
    return await http.get(`${RESOURCE}/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) throw new Error(`Component ${id} not found`);
    throw error;
  }
}

export function create(data) {
  const component = new Component(data); // validates + generates the id
  return http.post(RESOURCE, component.toJSON());
}

export async function update(id, changes) {
  const current = await get(id);
  const allowed = pick(changes, EDITABLE);
  const next = new Component({ ...current, ...allowed }).toJSON(); // validates the merged result
  return http.patch(`${RESOURCE}/${encodeURIComponent(id)}`, pick(next, Object.keys(allowed)));
}

/** amount > 0 adds, amount < 0 removes. Fails if the stock would go below 0. */
export async function modify_stock(id, amount) {
  const component = new Component(await get(id));
  component.modify_stock(amount);
  return http.patch(`${RESOURCE}/${encodeURIComponent(id)}`, { stock: component.stock });
}

export function remove(id) {
  return http.delete(`${RESOURCE}/${encodeURIComponent(id)}`);
}

// Object form so services can be tested by replacing a method.
export const ComponentsApi = { list, get, create, update, modify_stock, remove };
