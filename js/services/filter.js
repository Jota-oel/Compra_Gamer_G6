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