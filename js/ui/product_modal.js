/**
 * Render functions for the product / cart modal (pages/product_modal.html).
 * NO listeners here: later, listeners call these functions.
 *
 * Adjust SELECTORS to match the ids/classes of your product_modal.html.
 */
export const SELECTORS = {
  modal: '#product-modal',
  image: '#modal-image',
  name: '#modal-name',
  description: '#modal-description',
  price: '#modal-price',
  stock: '#modal-stock',
  type: '#modal-type',
  cart_list: '#modal-cart-list',
  cart_total: '#modal-cart-total',
  cart_count: '#cart-count', // badge in the navbar
};
export const OPEN_CLASS = 'is-open';

const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${value.toLocaleString('en-US')}`;

/** Fills the modal with the selected computer and shows it. */
export function open_product_modal(computer) {
  const modal = $(SELECTORS.modal);
  if (!modal) return;
  modal.dataset.computerId = computer.id; // lets listeners know which PC is open

  const image = $(SELECTORS.image);
  if (image) { image.src = computer.url; image.alt = computer.name; }
  $(SELECTORS.name).textContent = computer.name;
  $(SELECTORS.description).textContent = computer.description;
  $(SELECTORS.price).textContent = money(computer.price);
  $(SELECTORS.stock).textContent = computer.stock > 0 ? `${computer.stock} u. available` : 'Out of stock';
  $(SELECTORS.type).textContent = computer.type;

  modal.classList.add(OPEN_CLASS);
  modal.setAttribute('aria-hidden', 'false');
}

export function close_product_modal() {
  const modal = $(SELECTORS.modal);
  if (!modal) return;
  modal.classList.remove(OPEN_CLASS);
  modal.setAttribute('aria-hidden', 'true');
  delete modal.dataset.computerId;
}

/** Draws cart lines, total and navbar badge. Uses textContent (no innerHTML). */
export function render_cart(cart) {
  const list = $(SELECTORS.cart_list);
  if (list) {
    list.replaceChildren(
      ...cart.lines.map((line) => {
        const item = document.createElement('li');
        item.dataset.computerId = line.id;
        item.textContent = `${line.name} x${line.quantity} — ${money(line.price * line.quantity)}`;
        return item;
      })
    );
  }
  const total = $(SELECTORS.cart_total);
  if (total) total.textContent = money(cart.get_total());
  const badge = $(SELECTORS.cart_count);
  if (badge) badge.textContent = String(cart.count);
}