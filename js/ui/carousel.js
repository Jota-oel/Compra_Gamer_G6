import { create_computer_card } from './cards.js';

const AUTOPLAY_MS = 5000;

const CONTENT = {
  gaming: { tag: 'GAMING CLASS', title: 'Zero Bottleneck Hardware', link: 'VIEW ALL GAMING GEAR', href: 'catalog.html' },
  office: { tag: 'PROFESSIONAL GRADE', title: 'Productivity & Workstations', link: 'VIEW ALL WORKSTATION GEAR', href: 'catalog.html' },
};

/**
 * One carousel for gaming and office.
 * root: <section data-carousel> (pages/carrousel.html)
 * computers: ComputerCollection already filtered by type (see filter_component)
 * type: 'gaming' | 'office'  -> only changes theme + header texts
 *
 * Scrolling is native (CSS scroll-snap), so touch / trackpad swipe works for free.
 * JS only adds: prev/next, autoplay (paused on hover / focus / hidden tab) and wrap-around.
 */
export function init_carousel(root, computers, type) {
  const content = CONTENT[type];
  if (!content) throw new Error(`Unknown carousel type "${type}"`);

  const slot = (name) => root.querySelector(`[data-slot="${name}"]`);
  const track = slot('track');
  const controls = slot('controls');

  // --- content ---
  root.classList.add(`theme-${type}`);
  slot('tag').textContent = content.tag;
  slot('title').textContent = content.title;
  root.setAttribute('aria-label', content.title);

  const items = computers.items.map((pc) => {
    const li = document.createElement('li');
    li.className = 'carousel__item';
    li.append(create_computer_card(pc));
    return li;
  });
  if (items.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'carousel__empty';
    empty.textContent = 'No computers available.';
    items.push(empty);
  }
  track.replaceChildren(...items);

  // --- behaviour ---
  const can_scroll = () => track.scrollWidth - track.clientWidth > 1;

  function move(direction) {
    if (!can_scroll()) return;
    const max = track.scrollWidth - track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = track.firstElementChild.getBoundingClientRect().width + gap;

    if (direction > 0 && track.scrollLeft >= max - 2) track.scrollTo({ left: 0 });
    else if (direction < 0 && track.scrollLeft <= 2) track.scrollTo({ left: max });
    else track.scrollBy({ left: direction * step });
  }

  const controller = new AbortController();
  const { signal } = controller;

  root.querySelectorAll('[data-dir]').forEach((button) =>
    button.addEventListener('click', () => move(Number(button.dataset.dir)), { signal }));

  // autoplay
  const reduced_motion = matchMedia('(prefers-reduced-motion: reduce)');
  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    if (timer || reduced_motion.matches || document.hidden) return;
    timer = setInterval(() => move(1), AUTOPLAY_MS);
  };
  root.addEventListener('pointerenter', stop, { signal });
  root.addEventListener('pointerleave', start, { signal });
  root.addEventListener('focusin', stop, { signal });
  root.addEventListener('focusout', start, { signal });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()), { signal });

  // hide arrows when everything fits (e.g. fewer cards than visible slots)
  const resize = new ResizeObserver(() => { controls.hidden = !can_scroll(); });
  resize.observe(track);

  start();

  return {
    next: () => move(1),
    prev: () => move(-1),
    destroy() { stop(); resize.disconnect(); controller.abort(); },
  };
}