/**
 * Posición a la que debe ir el carrusel (scrollLeft) al apretar siguiente / anterior. Función pura (MX-3).
 *   scroll_left: posición actual   max: scrollWidth - clientWidth   step: ancho de una card + el gap
 *   direction: 1 (siguiente) | -1 (anterior)
 * Devuelve null si todo entra en pantalla (no hay nada que mover).
 * Da la vuelta: siguiente en el final -> 0; anterior en el inicio -> max.
 */
export function next_scroll_left({ scroll_left, max, step, direction }) {
  if (max <= 1) return null;
  if (direction > 0 && scroll_left >= max - 2) return 0;
  if (direction < 0 && scroll_left <= 2) return max;
  const index = Math.round(scroll_left / step) + direction;
  return Math.min(Math.max(index * step, 0), max);
}
