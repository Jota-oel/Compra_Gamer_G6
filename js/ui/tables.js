/**
 * Renders the stock tables of catalog.html (components and computers share the same shape).
 * Uses the class names already styled in catalog.css (fila-producto, datos-producto, ...),
 * so the stylesheet does not change. Rows carry data-id; the edit button carries
 * data-action="edit" + data-id for event delegation later.
 */
const money = (value) => `$${value.toLocaleString('en-US')}`;

// 'ram' -> 'RAM', 'processor' -> 'Processor'
const type_label = (type) => (type.length <= 3 ? type.toUpperCase() : type[0].toUpperCase() + type.slice(1));

// static markup (no user data inside), same icon as the mockup
const EDIT_ICON =
  '<svg class="icono-svg" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-7" />' +
  '<path d="m10 14 1-4 8-8 3 3-8 8-4 1ZM17 4l3 3" /></svg>';

function el(tag, class_name, text) {
  const node = document.createElement(tag);
  if (class_name) node.className = class_name;
  if (text !== undefined) node.textContent = text;
  return node;
}

function create_row(item) {
  const row = el('tr', 'fila-producto');
  row.dataset.id = item.id;

  const product = el('td', 'datos-producto');
  product.append(el('strong', 'nombre-producto', item.name), el('p', 'resumen-producto', type_label(item.type)));

  const actions = el('td', 'acciones-producto');
  const edit = el('button', 'boton-editar');
  edit.type = 'button';
  edit.title = 'Edit product';
  edit.setAttribute('aria-label', `Edit ${item.name}`);
  edit.dataset.action = 'edit';
  edit.dataset.id = item.id;
  edit.innerHTML = EDIT_ICON;
  actions.append(edit);

  row.append(
    product,
    el('td', 'identificador-producto', `#${item.id}`),
    el('td', 'descripcion-producto', item.description),
    el('td', 'costo-producto', money(item.price)),
    el('td', 'stock-producto', `${item.stock} u.`),
    actions,
  );
  return row;
}

export function render_stock_table(tbody, collection) {
  const items = collection.items;
  if (items.length === 0) {
    const row = el('tr');
    const cell = el('td', 'celda-vacia', 'No products found.');
    cell.colSpan = 6;
    row.append(cell);
    tbody.replaceChildren(row);
    return;
  }
  tbody.replaceChildren(...items.map(create_row));
}

export function render_summary(element, shown, total, value_total) {
  if (!element) return;
  element.textContent = `Showing ${shown} of ${total} products in catalog — total value ${money(value_total)}`;
}