import { components, computers } from '../store.js';
import { filter_component, search_by_text } from '../services/filter.js';
import { render_stock_table, render_summary } from '../ui/tables.js';
 
/**
 * Task 1: type filter + text search for each catalog table.
 * Each view keeps its own { type, text } state, so filtering one never touches the other.
 * Listeners are delegated on document because catalog.html fragments may be injected later.
 */
const VIEWS = {
  components: {
    collection: components,
    type_select: '#component-type',
    search_input: '#components-search',
    body: '#components-body',
    summary: '#components-summary',
  },
  computers: {
    collection: computers,
    type_select: '#computer-type',
    search_input: '#computers-search',
    body: '#computers-body',
    summary: '#computers-summary',
  },
};
 
const state = {
  components: { type: 'all', text: '' },
  computers: { type: 'all', text: '' },
};
 
const $ = (selector) => document.querySelector(selector);
 
function render_view(view_name) {
  const view = VIEWS[view_name];
  const body = $(view.body);
  if (!body) return;
 
  const { type, text } = state[view_name];
  const by_type = filter_component(view.collection, type || 'all');
  const filtered = search_by_text(by_type, text);
 
  render_stock_table(body, filtered);
  render_summary($(view.summary), filtered.length, view.collection.length, filtered.value_total());
}
 
/** Redraw each table respecting the filters currently applied (Task 2 calls these after saving). */
export function render_components() {
  render_view('components');
}
 
export function render_computers() {
  render_view('computers');
}
 
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
 
/** Which view does this element belong to? (looks it up by the selector stored under `key`) */
function view_of(target, key) {
  if (!(target instanceof Element)) return null;
  return Object.keys(VIEWS).find((view_name) => target.matches(VIEWS[view_name][key])) ?? null;
}
 
const debounced_render = {
  components: debounce(() => render_view('components')),
  computers: debounce(() => render_view('computers')),
};
 
document.addEventListener('change', (event) => {
  const view_name = view_of(event.target, 'type_select');
  if (!view_name) return;
  state[view_name].type = event.target.value;
  render_view(view_name);
});
 
document.addEventListener('input', (event) => {
  const view_name = view_of(event.target, 'search_input');
  if (!view_name) return;
  state[view_name].text = event.target.value;
  debounced_render[view_name]();
});