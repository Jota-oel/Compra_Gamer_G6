import { Component } from './models/Component.js';
import { ComponentCollection } from './collections/ComponentCollection.js';
import { ComputerCollection } from './collections/ComputerCollection.js';

export const components = ComponentCollection.from_storage('techcore:components');
export const computers = ComputerCollection.from_storage('techcore:computers');

export { Component };
export { Computer } from './models/Computer.js';
