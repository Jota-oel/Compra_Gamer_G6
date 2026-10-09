/**
 * Entry for the one-page index.html.
 * loader.js (yours) keeps injecting navbar / sections / footer; it is NOT imported here,
 * so load it only once, the way you already do.
 * Each carousel starts as soon as its own fragment is in the DOM (no dependency on load order).
 */
import { components, computers } from '../store.js';
import { Cart } from '../models/Cart.js';
import { filter_component } from '../services/filter.js';
import { init_carousel } from '../ui/carousel.js';
import { render_cart } from '../ui/cart_modal.js';
import { when_ready } from '../utils/dom.js';
import { seed_if_empty } from '../seed.js';
import './index.detail.js'; // Task 3
import './index.cart.js'; // Task 3

const SECTIONS = [
  { container: '#gaming-container', type: 'gaming' },
  { container: '#pro-container', type: 'office' },
];

export const cart = Cart.from_storage();
export const carousels = {}; // { gaming, office } -> { next, prev, destroy }


try {
  const seeded = seed_if_empty(components, computers);
  
} catch (error) {
  console.error('La seed falló:', error);
}

for (const { container, type } of SECTIONS) {
  when_ready(`${container} [data-carousel]`).then((root) => {
    carousels[type] = init_carousel(root, filter_component(computers, type), type);
  });
}

// navbar (cart badge) is injected by loader.js; it announces itself with this event
document.addEventListener('onLayoutLoaded', () => render_cart(cart));

// TODO listeners: Configure button -> open_product_modal(computer) / cart.add(...)
