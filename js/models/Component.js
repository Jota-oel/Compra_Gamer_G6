import { generate_id } from '../Utils/id.js';

export const COMPONENT_TYPES = Object.freeze([
  'processor', 'motherboard', 'ram', 'ssd', 'hdd', 'gpu', 'psu', 'case',
]);

export class Component {
  #name;
  #description;
  #price;
  #type;

  constructor({ id, name, description = '', price, stock = 0, url = '', type }) {
    this.id = id ?? generate_id('PRD');
    this.name = name;
    this.description = description;
    this.price = price;
    this.type = type;
    this.url = url;
    this.stock = 0;
    if (stock) this.modify_stock(stock);
  }

  get name() { return this.#name; }
  set name(value) {
    if (typeof value !== 'string' || !value.trim()) throw new Error('Component name is required');
    this.#name = value.trim();
  }

  get description() { return this.#description; }
  set description(value) { this.#description = String(value ?? ''); }

  get price() { return this.#price; }
  set price(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      throw new Error('Component price must be a number >= 0');
    }
    this.#price = value;
  }

  get type() { return this.#type; }
  set type(value) {
    if (!COMPONENT_TYPES.includes(value)) {
      throw new Error(`Invalid component type "${value}". Allowed: ${COMPONENT_TYPES.join(', ')}`);
    }
    this.#type = value;
  }

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

  to_string() {
    return `${this.id} | ${this.name} | ${this.description} | $${this.price} | stock: ${this.stock} | ${this.type}`;
  }

  toJSON() {
    return {
      id: this.id, name: this.name, description: this.description,
      price: this.price, stock: this.stock, url: this.url, type: this.type,
    };
  }

  static from_json(data) {
    return new Component(data);
  }
}