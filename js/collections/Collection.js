import { storage } from '../utils/storage.js';

/**
 * Base array wrapper with CRUD, filter_by_type and value_total.
 * filter_by_type() returns a NEW collection (not persisted), so it can be chained:
 *   components.filter_by_type('ram').value_total()
 */
export class Collection {
  static item_class = null; // set in subclasses

  #items;
  #storage_key;

  constructor(items = [], storage_key = null) {
    this.#items = [...items];
    this.#storage_key = storage_key;
  }

  static from_storage(storage_key) {
    const raw = storage.load(storage_key, []);
    return new this(raw.map((d) => this.item_class.from_json(d)), storage_key);
  }

  get items() { return [...this.#items]; }
  get length() { return this.#items.length; }

  persist() {
    if (this.#storage_key) storage.save(this.#storage_key, this.#items);
  }

  // --- CRUD ---
  create(item) {
    if (!(item instanceof this.constructor.item_class)) {
      throw new Error(`Expected an instance of ${this.constructor.item_class.name}`);
    }
    this.#items.push(item);
    this.persist();
    return item;
  }

  read(id) {
    return this.#items.find((item) => item.id === id) ?? null;
  }

  update(id, changes) {
    const item = this.read(id);
    if (!item) throw new Error(`Item ${id} not found`);
    const { stock, ...fields } = changes;
    for (const [key, value] of Object.entries(fields)) {
      if (['name', 'description', 'price', 'type', 'url'].includes(key)) item[key] = value;
    }
    if (stock !== undefined) item.modify_stock(stock - item.stock); // absolute stock value
    this.persist();
    return item;
  }

  delete(id) {
    const index = this.#items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error(`Item ${id} not found`);
    const [removed] = this.#items.splice(index, 1);
    this.persist();
    return removed;
  }

  // --- queries ---
  /** type: string or string[]. Returns a new, non-persisted collection. */
  filter_by_type(type) {
    const types = Array.isArray(type) ? type : [type];
    return new this.constructor(this.#items.filter((item) => types.includes(item.type)));
  }

  value_total() {
    return this.#items.reduce((sum, item) => sum + item.get_value(), 0);
  }

  /** Plain objects ready to render in a table. */
  to_rows() {
    return this.#items.map((item) => item.toJSON());
  }
}