// Contract check for the data layer (api/ + services/). Needs the API running: `npm run api`.
// It WRITES to data.json: run `npm run db:reset` afterwards.
import { ComponentsApi } from '../src/api/Components.js';
import { ComputersApi } from '../src/api/Computers.js';
import { OrdersApi } from '../src/api/Orders.js';
import { UsersApi } from '../src/api/Users.js';
import { SessionApi } from '../src/api/Session.js';
import { CartsApi } from '../src/api/Carts.js';
import { build_computer, checkout } from '../src/services/inventory.js';

let passed = 0;
let failed = 0;
const check = (name, condition) => {
  if (condition) { passed += 1; console.log(`  ok   ${name}`); } else { failed += 1; console.log(`  FAIL ${name}`); }
};
const rejects = async (fn) => { try { await fn(); return null; } catch (error) { return error; } };
const stock_of = async (ids) => Promise.all(ids.map(async (id) => (await ComponentsApi.get(id)).stock));

const OFFICE = ['PRD-1002', 'PRD-1004', 'PRD-1006', 'PRD-1007', 'PRD-1011', 'PRD-1013'];

console.log('\nreads');
check('13 components / 8 computers in the seed', (await ComponentsApi.list()).length >= 13 && (await ComputersApi.list()).length >= 8);

console.log('\ncomponents CRUD + validation');
const created = await ComponentsApi.create({ name: 'Test RAM', description: 'x', price: 10, stock: 5, type: 'ram' });
check('create generates an id', created.id.startsWith('PRD-'));
check('update validates and patches', (await ComponentsApi.update(created.id, { price: 12 })).price === 12);
check('update with a negative price is rejected', (await rejects(() => ComponentsApi.update(created.id, { price: -1 })))?.message.includes('price'));
check('...and nothing changed', (await ComponentsApi.get(created.id)).price === 12);
check('create with an invalid type is rejected', (await rejects(() => ComponentsApi.create({ name: 'x', price: 1, type: 'fan' }))) !== null);
check('modify_stock -2', (await ComponentsApi.modify_stock(created.id, -2)) .stock === 3);
check('modify_stock below 0 is rejected', (await rejects(() => ComponentsApi.modify_stock(created.id, -99)))?.message.includes('Not enough stock'));
await ComponentsApi.remove(created.id);
check('get after remove -> "not found"', (await rejects(() => ComponentsApi.get(created.id)))?.message.includes('not found'));

console.log('\nbuild_computer');
const before = await stock_of(OFFICE);
check('gaming without GPU is rejected', (await rejects(() => build_computer({ name: 'X', type: 'gaming', stock: 1 }, OFFICE)))?.message.includes('gpu'));
check('...and no stock was touched', JSON.stringify(await stock_of(OFFICE)) === JSON.stringify(before));
check('not enough stock is rejected', (await rejects(() => build_computer({ name: 'X', type: 'office', stock: 9999 }, OFFICE)))?.message.includes('Not enough stock'));
const pc = await build_computer({ name: 'Smoke Office', type: 'office', stock: 2 }, OFFICE);
check('office PC built (price = sum of parts)', pc.id.startsWith('PC-') && pc.price === 380 + 140 + 55 + 110 + 45 + 60);
check('each part lost 2 units', JSON.stringify(await stock_of(OFFICE)) === JSON.stringify(before.map((s) => s - 2)));
const original_create = ComputersApi.create;
ComputersApi.create = async () => { throw new Error('boom'); };
const failure = await rejects(() => build_computer({ name: 'Will fail', type: 'office', stock: 1 }, OFFICE));
ComputersApi.create = original_create;
check('a failure at the last step reaches the caller', failure?.message === 'boom');
check('...and the stock was rolled back', JSON.stringify(await stock_of(OFFICE)) === JSON.stringify(before.map((s) => s - 2)));

console.log('\ncheckout');
const line = { id: pc.id, name: pc.name, price: pc.price, url: '', quantity: 2 };
check('empty cart is rejected', (await rejects(() => checkout([])))?.message.includes('empty'));
check('quantity over the stock is rejected', (await rejects(() => checkout([{ ...line, quantity: 99 }])))?.message.includes('only 2 available'));
const original_order = OrdersApi.create;
OrdersApi.create = async () => { throw new Error('orders down'); };
const order_failure = await rejects(() => checkout([line], { id: 'USR-2' }));
OrdersApi.create = original_order;
check('failure while saving the order restores the stock', order_failure?.message === 'orders down' && (await ComputersApi.get(pc.id)).stock === 2);
const order = await checkout([line], { id: 'USR-2' });
check('checkout stores the order with the total', order.total === pc.price * 2 && order.userId === 'USR-2');
check('...and discounts the computer stock', (await ComputersApi.get(pc.id)).stock === 0);
check('orders are listed', (await OrdersApi.list()).some((row) => row.id === order.id));

console.log('\nusers');
const admin = await UsersApi.find_by_credentials('admin@techcore.com', 'admin123');
check('valid credentials -> user without password', admin?.role === 'admin' && !('password' in admin));
check('wrong password -> null', (await UsersApi.find_by_credentials('admin@techcore.com', 'nope')) === null);

console.log('\nusers (restore) + session + carts (no localStorage)');
const restored = await UsersApi.get_public('USR-1');
check('get_public returns the user without password', restored?.email === 'admin@techcore.com' && !('password' in restored));
check('get_public of an unknown id -> null', (await UsersApi.get_public('USR-404')) === null);
check('session starts logged out', (await SessionApi.get()).userId === null);
await SessionApi.set('USR-1');
check('session set -> get', (await SessionApi.get()).userId === 'USR-1');
await SessionApi.set(null);
check('session cleared', (await SessionApi.get()).userId === null);
check('no cart yet -> null', (await CartsApi.get('USR-2')) === null);
const lines = [{ id: 'PC-2001', name: 'TechCore Titan', price: 4299.99, url: '', quantity: 1 }];
await CartsApi.save('USR-2', lines);
check('cart created for the user', (await CartsApi.get('USR-2'))?.lines.length === 1);
await CartsApi.save('USR-2', [{ ...lines[0], quantity: 3 }]);
check('cart replaced on the next save', (await CartsApi.get('USR-2')).lines[0].quantity === 3);
check('carts are per user', (await CartsApi.get('USR-1')) === null);

console.log(`\n${passed} passed, ${failed} failed. Run \`npm run db:reset\` to restore the seed.`);
process.exit(failed === 0 ? 0 : 1);
