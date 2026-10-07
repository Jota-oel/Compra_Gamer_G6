const SELECTORS = {
  cart_list: "#modal-cart-list",
  cart_total: "#modal-cart-total",
  cart_count: "#cart-count",
};

const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${value.toLocaleString("en-US")}`;

export function render_cart(cart) {
  const list = $(SELECTORS.cart_list);
  if (list) {
    list.replaceChildren(
      ...cart.lines.map((line) => {
        const item = document.createElement("li");
        item.dataset.computerId = line.id;
        item.textContent = `${line.name} x${line.quantity} — ${money(line.price * line.quantity)}`;
        return item;
      }),
    );
  }
  const total = $(SELECTORS.cart_total);
  if (total) total.textContent = money(cart.get_total());
  const badge = $(SELECTORS.cart_count);
  if (badge) badge.textContent = String(cart.count);
}
