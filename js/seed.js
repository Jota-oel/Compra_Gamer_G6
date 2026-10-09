import { Component } from './models/Component.js';

// 4 different images per category: each demo computer gets its own one.
const IMAGES = {
  gaming: [
    'https://www.venex.com.ar/products_images/thumb/1790610304_pc_gamer_powered_by_msi_advanced_amd_ryzen_5_8600g_16gb_512gb_nvme_b840_watercooler_750wpng',
    'https://www.venex.com.ar/products_images/thumb/1785948575_pc-pba-ryzen5700gjpg',
    'https://imagenes.compragamer.com/productos/compragamer_Imganen_general_0_PC_Gamer_AMD_Ryzen_5_9600X_RTX_5060_16GB_Y60_BLACK_B850M_16GB_1TB_SSD_NVMe_WIFI_Water_Cooler_29879d17-grn.jpg',
    'https://imagenes.compragamer.com/productos/compragamer_Imganen_general_0_PC_Gamer_AMD_Ryzen_5_9600X_RTX_5060_8GB_Y40_CHERRY_B850M_16GB_1TB_SSD_NVMe_WIFI_Water_Cooler_d00e885b-grn.jpg',
  ],
  office: [
    'https://imgs.search.brave.com/TDQrK_jV_ZjwI6tkj_YL8rqm9EKU-uPVOvc1LbhWAOg/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzk5LzM0/L2ZiLzk5MzRmYjMw/NzQ5YWI0ZTAyY2Ey/ZjdkMzc3MTI3YzE5/LmpwZw',
    'https://www.venex.com.ar/products_images/thumb/1749731626_30.jpg',
    'https://www.venex.com.ar/products_images/thumb/1785846152_mini_pc_cx_intel_i5_1250p_8gb_240gb_free1jpg',
    'https://www.venex.com.ar/products_images/thumb/1779307015_mini_pc_cx_amd_ryzen_3_3250ujpg',
  ],
};

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

  // images are taken in order within each category: the 4 gaming PCs and the 4 office PCs all differ
  const used = { gaming: 0, office: 0 };
  demo.forEach(([data, ids]) => {
    const images = IMAGES[data.type];
    const url = images[used[data.type]++ % images.length];
    computers.create_computer({ ...data, url }, components, ids);
  });
  return true;
}