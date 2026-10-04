import { storage } from '../utils/storage.js';

export class Cart {
  #lines;
  #storage_key;

  constructor(lines = [], storage_key = null) {
    this.#lines = lines.map((l) => ({ ...l }));
    this.#storage_key = storage_key;
  }

  static from_storage(storage_key = 'techcore:cart') {
    return new Cart(storage.load(storage_key, []), storage_key);
  }

  get lines() { return this.#lines.map((l) => ({ ...l })); }
  get count() { return this.#lines.reduce((sum, l) => sum + l.quantity, 0); }

  persist() {
    if (this.#storage_key) storage.save(this.#storage_key, this.#lines);
  }

  add(computer, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Quantity must be an integer >= 1');
    const line = this.#lines.find((l) => l.id === computer.id);
    const new_quantity = (line?.quantity ?? 0) + quantity;
    if (new_quantity > computer.stock) {
      throw new Error(`Only ${computer.stock} unit(s) of "${computer.name}" available`);
    }
    if (line) {
      line.quantity = new_quantity;
    } else {
      this.#lines.push({ id: computer.id, name: computer.name, price: computer.price, url: computer.url, quantity });
    }
    this.persist();
    return this.count;
  }

  set_quantity(id, quantity, max_stock = Infinity) {
    if (!Number.isInteger(quantity) || quantity < 0) throw new Error('Quantity must be an integer >= 0');
    if (quantity > max_stock) throw new Error(`Only ${max_stock} unit(s) available`);
    if (quantity === 0) return this.remove(id);
    const line = this.#lines.find((l) => l.id === id);
    if (!line) throw new Error(`Cart line ${id} not found`);
    line.quantity = quantity;
    this.persist();
    return this.count;
  }

  remove(id) {
    this.#lines = this.#lines.filter((l) => l.id !== id);
    this.persist();
    return this.count;
  }

  clear() {
    this.#lines = [];
    this.persist();
  }

  get_total() {
    return this.#lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  }
}