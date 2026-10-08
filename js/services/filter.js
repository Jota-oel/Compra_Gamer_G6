/**
 * Shared by index.html and catalog.html.
 * Works with ComponentCollection AND ComputerCollection (both expose filter_by_type).
 *
 * type: 'all' | one type | array of types
 * Returns a collection, so it stays chainable:
 *   filter_component(computers, 'gaming').value_total()
 */
export function filter_component(collection, type = 'all') {
  if (type === 'all' || type == null || (Array.isArray(type) && type.length === 0)) {
    return collection;
  }
  return collection.filter_by_type(type);
}

/**
 * catalog.html: stock of both lists at once, each with its own filter.
 * Returns plain data ready to render in the two tables.
 */
export function get_stock_overview(components, computers, { component_type = 'all', computer_type = 'all' } = {}) {
  const filtered_components = filter_component(components, component_type);
  const filtered_computers = filter_component(computers, computer_type);
  return {
    components: { rows: filtered_components.to_rows(), value_total: filtered_components.value_total() },
    computers: { rows: filtered_computers.to_rows(), value_total: filtered_computers.value_total() },
  };
}

/**
 * Text search over name, description and id (case-insensitive).
 * Returns a NEW, non-persisted collection, so it chains with filter_component.
 * An empty text returns the same collection untouched.
 */
export function search_by_text(collection, text = '') {
  const query = String(text ?? '').trim().toLowerCase().replace(/^#/, ''); // the table shows ids as "#id"
  if (query === '') return collection;

  const matches = (item) =>
    [item.name, item.description, item.id].some((field) => String(field ?? '').toLowerCase().includes(query));

  // When Task 0 adds Collection.filter_by(predicate): return collection.filter_by(matches);
  return new collection.constructor(collection.items.filter(matches));
}