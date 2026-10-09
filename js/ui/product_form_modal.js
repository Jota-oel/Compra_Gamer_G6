import { COMPONENT_TYPES } from '../models/Component.js';
import { COMPUTER_TYPES, Computer } from '../models/Computer.js';
import { components } from '../store.js';
import { when_ready } from '../utils/dom.js';
import { open_modal, close_modal } from './modal.js';

/**
 * Product form modal of catalog.html (pages/product_modal.html).
 * ONE modal for components AND computers, create AND edit.
 *
 * This file only handles the UI: open / fill / read the form.
 * Persisting the data is up to the `on_save(data)` callback (see catalog.modal.js).
 * Esc, click on the overlay and [data-action="close"] are handled by ui/modal.js.
 * The fragment is injected by catalog.page.js (loadSection), so it is awaited with when_ready.
 */

const SELECTORS = {
  overlay: '#product-form-modal',
  form: '#product-form',
  title: '#product-form-title',
  submit: '#product-submit',
  type: '#product-type',
  description: '#product-description',
  price: '#product-price',
  error: '#product-form-error',
  picker_list: '#components-picker-list',
  picker_status: '#components-picker-status',
  readonly_list: '#components-readonly-list',
  tab: 'input[name="vista"]:checked',
};
const FORM_FIELDS = ['id', 'name', 'description', 'type', 'price', 'stock', 'url'];

const $ = (selector) => document.querySelector(selector);

// 'ram' -> 'RAM', 'processor' -> 'Processor' (same rule as ui/tables.js)
const type_label = (type) => (type.length <= 3 ? type.toUpperCase() : type[0].toUpperCase() + type.slice(1));

let current_on_save = null;

/** Active tab of catalog.html: 'components' | 'computers'. */
export function get_active_mode() {
  return $(SELECTORS.tab)?.id === 'vista-computers' ? 'computers' : 'components';
}

// ------------------------------------------------------------------- helpers

function is_open() {
  const overlay = $(SELECTORS.overlay);
  return Boolean(overlay) && !overlay.hidden;
}

function show_error(message) {
  const error = $(SELECTORS.error);
  error.textContent = message;
  error.hidden = false;
}

function clear_error() {
  const error = $(SELECTORS.error);
  error.textContent = '';
  error.hidden = true;
}

/** Shows only the blocks (data-only-mode / data-only-intent) that match the combination. */
function apply_visibility(overlay, mode, intent) {
  overlay.querySelectorAll('[data-only-mode], [data-only-intent]').forEach((element) => {
    const { onlyMode, onlyIntent } = element.dataset;
    element.hidden = Boolean((onlyMode && onlyMode !== mode) || (onlyIntent && onlyIntent !== intent));
    // a disabled fieldset is left out of FormData (no stray component_ids)
    if (element.tagName === 'FIELDSET') element.disabled = element.hidden;
  });
}

function fill_type_options(mode) {
  const types = mode === 'computers' ? COMPUTER_TYPES : COMPONENT_TYPES;
  $(SELECTORS.type).replaceChildren(
    new Option('Select type', ''),
    ...types.map((type) => new Option(type_label(type), type)),
  );
}

function fill_form(form, item) {
  const data = item?.toJSON() ?? {};
  for (const name of FORM_FIELDS) {
    const field = form.elements.namedItem(name);
    if (field) field.value = data[name] ?? ''; // the hidden `id` is not cleared by reset()
  }
}

// ----------------------------------------------------- components picker

function render_picker() {
  const list = $(SELECTORS.picker_list);
  const group_template = $('#tpl-component-group');
  const option_template = $('#tpl-component-option');
  const groups = [];

  for (const type of COMPONENT_TYPES) {
    const items = components.items.filter((component) => component.type === type);
    if (items.length === 0) continue;

    const group = group_template.content.cloneNode(true);
    group.querySelector('[data-field="type"]').textContent = type_label(type);
    const slot = group.querySelector('[data-slot="options"]');

    for (const component of items) {
      const option = option_template.content.cloneNode(true);
      const checkbox = option.querySelector('input');
      checkbox.value = component.id;
      checkbox.disabled = component.stock <= 0; // no stock -> can not be picked
      option.querySelector('[data-field="name"]').textContent = component.name;
      option.querySelector('[data-field="meta"]').textContent =
        component.stock > 0 ? `Stock: ${component.stock}` : 'Out of stock';
      slot.append(option);
    }
    groups.push(group);
  }
  list.replaceChildren(...groups);
}

