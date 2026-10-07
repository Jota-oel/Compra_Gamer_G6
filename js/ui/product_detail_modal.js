import { open_modal, close_modal } from "./modal.js";

const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${value.toLocaleString("en-US")}`;

export function open_product_detail_modal(computer) {
  const modal = $("#product-detail-modal");
  if (!modal) return;

  modal.dataset.computerId = computer.id;

  const setContent = (id, value) => {
    const el = $(id);
    if (el) el.textContent = value;
  };

  setContent("#detail-type", computer.type);
  setContent("#detail-name", computer.name);
  setContent("#detail-description", computer.description);
  setContent("#detail-price", money(computer.price));
  setContent(
    "#detail-stock",
    computer.stock > 0 ? `${computer.stock} u. disponibles` : "Sin stock",
  );

  const img = $("#detail-image");
  if (img) {
    img.src = computer.url;
    img.alt = computer.name;
  }

  const componentsList = $("#detail-components");
  const tpl = $("#tpl-detail-component");
  if (componentsList && tpl && computer.components) {
    componentsList.replaceChildren(
      ...computer.components.map((comp) => {
        const clone = tpl.content.cloneNode(true);
        const nameNode = clone.querySelector('[data-field="name"]');
        const typeNode = clone.querySelector('[data-field="type"]');
        if (nameNode) nameNode.textContent = comp.name;
        if (typeNode) typeNode.textContent = comp.type;
        return clone;
      }),
    );
  }

  const qtyInput = $("#detail-quantity");
  if (qtyInput) {
    qtyInput.value = 1;
    qtyInput.max = computer.stock;
  }

  const errorEl = $("#detail-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }

  const addBtn = $("#detail-add");
  if (addBtn) addBtn.disabled = computer.stock <= 0;

  open_modal(modal);
}

export function close_product_detail_modal() {
  const modal = $("#product-detail-modal");
  if (!modal) return;
  delete modal.dataset.computerId;
  close_modal(modal);
}
