import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CartContext } from '../context/CartContext.js';
import { CartsApi } from '../api/Carts.js';
import { checkout as checkout_service } from '../services/inventory.js';
import { useAuth } from '../hooks/useAuth.js';
import { useComputers } from '../hooks/useComputers.js';
import { useNotify } from '../hooks/useNotify.js';

/** Sums the quantity per computer and caps it by the stock when the computer is known. */
function merge_lines(saved, current, computers) {
  const by_id = new Map();
  for (const line of [...saved, ...current]) {
    const previous = by_id.get(line.id);
    by_id.set(line.id, previous ? { ...previous, quantity: previous.quantity + line.quantity } : { ...line });
  }
  return [...by_id.values()]
    .map((line) => {
      const stock = computers.find((computer) => computer.id === line.id)?.stock;
      return stock === undefined ? line : { ...line, quantity: Math.min(line.quantity, stock) };
    })
    .filter((line) => line.quantity > 0);
}

/**
 * Cart persistence (no localStorage):
 * - logged-in user: the cart is saved in the JSON (`carts`, one per user) and restored on every visit;
 * - guest: the cart lives only in memory and is MERGED into the saved cart when the user logs in;
 * - logout: the local cart is emptied (the saved one stays on the server).
 * State updates are optimistic: add / set_quantity / remove / clear stay synchronous and THROW Error
 * on invalid input (quantity < 1, more than the stock). Saving happens in the background, in order.
 * Lines: [{ id, name, price, url, quantity }] (snapshot of the computer when it was added).
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const { computers, reload: reload_computers } = useComputers();
  const { notify } = useNotify();
  const [lines, setLines] = useState([]);
  const [load, setLoad] = useState({ user: null, ok: false }); // result of loading the saved cart of `user`

  const user_id = user?.id ?? null;
  const loading = user_id !== null && load.user !== user_id;
  const can_save = user_id !== null && load.user === user_id && load.ok; // never save before the saved cart is merged
  const save_queue = useRef(Promise.resolve());
  const computers_ref = useRef(computers);
  useEffect(() => {
    computers_ref.current = computers;
  }, [computers]);

  // login: load and merge the saved cart. Cleanup (logout / another user): empty the local cart.
  useEffect(() => {
    if (!user_id) return undefined;
    let active = true;
    CartsApi.get(user_id)
      .then((saved) => {
        if (!active) return;
        setLines((current) => merge_lines(saved?.lines ?? [], current, computers_ref.current));
        setLoad({ user: user_id, ok: true });
      })
      .catch(() => {
        if (!active) return;
        setLoad({ user: user_id, ok: false }); // nothing gets saved over the server cart
        notify('Could not load your saved cart', 'error');
      });
    return () => {
      active = false;
      setLines([]);
      setLoad({ user: null, ok: false });
    };
  }, [user_id, notify]);

  // every change of the cart of a logged-in user is saved, one request at a time
  useEffect(() => {
    if (!can_save) return;
    save_queue.current = save_queue.current
      .then(() => CartsApi.save(user_id, lines))
      .catch(() => notify('Could not save the cart', 'error'));
  }, [lines, can_save, user_id, notify]);

  /** computer: plain object from useComputers(). Returns the new total count of units. */
  const add = useCallback((computer, quantity = 1) => {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be an integer >= 1');
    const line = lines.find((item) => item.id === computer.id);
    const new_quantity = (line?.quantity ?? 0) + quantity;
    if (new_quantity > computer.stock) {
      throw new Error(`Only ${computer.stock} unit(s) of "${computer.name}" available`);
    }
    const next = line
      ? lines.map((item) => (item.id === computer.id ? { ...item, quantity: new_quantity } : item))
      : [...lines, { id: computer.id, name: computer.name, price: computer.price, url: computer.url, quantity }];
    setLines(next);
    return next.reduce((sum, item) => sum + item.quantity, 0);
  }, [lines]);

  const remove = useCallback((id) => {
    setLines(lines.filter((item) => item.id !== id));
  }, [lines]);

  /** quantity 0 removes the line. The limit is the computer's current stock. */
  const set_quantity = useCallback((id, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 0) throw new Error('Quantity must be an integer >= 0');
    if (quantity === 0) return remove(id);
    if (!lines.some((item) => item.id === id)) throw new Error(`Cart line ${id} not found`);
    const stock = computers.find((computer) => computer.id === id)?.stock ?? Infinity;
    if (quantity > stock) throw new Error(`Only ${stock} unit(s) available`);
    setLines(lines.map((item) => (item.id === id ? { ...item, quantity } : item)));
  }, [lines, computers, remove]);

  const clear = useCallback(() => setLines([]), []);

  /** Re-reads the stock, discounts it, stores the order, empties the cart. Resolves with the order. */
  const checkout = useCallback(async () => {
    const order = await checkout_service(lines, user);
    setLines([]);
    reload_computers(); // stock changed
    return order;
  }, [lines, user, reload_computers]);

  const count = useMemo(() => lines.reduce((sum, item) => sum + item.quantity, 0), [lines]);
  const total = useMemo(() => lines.reduce((sum, item) => sum + item.price * item.quantity, 0), [lines]);

  const value = useMemo(
    () => ({ lines, count, total, loading, add, set_quantity, remove, clear, checkout }),
    [lines, count, total, loading, add, set_quantity, remove, clear, checkout],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
