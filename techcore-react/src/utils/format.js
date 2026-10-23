const usd = (decimals) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const formatters = { 0: usd(0), 2: usd(2) };

/** format_price(1699.99) -> "$1,699.99"   format_price(1240, { decimals: 0 }) -> "$1,240" */
export function format_price(value, { decimals = 2 } = {}) {
  return (formatters[decimals] ?? usd(decimals)).format(value);
}

/** 'ram' -> 'RAM', 'processor' -> 'Processor', 'gaming' -> 'Gaming' */
export function type_label(type) {
  return type.length <= 3 ? type.toUpperCase() : type[0].toUpperCase() + type.slice(1);
}
