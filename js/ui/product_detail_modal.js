export const SELECTORS = {
  modal: "#product-modal",
  image: "#modal-image",
  name: "#modal-name",
  description: "#modal-description",
  price: "#modal-price",
  stock: "#modal-stock",
  type: "#modal-type",
};
export const OPEN_CLASS = "is-open";

const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${value.toLocaleString("en-US")}`;

export function open_product_modal(computer) {
  const modal = $(SELECTORS.modal);
  if (!modal) return;
  modal.dataset.computerId = computer.id;

  const image = $(SELECTORS.image);
  if (image) {
    image.src = computer.url;
    image.alt = computer.name;
  }
  $(SELECTORS.name).textContent = computer.name;
  $(SELECTORS.description).textContent = computer.description;
  $(SELECTORS.price).textContent = money(computer.price);
  $(SELECTORS.stock).textContent =
    computer.stock > 0 ? `${computer.stock} u. available` : "Out of stock";
  $(SELECTORS.type).textContent = computer.type;

  modal.classList.add(OPEN_CLASS);
  modal.setAttribute("aria-hidden", "false");
}

export function close_product_modal() {
  const modal = $(SELECTORS.modal);
  if (!modal) return;
  modal.classList.remove(OPEN_CLASS);
  modal.setAttribute("aria-hidden", "true");
  delete modal.dataset.computerId;
}
