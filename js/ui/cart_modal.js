import { open_modal, close_modal } from "./modal.js";

import { open_modal, close_modal } from "./modal.js";

const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${value.toLocaleString("en-US")}`;

export function render_cart(cart) {
  const badge = $("#cart-count");
  if (badge) badge.textContent = String(cart.count);

  const containerLines = $("#cart-lines");
  const containerEmpty = $("#cart-empty");
  const containerSummary = $("#cart-summary");
  const total = $("#cart-total");

  if (cart.count === 0) {
    if (containerEmpty) containerEmpty.hidden = false;
    if (containerLines) containerLines.hidden = true;
    if (containerSummary) containerSummary.hidden = true;
    return;
  }

  if (containerEmpty) containerEmpty.hidden = true;
  if (containerLines) containerLines.hidden = false;
  if (containerSummary) containerSummary.hidden = false;

  const tpl = $("#tpl-cart-line");
  if (containerLines && tpl) {
    containerLines.replaceChildren(
      ...cart.lines.map((line) => {
        const clone = tpl.content.cloneNode(true);
        const li = clone.querySelector("li") || clone.firstElementChild;
        if (li) li.dataset.computerId = line.id;

        const setField = (field, value) => {
          const el = clone.querySelector(`[data-field="${field}"]`);
          if (el) {
            if (field === "image") el.src = value;
            else if (field === "quantity") el.value = value;
            else el.textContent = value;
          }
        };

        setField("image", line.url);
        setField("name", line.name);
        setField("price", money(line.price));
        setField("quantity", line.quantity);
        setField("subtotal", money(line.price * line.quantity));

        return clone;
      }),
    );
  }

  if (total) total.textContent = money(cart.get_total());
}

export function open_cart_modal() {
  const modal = $("#cart-modal");
  if (modal) open_modal(modal);
}

export function close_cart_modal() {
  const modal = $("#cart-modal");
  if (modal) close_modal(modal);
}
