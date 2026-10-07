import { Collection } from "./Collection.js";
import { Computer } from "../models/Computer.js";

export class ComputerCollection extends Collection {
  static item_class = Computer;

  create_computer(data, component_collection, component_ids) {
    const components = [...new Set(component_ids)].map((id) => {
      const component = component_collection.read(id);
      if (!component) throw new Error(`Component ${id} not found`);
      return component;
    });

    const units = data.stock ?? 0;
    const short = components.filter((c) => c.stock < units).map((c) => c.name);
    if (short.length)
      throw new Error(
        `Not enough stock to build ${units} unit(s): ${short.join(", ")}`,
      );

    const computer = Computer.create_computer(data, components);
    components.forEach((c) => component_collection.modify_stock(c.id, -units));
    return this.create(computer);
  }

  modify_stock(id, amount) {
    const item = this.read(id);
    if (!item) throw new Error(`Computer ${id} not found`);

    if (typeof item.modify_stock === "function") {
      item.modify_stock(amount);
    } else {
      item.stock += amount;
    }

    this.persist();
    return item;
  }
}
