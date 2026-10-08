/**
 * Generic open / close for every modal overlay (.modal-overlay).
 * One modal open at a time. The document-level listeners are registered once,
 * on import, so they also work for overlays injected later by loadSection.
 */
const OPEN_CLASS = 'is-open';
const BODY_CLASS = 'modal-open';

let current = null; // { overlay, opener } of the modal that is open right now

export function open_modal(overlay) {
  if (!overlay || current?.overlay === overlay) return;
  if (current) close_modal(current.overlay); // one at a time

  current = { overlay, opener: document.activeElement };
  overlay.hidden = false;
  overlay.classList.add(OPEN_CLASS);
  document.body.classList.add(BODY_CLASS);
  overlay.querySelector('[data-autofocus]')?.focus();
}

export function close_modal(overlay) {
  if (!overlay || current?.overlay !== overlay) return;
  const { opener } = current;
  current = null;

  overlay.hidden = true;
  overlay.classList.remove(OPEN_CLASS);
  document.body.classList.remove(BODY_CLASS);
  if (opener?.isConnected) opener.focus();
}

// Esc
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !current) return;
  event.preventDefault();
  close_modal(current.overlay);
});

// Click on the overlay itself, or on any [data-action="close"] inside it
document.addEventListener('click', (event) => {
  if (!current) return;
  const { overlay } = current;
  const close_button = event.target.closest('[data-action="close"]');
  if (event.target === overlay || (close_button && overlay.contains(close_button))) {
    close_modal(overlay);
  }
});
