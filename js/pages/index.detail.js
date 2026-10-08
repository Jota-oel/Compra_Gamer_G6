import { computers } from '../store.js';
// Circular on purpose: index.page.js owns the single Cart instance and imports this file.
// `cart` is only read inside handlers (never at import time), so the live binding is safe.
import { cart } from './index.page.js';
import { open_product_detail } from '../ui/product_detail_modal.js';
import { open_cart } from '../ui/cart_modal.js';

/**
 * Listeners for the PC detail modal (#product-detail-modal). All delegated on document:
 * the cards live in carousels and the modal itself is injected later by loader.js.
 */
const $ = (selector) => document.querySelector(selector);

function show_error(message) {
  const error = $('#detail-error');
  error.textContent = message;
  error.hidden = false;
}

/** Keeps the quantity input an integer between 1 and the stock (its `max`). */
function clamp_quantity(input) {
  const max = Number(input.max) || 1;
  const value = Math.trunc(Number(input.value)) || 1;
  input.value = String(Math.min(Math.max(value, 1), max));
}

function step_quantity(delta) {
  const input = $('#detail-quantity');
  input.value = String((Number(input.value) || 1) + delta);
  clamp_quantity(input);
  $('#detail-error').hidden = true;
}

function open_detail(button) {
  const computer = computers.read(button.dataset.id);
  if (computer) open_product_detail(computer);
}

const actions = new Map([
  ['buy', open_detail],
  ['qty-decrease', () => step_quantity(-1)],
  ['qty-increase', () => step_quantity(1)],
]);

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  actions.get(button?.dataset.action)?.(button);
});

// Typing a quantity by hand
document.addEventListener('change', (event) => {
  if (event.target.matches('#detail-quantity')) clamp_quantity(event.target);
});

// Submit = "Add to cart" (so Enter works from the quantity input)
document.addEventListener('submit', (event) => {
  if (!event.target.matches('#detail-form')) return;
  event.preventDefault();

  const computer = computers.read($('#product-detail-modal').dataset.computerId);
  if (!computer) {
    show_error('This computer is no longer available.');
    return;
  }

  try {
    cart.add(computer, Number(new FormData(event.target).get('quantity')));
  } catch (error) {
    show_error(error.message); // e.g. "Only 3 unit(s) of ... available"
    return;
  }

  // open_cart() re-renders badge + lines and closes the detail (one modal at a time).
  // To only close the detail instead, call close_modal(...) here and render_cart(cart).
  open_cart(cart);
});
