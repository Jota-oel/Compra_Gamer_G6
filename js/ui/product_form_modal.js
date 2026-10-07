import { COMPONENT_TYPES } from "../models/Component.js";
import { COMPUTER_TYPES } from "../models/Computer.js";

const $ = (selector) => document.querySelector(selector);
let open_form;

export async function init_product_form_modal() {
  if (open_form) return open_form;
  const response = await fetch(
    new URL("../../pages/product_modal.html", import.meta.url),
  );
  if (!response.ok) throw new Error(`Product form: HTTP ${response.status}`);
  $("#product-form-container").innerHTML = await response.text();
  const modal = $("#product-form-modal");
  const form = $("#product-form");
  let previous_focus;
  let previous_overflow;
  let background;

  function close() {
    modal.hidden = true;
    document.body.style.overflow = previous_overflow;
    background.forEach(([element, inert]) => {
      element.inert = inert;
    });
    previous_focus?.focus();
  }

  modal.querySelector('[data-action="close"]').addEventListener("click", close);
  $("#cancel-btn").addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
    if (event.key !== "Tab") return;
    const focusable = [
      ...modal.querySelectorAll(
        'button, input, select, textarea, [tabindex="0"]',
      ),
    ].filter((element) => !element.disabled && element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    $("#product-form-error").textContent =
      "Saving products is not available yet.";
    $("#product-form-error").hidden = false;
  });

  open_form = (mode = "components", components = []) => {
    form.reset();
    modal.dataset.mode = mode;
    modal.dataset.intent = "create";
    const title = $("#product-form-title");
    title.textContent = title.getAttribute(`data-title-${mode}-create`);
    $("#product-form-error").hidden = true;
    const types = mode === "components" ? COMPONENT_TYPES : COMPUTER_TYPES;
    $("#product-type").replaceChildren(
      new Option("Select type", ""),
      ...types.map((type) => new Option(type.toUpperCase(), type)),
    );
    $("#product-description").readOnly = mode === "computers";
    $("#product-price").required = mode === "components";
    modal
      .querySelectorAll("[data-only-mode], [data-only-intent]")
      .forEach((element) => {
        element.hidden = Boolean(
          (element.dataset.onlyMode && element.dataset.onlyMode !== mode) ||
          (element.dataset.onlyIntent &&
            element.dataset.onlyIntent !== "create"),
        );
        if (element.tagName === "FIELDSET") element.disabled = element.hidden;
      });
    const picker = $("#components-picker-list");
    picker.replaceChildren();
    if (mode === "computers") {
      for (const component of components) {
        const option = $("#tpl-component-option").content.cloneNode(true);
        option.querySelector("input").value = component.id;
        option.querySelector('[data-field="name"]').textContent =
          component.name;
        option.querySelector('[data-field="meta"]').textContent =
          `${component.type} · Stock: ${component.stock}`;
        picker.append(option);
      }
    }
    previous_focus = document.activeElement;
    previous_overflow = document.body.style.overflow;
    background = [...document.querySelectorAll("body > nav, body > main")].map(
      (element) => [element, element.inert],
    );
    background.forEach(([element]) => {
      element.inert = true;
    });
    document.body.style.overflow = "hidden";
    modal.hidden = false;
    form.querySelector("[data-autofocus]").focus();
  };
  return open_form;
}
