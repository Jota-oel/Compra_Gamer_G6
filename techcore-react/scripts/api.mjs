// Fake backend: json-server on top of src/api/db/data.json.
// Why not `json-server --watch`? In 0.17 the watcher reloads the server when json-server ITSELF writes
// the file, which restarts it in the middle of requests (random "Cannot reach the API" errors).
// Here there is no watcher; POST /__reset reloads the seed in memory (used by `npm run db:reset`).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonServer from 'json-server';

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'api', 'db');
const PORT = Number(process.env.PORT ?? 3001);

const server = jsonServer.create();
const router = jsonServer.router(join(dir, 'data.json'));

server.use(jsonServer.defaults());
server.post('/__reset', (_request, response) => {
  router.db.setState(JSON.parse(readFileSync(join(dir, 'data.seed.json'), 'utf8')));
  router.db.write();
  response.json({ reset: true });
});
server.use(router);

server.listen(PORT, () => {
  console.log(`[api] json-server on http://localhost:${PORT}  (resources: components, computers, users, orders)`);
  console.log('[api] restore the seed with `npm run db:reset` (works while this is running)');
});
