import { components, computers } from '../store.js';
import { filter_component } from '../services/filter.js';
import { render_stock_table, render_summary } from '../ui/tables.js';
import { seed_if_empty } from '../seed.js';
import { loadSection } from '../utils/fragments.js';
import './catalog.filters.js'; // Task 1
import './catalog.modal.js'; // Task 2

const SELECTORS = {
  components_body: '#components-body',
  computers_body: '#computers-body',
  components_summary: '#components-summary',
  computers_summary: '#computers-summary',
};
const $ = (selector) => document.querySelector(selector);

function render_section(collection, type, body_selector, summary_selector) {
  const body = $(body_selector);
  if (!body) return;
  const filtered = filter_component(collection, type);
  render_stock_table(body, filtered);
  render_summary($(summary_selector), filtered.length, collection.length, filtered.value_total());
}

/** Both tables, each with its own filter. */
export function render_catalog({ component_type = 'all', computer_type = 'all' } = {}) {
  render_section(components, component_type, SELECTORS.components_body, SELECTORS.components_summary);
  render_section(computers, computer_type, SELECTORS.computers_body, SELECTORS.computers_summary);
}

/** For the future "create PC" form: validates, discounts component stock, saves and re-renders. */
export function build_computer(data, component_ids, filters = {}) {
  const computer = computers.create_computer(data, components, component_ids); // throws if invalid
  render_catalog(filters);
  return computer;
}

seed_if_empty(components, computers); // demo data; remove once there is a real admin flow
render_catalog();

// The product form modal is injected as soon as the page starts (path is relative to pages/catalog.html).
// Task 2 can wait for it with when_ready('#product-form-modal').
loadSection('product-form-container', 'product_modal.html');

// TODO listeners: type filters -> Task 1; create / edit / submit of the product form -> Task 2
