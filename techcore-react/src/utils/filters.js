/** Pure filters shared by Catalog and Home. Work with any list of { type, name, description, id, price, stock }. */
export const ALL = 'all';

/** type: 'all' | one type | array of types */
export function filter_by_type(list, type = ALL) {
  if (type == null || type === ALL || (Array.isArray(type) && type.length === 0)) return list;
  const types = Array.isArray(type) ? type : [type];
  return list.filter((item) => types.includes(item.type));
}

/** Case-insensitive search in name, description and id. */
export function search(list, text = '') {
  const query = text.trim().toLowerCase();
  if (!query) return list;
  return list.filter((item) =>
    [item.name, item.description, item.id].some((value) => String(value ?? '').toLowerCase().includes(query)));
}

export function filter_list(list, { type = ALL, text = '' } = {}) {
  return search(filter_by_type(list, type), text);
}

/** Total value of a list (price * stock), e.g. for "total value $..." in the catalog summary. */
export function value_total(list) {
  return list.reduce((sum, item) => sum + item.price * item.stock, 0);
}
