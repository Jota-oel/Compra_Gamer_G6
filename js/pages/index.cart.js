import { computers } from '../store.js';
// Circular on purpose: index.page.js owns the single Cart instance and imports this file.
// `cart` is only read inside handlers (never at import time), so the live binding is safe.
import { cart } from './index.page.js';
import { open_cart, render_cart } from '../ui/cart_modal.js';

/**
 * Listeners for the cart modal (#cart-modal) and the navbar link.
 * All delegated on document: the navbar and the modal are injected later by loader.js.
 * The initial badge paint is done by index.page.js on `onLayoutLoaded`.
 */
const $ = (selector) => document.querySelector(selector);

const line_id = (element) => element.closest('[data-computer-id]').dataset.computerId;
const stock_of = (id) => computers.read(id)?.stock ?? 0;
const quantity_of = (id) => cart.lines.find((line) => line.id === id)?.quantity ?? 0;

/** Runs a cart change; model errors go to #cart-error. Always re-renders (restores bad inputs). */
function apply(change) {
  const error = $('#cart-error');
  try {
    change();
    error.hidden = true;
  } catch (e) {
    error.textContent = e.message;
    error.hidden = false;
  }
  render_cart(cart);
}

function change_quantity(button, delta) {
  const id = line_id(button);
  apply(() => cart.set_quantity(id, Math.max(1, quantity_of(id) + delta), stock_of(id)));
  // the lines were re-rendered: give the focus back to the same button
  $(`#cart-lines [data-computer-id="${CSS.escape(id)}"] [data-action="${button.dataset.action}"]`)?.focus();
}

const actions = new Map([
  ['open-cart', (button, event) => { event.preventDefault(); open_cart(cart); }], // navbar <a href="#carrito">
  ['cart-increase', (button) => change_quantity(button, 1)],
  ['cart-decrease', (button) => change_quantity(button, -1)],
  ['cart-remove', (button) => apply(() => cart.remove(line_id(button)))],
  ['cart-clear', () => apply(() => cart.clear())],
]);

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  actions.get(button?.dataset.action)?.(button, event);
});

// Typing a quantity by hand (0 removes the line, as Cart.set_quantity defines)
document.addEventListener('change', (event) => {
  if (!event.target.matches('#cart-lines [data-field="quantity"]')) return;
  const id = line_id(event.target);
  apply(() => cart.set_quantity(id, event.target.valueAsNumber, stock_of(id)));
});

// Checkout (#cart-checkout, data-action="checkout") is not wired: it is still an open team decision.
