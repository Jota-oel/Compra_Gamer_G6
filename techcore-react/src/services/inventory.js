/**
 * Operations that touch SEVERAL resources. The JSON API has no transactions, so each
 * operation: 1) re-reads fresh data, 2) validates, 3) writes step by step remembering what
 * it did, 4) undoes (compensates) the steps already done if a later one fails.
 *
 * They talk to the api through the ComponentsApi / ComputersApi / OrdersApi objects (not
 * destructured), so a test can replace a method to simulate a failure.
 */
import { ComponentsApi } from '../api/Components.js';
import { ComputersApi } from '../api/Computers.js';
import { OrdersApi } from '../api/Orders.js';
import { Computer } from '../models/Computer.js';
import { generate_id } from '../utils/id.js';

/** Runs every undo action; if any fails, the original error says the stock needs checking. */
async function rollback(undo_actions, error) {
  const results = await Promise.allSettled(undo_actions.map((undo) => undo()));
  if (results.some((result) => result.status === 'rejected')) {
    error.message += ' (the stock rollback was incomplete: reload and verify the stock)';
  }
}

/**
 * Builds `data.stock` units of a computer from catalog components.
 * data: { name, type, stock?, price?, url? }   component_ids: string[]
 * Throws: missing essentials, not enough stock, unknown component, network errors.
 * Resolves with the stored computer (plain object).
 */
export async function build_computer(data, component_ids) {
  const ids = [...new Set(component_ids)];
  const units = data.stock ?? 0;

  const components = await Promise.all(ids.map((id) => ComponentsApi.get(id))); // fresh stock
  const short = components.filter((component) => component.stock < units).map((component) => component.name);
  if (short.length > 0) throw new Error(`Not enough stock to build ${units} unit(s): ${short.join(', ')}`);

  const computer = Computer.create_computer(data, components); // throws if essentials are missing

  const done = [];
  try {
    if (units > 0) {
      for (const component of components) {
        await ComponentsApi.modify_stock(component.id, -units);
        done.push(component.id);
      }
    }
    return await ComputersApi.create(computer.toJSON());
  } catch (error) {
    await rollback(done.map((id) => () => ComponentsApi.modify_stock(id, units)), error);
    throw error;
  }
}

/**
 * lines: [{ id, name, price, url, quantity }] (cart lines)   user: { id } | null
 * Re-reads every computer, checks stock, discounts it, stores the order with CURRENT prices.
 * Resolves with the order.
 */
export async function checkout(lines, user = null) {
  if (lines.length === 0) throw new Error('The cart is empty');

  const fresh = await Promise.all(lines.map((line) => ComputersApi.get(line.id)));
  const problems = lines
    .map((line, index) => (fresh[index].stock < line.quantity ? `${fresh[index].name}: only ${fresh[index].stock} available` : null))
    .filter(Boolean);
  if (problems.length > 0) throw new Error(`Not enough stock. ${problems.join('; ')}`);

  const done = [];
  try {
    for (const line of lines) {
      await ComputersApi.modify_stock(line.id, -line.quantity);
      done.push(line);
    }
    const order_lines = lines.map((line, index) => ({
      id: line.id, name: fresh[index].name, price: fresh[index].price, quantity: line.quantity,
    }));
    return await OrdersApi.create({
      id: generate_id('ORD'),
      userId: user?.id ?? null,
      lines: order_lines,
      total: order_lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    await rollback(done.map((line) => () => ComputersApi.modify_stock(line.id, line.quantity)), error);
    throw error;
  }
}
