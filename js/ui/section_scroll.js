if (
  document.body.classList.contains("modal-open") ||
  event.target.closest(".modal-overlay")
) {
  return; // No llamar a preventDefault() aquí
}
