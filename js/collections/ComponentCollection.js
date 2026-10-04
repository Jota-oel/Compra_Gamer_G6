import { Collection } from './Collection.js';
import { Component } from '../models/Component.js';

export class ComponentCollection extends Collection {
  static item_class = Component;

  modify_stock(id, amount) {
    const component = this.read(id);
    if (!component) throw new Error(`Component ${id} not found`);
    component.modify_stock(amount);
    this.persist();
    return component.stock;
  }

  stock_by_type() {
    return this.items.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] ?? 0) + c.stock;
      return acc;
    }, {});
  }
}