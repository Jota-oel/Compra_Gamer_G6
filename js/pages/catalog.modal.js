import { components, computers, Component } from '../store.js';
import { Computer } from '../models/Computer.js';
import { get_active_mode, open_product_form, submit_product_form } from '../ui/product_form_modal.js';
import { render_components, render_computers } from './catalog.filters.js'; // Task 1: redraw with the active filters

/**
 * Listeners of the product modal (catalog.html). Event delegation on `document`:
 * the tables are re-rendered, so nothing is attached to individual buttons.
 *
 *   [data-action="create"]  -> open the modal in create mode
 *   [data-action="edit"]    -> open the modal with the item of that row (data-id)
 *   submit of #product-form -> save through the models
 */

/** Validates the changes on a throw-away copy, so a failing setter can not leave the item half edited. */
function assert_valid(item, changes) {
  new item.constructor({ ...item.toJSON(), ...changes });
}

function save_component(item, data) {
  const { name, description, type, price, stock, url } = data;
  if (!item) {
    components.create(new Component({ name, description, type, price, stock, url }));
  } else {
    const changes = { name, description, type, price, stock, url };
    assert_valid(item, changes);
    components.update(item.id, changes);
  }
  render_components();
}

function save_computer(item, data) {
  const { name, type, price, stock, url } = data;
  if (!item) {
    if (data.component_ids.length === 0) {
      throw new Error(`Missing essential components: ${Computer.check_components([], type).join(', ')}`);
    }
    // validates essentials + stock and discounts the components' stock (throws if invalid)
    computers.create_computer({ name, type, price, stock, url }, components, data.component_ids);
    render_components(); // the components' stock changed too
  } else {
    // the description comes from the components, so it is not edited
    const changes = { name, type, price, stock, url };
    assert_valid(item, changes);
    if (type !== item.type) {
      const missing = Computer.check_components(item.components, type);
      if (missing.length) throw new Error(`Missing essential components: ${missing.join(', ')}`);
    }
    computers.update(item.id, changes);
  }
  render_computers();
}

async function open_form(mode, item = null) {
  const on_save = (data) => (mode === 'computers' ? save_computer(item, data) : save_component(item, data));
  try {
    await open_product_form({ mode, item, on_save });
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="create"], [data-action="edit"]');
  if (!button) return;

  const mode = get_active_mode();
  if (button.dataset.action === 'create') {
    open_form(mode);
    return;
  }
  const collection = mode === 'computers' ? computers : components;
  const item = collection.read(button.dataset.id);
  if (!item) {
    console.warn(`Item ${button.dataset.id} not found in ${mode}`);
    return;
  }
  open_form(mode, item);
});

document.addEventListener('submit', (event) => {
  if (!event.target.matches('#product-form')) return;
  event.preventDefault();
  submit_product_form();
});
