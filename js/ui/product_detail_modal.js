import { open_modal } from './modal.js';

/**
 * Render functions for the PC detail modal (pages/detail_modal.html).
 * NO listeners here: Task 3 (index.detail.js) calls these.
 * User data always goes through textContent.
 */
const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${value.toLocaleString('en-US')}`;

/** Fills the modal with a computer. Returns the overlay (or null if it is not in the DOM). */
export function render_product_detail(computer) {
  const modal = $('#product-detail-modal');
  if (!modal) return null;
  modal.dataset.computerId = computer.id;

  const image = $('#detail-image');
  image.hidden = !computer.url;
  if (computer.url) image.src = computer.url;
  else image.removeAttribute('src');
  image.alt = computer.name;

  $('#detail-type').textContent = computer.type;
  $('#detail-name').textContent = computer.name;
  $('#detail-description').textContent = computer.description;
  $('#detail-price').textContent = money(computer.price);
  $('#detail-stock').textContent = computer.stock > 0 ? `${computer.stock} u. available` : 'Out of stock';

  const template = $('#tpl-detail-component');
  $('#detail-components').replaceChildren(
    ...computer.components.map((component) => {
      const item = template.content.cloneNode(true);
      item.querySelector('[data-field="type"]').textContent = component.type;
      item.querySelector('[data-field="name"]').textContent = component.name;
      return item;
    })
  );

  const in_stock = computer.stock > 0;
  const quantity = $('#detail-quantity');
  quantity.min = '1';
  quantity.max = String(Math.max(computer.stock, 1));
  quantity.value = '1';
  quantity.disabled = !in_stock;
  $('#detail-add').disabled = !in_stock;
  $('#detail-error').hidden = true;

  return modal;
}

export function open_product_detail(computer) {
  const modal = render_product_detail(computer);
  if (modal) open_modal(modal);
}
