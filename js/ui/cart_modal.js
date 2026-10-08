import { open_modal } from './modal.js';

/**
 * Render functions for the cart modal (pages/cart_modal.html) and the navbar badge.
 * NO listeners here: Task 3 (index.cart.js) calls these.
 * User data always goes through textContent.
 */
const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${value.toLocaleString('en-US')}`;

/** Draws the navbar badge, the cart lines and the total. Safe if the modal is not in the DOM yet. */
export function render_cart(cart) {
  const badge = $('#cart-count');
  if (badge) badge.textContent = String(cart.count);

  const list = $('#cart-lines');
  if (!list) return;

  const template = $('#tpl-cart-line');
  list.replaceChildren(
    ...cart.lines.map((line) => {
      const node = template.content.cloneNode(true);
      const field = (name) => node.querySelector(`[data-field="${name}"]`);
      node.querySelector('li').dataset.computerId = line.id;

      const image = field('image');
      image.hidden = !line.url;
      if (line.url) image.src = line.url;
      image.alt = line.name;

      field('name').textContent = line.name;
      field('price').textContent = money(line.price);
      field('quantity').value = String(line.quantity);
      field('subtotal').textContent = money(line.price * line.quantity);
      return node;
    })
  );

  const has_lines = cart.count > 0;
  $('#cart-empty').hidden = has_lines;
  list.hidden = !has_lines;
  $('#cart-summary').hidden = !has_lines;
  $('#cart-total').textContent = money(cart.get_total());
}

export function open_cart(cart) {
  render_cart(cart);
  $('#cart-error').hidden = true;
  open_modal($('#cart-modal'));
}
