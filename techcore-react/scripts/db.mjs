// Manages the working copy of the JSON database.
//   node scripts/db.mjs init   -> creates data.json from data.seed.json only if it does not exist
//   node scripts/db.mjs reset  -> overwrites data.json with data.seed.json (and reloads a running API)
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'api', 'db');
const seed = join(dir, 'data.seed.json');
const data = join(dir, 'data.json');
const command = process.argv[2];
const api_url = process.env.VITE_API_URL ?? `http://localhost:${process.env.PORT ?? 3001}`;

if (command === 'init') {
  if (existsSync(data)) {
    console.log('[db] data.json already exists, keeping it (use `npm run db:reset` to restore the seed)');
  } else {
    copyFileSync(seed, data);
    console.log('[db] data.json created from data.seed.json');
  }
} else if (command === 'reset') {
  copyFileSync(seed, data);
  console.log('[db] data.json restored from data.seed.json');
  try {
    // a running API keeps the data in memory: tell it to reload, otherwise its next write would undo the reset
    const response = await fetch(`${api_url}/__reset`, { method: 'POST', signal: AbortSignal.timeout(1500) });
    console.log(response.ok ? '[db] running API reloaded the seed' : `[db] API answered ${response.status}`);
  } catch {
    console.log('[db] API is not running (nothing else to do)');
  }
} else {
  console.error('Usage: node scripts/db.mjs <init|reset>');
  process.exit(1);
}
