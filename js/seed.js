import { Component } from './models/Component.js';

const IMG = [
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=600&q=80',
];

/** Demo data so the pages show something while there are no create/edit forms. Safe to delete later. */
export function seed_if_empty(components, computers) {
  if (components.length > 0 || computers.length > 0) return false;

  const add = (name, description, price, stock, type) =>
    components.create(new Component({ name, description, price, stock, type }));

  const r9 = add('Ryzen 9 7950X', '16 cores / 32 threads', 1240, 30, 'processor');
  const i5 = add('Core i5-13400', '10 cores / 16 threads', 380, 30, 'processor');
  const mb_x = add('ASUS ROG X670E', 'AM5 / DDR5 / WiFi 6E', 520, 30, 'motherboard');
  const mb_b = add('MSI PRO B660M', 'LGA1700 / DDR4', 140, 30, 'motherboard');
  const ram32 = add('Corsair 32 GB DDR5', '2x16 GB 6000 MHz', 160, 40, 'ram');
  const ram16 = add('Kingston 16 GB DDR4', '2x8 GB 3200 MHz', 55, 40, 'ram');
  const ssd = add('Samsung 990 Pro 1 TB', 'NVMe PCIe 4.0', 110, 40, 'ssd');
  const hdd = add('Seagate Barracuda 2 TB', '7200 RPM', 60, 20, 'hdd');
  const gpu = add('GeForce RTX 4080', '16 GB GDDR6X', 1980, 20, 'gpu');
  const psu_1k = add('Corsair RM1000x', '1000 W 80+ Gold', 190, 30, 'psu');
  const psu_500 = add('EVGA 500 W', '500 W 80+ White', 45, 30, 'psu');
  const case_a = add('NZXT H7 Flow', 'ATX mid tower', 130, 30, 'case');
  const case_b = add('Cooler Master Q300L', 'Micro-ATX', 60, 30, 'case');

  const gaming_parts = [r9, mb_x, ram32, ssd, gpu, psu_1k, case_a].map((c) => c.id);
  const office_parts = [i5, mb_b, ram16, ssd, psu_500, case_b].map((c) => c.id);
  const storage_parts = [i5, mb_b, ram16, hdd, psu_500, case_b].map((c) => c.id);

  const demo = [
    [{ name: 'TechCore Titan', type: 'gaming', stock: 4, price: 4299.99 }, gaming_parts],
    [{ name: 'Core Raptor-X Custom PC', type: 'gaming', stock: 3, price: 2899 }, gaming_parts],
    [{ name: 'Vortex RTX Pro', type: 'gaming', stock: 3, price: 3499.99 }, gaming_parts],
    [{ name: 'Nova Streamer', type: 'gaming', stock: 2, price: 3199 }, gaming_parts],
    [{ name: 'TechCore Office Pro', type: 'office', stock: 8, price: 749.99 }, office_parts],
    [{ name: 'Office Storage Plus', type: 'office', stock: 5, price: 649 }, storage_parts],
    [{ name: 'Workforce Slim', type: 'office', stock: 6, price: 599.99 }, office_parts],
    [{ name: 'Workforce Elite', type: 'office', stock: 4, price: 899 }, office_parts],
  ];
  demo.forEach(([data, ids], i) =>
    computers.create_computer({ ...data, url: IMG[i % IMG.length] }, components, ids));
  return true;
}