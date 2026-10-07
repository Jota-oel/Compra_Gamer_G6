let trigger_element = null;

export function open_modal(overlay) {
  trigger_element = document.activeElement;
  overlay.hidden = false;
  overlay.classList.add("is-open");
  document.body.classList.add("modal-open");

  const focusable = overlay.querySelector("[data-autofocus]");
  if (focusable) focusable.focus();
}

export function close_modal(overlay) {
  overlay.hidden = true;
  overlay.classList.remove("is-open");
  document.body.classList.remove("modal-open");

  if (trigger_element) trigger_element.focus();
  trigger_element = null;
}

document.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal-overlay")) {
    close_modal(event.target);
  }

  const closeBtn = event.target.closest('[data-action="close"]');
  if (closeBtn) {
    const overlay = closeBtn.closest(".modal-overlay");
    if (overlay) close_modal(overlay);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const openModal = document.querySelector(".modal-overlay.is-open");
    if (openModal) close_modal(openModal);
  }
});
