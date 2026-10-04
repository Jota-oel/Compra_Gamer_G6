import '../loader.js'; // injects navbar / footer / modal (adjust if loader.js exports a function)
import { components, computers } from '../store.js';
import { Cart } from '../models/Cart.js';
import { filter_component } from '../services/filter.js';
import { render_computer_cards } from '../ui/cards.js';
import { render_cart } from '../ui/product_modal.js';
import { seed_if_empty } from '../seed.js';

const SELECTORS = { cards: '#pc-cards' };

export const cart = Cart.from_storage();

/** type: 'all' | 'gaming' | 'office' */
export function render_index(type = 'all') {
  const container = document.querySelector(SELECTORS.cards);
  if (!container) return;
  render_computer_cards(container, filter_component(computers, type));
}

seed_if_empty(components, computers); // demo data; remove once there is a real admin flow
render_index();
render_cart(cart); // badge lives in the navbar: needs the loader to have finished

// TODO listeners: filter gaming/office -> render_index(type); card click -> open_product_modal(computer)