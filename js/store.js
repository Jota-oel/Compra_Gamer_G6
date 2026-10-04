import { Component } from './models/Component.js';
import { ComponentCollection } from './collections/ComponentCollection.js';
import { ComputerCollection } from './collections/ComputerCollection.js';

export const components = ComponentCollection.from_storage('techcore:components');
export const computers = ComputerCollection.from_storage('techcore:computers');

export { Component };
export { Computer } from './models/Computer.js';

const cpu = components.create(new Component({ name: 'Ryzen 9 7950X', description: '16 cores / 32 threads', price: 1240, stock: 18, type: 'processor' }));

computers.create_computer(
  { name: 'TechCore Titan', type: 'gaming', stock: 2 },
  components,
  [cpu.id, gpu.id, mb.id, ram.id, ssd.id, psu.id, case_.id]
);

components.filter_by_type('processor').value_total();
computers.filter_by_type('gaming').value_total();
components.stock_by_type();
computers.read(id).to_description_string();
components.to_rows();
