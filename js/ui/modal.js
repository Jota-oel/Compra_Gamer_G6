let previous_focus = null;

export function open_modal(overlay) {
  if (!overlay) return;
  previous_focus = document.activeElement;
  overlay.hidden = false;
  overlay.classList.add("is-open");
  document.body.classList.add("modal-open");

  const focus_target =
    overlay.querySelector("[data-autofocus]") ||
    overlay.querySelector("button, input, select, textarea");
  focus_target?.focus();
}

export function close_modal(overlay) {
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  overlay.classList.remove("is-open");
  document.body.classList.remove("modal-open");

  if (previous_focus && typeof previous_focus.focus === "function") {
    previous_focus.focus();
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const open_overlay = document.querySelector(
      ".modal-overlay.is-open, .modal-overlay:not([hidden])",
    );
    if (open_overlay) close_modal(open_overlay);
  }
});

document.addEventListener("click", (event) => {
  const close_btn = event.target.closest('[data-action="close"]');
  if (close_btn) {
    const overlay = close_btn.closest(".modal-overlay");
    if (overlay) close_modal(overlay);
    return;
  }

  if (event.target.classList.contains("modal-overlay")) {
    close_modal(event.target);
  }
});
