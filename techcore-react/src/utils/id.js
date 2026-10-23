export function generate_id(prefix) {
  const uid = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2).padEnd(8, '0');
  return `${prefix}-${uid.slice(0, 8).toUpperCase()}`;
}
