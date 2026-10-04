import { generate_id } from '../utils/id.js';

export const COMPUTER_TYPES = Object.freeze(['gaming', 'office']);

// Each inner array is a group of alternatives: at least one must be present.
const REQUIRED_GROUPS = Object.freeze({
  common: [['processor'], ['motherboard'], ['ram'], ['ssd', 'hdd'], ['psu'], ['case']],
  gaming: [['gpu']],
  office: [],
});

export class Computer {
  #name;
  #description;
  #price;
  #type;

  /**
   * Use Computer.create_computer() to build new ones (it validates components).
   * The constructor is also used to rehydrate data from localStorage.
   */
  constructor({ id, name, description = '', price, stock = 0, url = '', type, components = [] }) {
    this.id = id ?? generate_id('PC');
    this.name = name;
    this.description = description;
    this.price = price;
    this.type = type;
    this.url = url;
    this.stock = 0;
    if (stock) this.modify_stock(stock);
    // lightweight snapshot of the components used
    this.components = components.map(({ id, name, type, price }) => ({ id, name, type, price }));
  }

  // --- getters / setters ---
  get name() { return this.#name; }
  set name(value) {
    if (typeof value !== 'string' || !value.trim()) throw new Error('Computer name is required');
    this.#name = value.trim();
  }

  get description() { return this.#description; }
  set description(value) { this.#description = String(value ?? ''); }

  get price() { return this.#price; }
  set price(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      throw new Error('Computer price must be a number >= 0');
    }
    this.#price = value;
  }

  get type() { return this.#type; }
  set type(value) {
    if (!COMPUTER_TYPES.includes(value)) {
      throw new Error(`Invalid computer type "${value}". Allowed: ${COMPUTER_TYPES.join(', ')}`);
    }
    this.#type = value;
  }

  // --- static helpers ---
  /** Returns the list of missing essentials (e.g. ['processor', 'ssd/hdd']). Empty = OK. */
  static check_components(components, type) {
    const present = new Set(components.map((c) => c.type));
    const groups = [...REQUIRED_GROUPS.common, ...(REQUIRED_GROUPS[type] ?? [])];
    return groups.filter((g) => !g.some((t) => present.has(t))).map((g) => g.join('/'));
  }

  static build_description(components) {
    return components.map((c) => `${c.type.toUpperCase()}: ${c.name}`).join(' | ');
  }

  /**
   * data: { name, type, stock?, price?, url? }
   * components: Component[]
   * price defaults to the sum of the components' prices.
   */
  static create_computer(data, components) {
    if (!Array.isArray(components) || components.length === 0) {
      throw new Error('A computer needs a list of components');
    }
    if (!COMPUTER_TYPES.includes(data.type)) {
      throw new Error(`Invalid computer type "${data.type}". Allowed: ${COMPUTER_TYPES.join(', ')}`);
    }
    const missing = Computer.check_components(components, data.type);
    if (missing.length) {
      throw new Error(`Missing essential components: ${missing.join(', ')}`);
    }
    return new Computer({
      ...data,
      price: data.price ?? components.reduce((sum, c) => sum + c.price, 0),
      description: Computer.build_description(components),
      components,
    });
  }

  // --- methods ---
  modify_stock(amount) {
    if (!Number.isInteger(amount)) throw new Error('Stock amount must be an integer');
    if (this.stock + amount < 0) {
      throw new Error(`Not enough stock for "${this.name}" (available: ${this.stock})`);
    }
    this.stock += amount;
    return this.stock;
  }

  get_value() {
    return this.price * this.stock;
  }

  /** Full representation. */
  to_string() {
    return `${this.id} | ${this.name} | ${this.description} | $${this.price} | stock: ${this.stock} | ${this.type}`;
  }

  /** Reduced representation: [name, description, price, type] only. */
  to_description_string() {
    return `[${this.name}, ${this.description}, $${this.price}, ${this.type}]`;
  }

  toJSON() {
    return {
      id: this.id, name: this.name, description: this.description,
      price: this.price, stock: this.stock, url: this.url, type: this.type,
      components: this.components,
    };
  }

  static from_json(data) {
    return new Computer(data);
  }
}