/** Live result of Computer.check_components(...) for the selected components + type. */
function update_picker_status() {
  const status = $(SELECTORS.picker_status);
  const type = $(SELECTORS.type).value;
  if (!type) {
    status.textContent = 'Select a computer type to check the essential components.';
    return;
  }
  const selected = [...$(SELECTORS.picker_list).querySelectorAll('input:checked')]
    .map((checkbox) => components.read(checkbox.value))
    .filter(Boolean);
  const missing = Computer.check_components(selected, type);
  status.textContent = missing.length
    ? `Missing: ${missing.join(', ')}`
    : 'All the essential components are selected.';
}

// Each change of a checkbox, or of the type, refreshes the status (computers/create only).
// Delegated on document: the fragment is injected after this module is loaded.
document.addEventListener('change', (event) => {
  const overlay = $(SELECTORS.overlay);
  if (!overlay || overlay.hidden) return;
  if (overlay.dataset.mode !== 'computers' || overlay.dataset.intent !== 'create') return;
  if (event.target.matches(SELECTORS.type) || event.target.closest(SELECTORS.picker_list)) {
    update_picker_status();
  }
});

function render_readonly_components(item) {
  const template = $('#tpl-readonly-component');
  $(SELECTORS.readonly_list).replaceChildren(
    ...(item?.components ?? []).map((component) => {
      const row = template.content.cloneNode(true);
      row.querySelector('[data-field="type"]').textContent = type_label(component.type);
      row.querySelector('[data-field="name"]').textContent = component.name;
      return row;
    }),
  );
}

// ------------------------------------------------------------------ public

/**
 * Opens the modal.
 *  mode:    'components' | 'computers' (default: the active tab)
 *  item:    null = create, Component / Computer = edit
 *  on_save: (data) => void. If it throws, the modal stays open and shows the message.
 */
export async function open_product_form({ mode = get_active_mode(), item = null, on_save } = {}) {
  const overlay = await when_ready(SELECTORS.overlay);
  const form = $(SELECTORS.form);
  const intent = item ? 'edit' : 'create';
  current_on_save = on_save ?? null;

  // 1. mode / intent + visibility
  overlay.dataset.mode = mode;
  overlay.dataset.intent = intent;
  apply_visibility(overlay, mode, intent);

  // 2. title and submit text live in the HTML (data-title-* / data-label-*)
  const title = $(SELECTORS.title);
  title.textContent = title.getAttribute(`data-title-${mode}-${intent}`);
  const submit = $(SELECTORS.submit);
  submit.textContent = submit.getAttribute(`data-label-${intent}`);
  submit.disabled = false;

  // 3. type options, 4. clean error + reset (+ load the item when editing)
  fill_type_options(mode);
  clear_error();
  form.reset();
  fill_form(form, item);

  // 5. computers: generated description; create: optional price
  $(SELECTORS.description).readOnly = mode === 'computers';
  $(SELECTORS.price).required = !(mode === 'computers' && intent === 'create');

  // 6. computers/create: components picker  |  7. computers/edit: read-only list
  $(SELECTORS.picker_list).replaceChildren();
  $(SELECTORS.picker_status).textContent = '';
  $(SELECTORS.readonly_list).replaceChildren();
  if (mode === 'computers' && intent === 'create') {
    render_picker();
    update_picker_status();
  } else if (mode === 'computers' && intent === 'edit') {
    render_readonly_components(item);
  }

  open_modal(overlay);
}

/** Reads the form. <input type="number"> gives strings: they are converted here. */
function read_form_data() {
  const form_data = new FormData($(SELECTORS.form));
  const text = (name) => String(form_data.get(name) ?? '');
  const number = (name) => {
    const raw = text(name).trim();
    return raw === '' ? undefined : Number(raw); // undefined = "not provided"
  };
  return {
    id: text('id'),
    name: text('name'),
    description: text('description'),
    type: text('type'),
    price: number('price'),
    stock: number('stock'),
    url: text('url').trim(),
    component_ids: form_data.getAll('component_ids'),
  };
}

/** Called on submit: sends the data to on_save; closes on success, shows the error otherwise. */
export async function submit_product_form() {
  if (!is_open() || !current_on_save) return;
  const submit = $(SELECTORS.submit);
  submit.disabled = true; // avoids double submit
  clear_error();
  try {
    await current_on_save(read_form_data());
    close_modal($(SELECTORS.overlay));
  } catch (error) {
    show_error(error instanceof Error ? error.message : String(error));
  } finally {
    submit.disabled = false;
  }
}
