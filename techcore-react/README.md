# TechCore (React + Material UI)

E-commerce de computadoras. Migración del proyecto en JS vanilla a React + MUI. El "backend" es un JSON servido por json-server.
Estrategia completa y reparto de tareas: `ESTRATEGIA-react-mui.md`.

## Requisitos

- **Node >= 22.22** (lo exige React Router 8). Todo el equipo, la misma versión.

## Empezar

```bash
npm install
npm run dev:all      # API (http://localhost:3001) + app (http://localhost:5173)
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Solo la app (Vite) |
| `npm run api` | Solo la API de JSON. Crea `src/api/db/data.json` desde el seed si no existe |
| `npm run dev:all` | API + app juntas |
| `npm run db:reset` | Restaura los datos de partida. **Funciona con la API corriendo** (la recarga en memoria) |
| `npm run smoke` | Verifica `api/` + `services/` contra la API (24 chequeos). Escribe datos: correr `db:reset` después |
| `npm run lint` / `npm run build` | Calidad y build |

Variables de entorno: copiar `.env.example` a `.env` (solo hace falta para cambiar `VITE_API_URL`).

**Usuarios de prueba** (seed): `admin@techcore.com` / `admin123` (admin) y `user@techcore.com` / `user123` (user).

## Datos

- `src/api/db/data.seed.json` está versionado. `data.json` es la copia de trabajo, **no se commitea** (`.gitignore`).
- **Nunca importar `data.json` desde un componente**: sería un valor estático. Todo pasa por `api/` o por los hooks.
- Por qué `scripts/api.mjs` y no `json-server --watch`: en 0.17 el watcher reinicia el servidor cuando json-server escribe el archivo, y las peticiones fallaban al azar.
- json-server está fijado en **0.17.4** exacto (la 1.x sigue en beta). Decisión 1 del documento de estrategia.

## Estructura

```
src
├── api          http.js (único fetch) · Components.js · Computers.js · Orders.js · Users.js · Session.js · Carts.js · db/
├── components   auth/ (ProtectedRoute) · home/ · ui/ · (catalog, cart, dialogs: a crear por cada dueño)
├── context      objetos de contexto (uno por recurso)
├── hooks        useAuth · useComponents · useComputers · useCart · useNotify · useDebounce · useFilteredList
├── layout       MainLayout (placeholder: lo reemplaza Dev A)
├── models       Component · Computer (reglas de negocio, solo para validar)
├── pages        Home · Catalog · Login (placeholders) · NotFound
├── provider     AppProviders y un provider por recurso
├── services     inventory.js (operaciones que tocan varios recursos)
├── theme        theme.js (esqueleto: lo continúa Dev A)
└── utils        filters · format · id
```

## Contratos de los hooks (no cambiar sin avisar al líder)

| Hook | Expone |
|---|---|
| `useAuth()` | `user`, `ready`, `isAuthenticated`, `isAdmin`, `loading`, `login({email, password})`, `logout()`. **`ready` es `false` hasta leer la sesión del JSON**: esperarlo antes de decidir si hay sesión (`ProtectedRoute` ya lo hace) |
| `useComponents()` | `components`, `loading`, `error`, `reload()`, `create(data)`, `update(id, changes)`, `remove(id)`, `modify_stock(id, amount)` |
| `useComputers()` | `computers`, `loading`, `error`, `reload()`, `build_computer(data, componentIds)`, `update(id, changes)`, `remove(id)` |
| `useCart()` | `lines`, `count`, `total`, `loading`, `add(computer, qty)`, `set_quantity(id, qty)`, `remove(id)`, `clear()`, `checkout()` |
| `useNotify()` | `{ notify(message, severity) }` |
| `useFilteredList(list, { type, text })` | lista filtrada (memoizada) |
| `useDebounce(value, ms)` | valor con retardo |

Reglas de uso:

- **Las acciones async rechazan** con `Error` (validación del modelo o red): quien las llama decide dónde mostrar el mensaje (dentro del diálogo o con `notify`).
- **`useCart().add / set_quantity / remove / clear` son síncronas y lanzan** `Error` si la cantidad no es válida o supera el stock.
- `loading` es `true` solo hasta la **primera** respuesta; `reload()` refresca sin parpadeo.
- Las listas son **objetos planos**. No guardar instancias de `Component` / `Computer` en el estado: usarlas solo para validar.
- No llamar a `fetch` en componentes.

## Reglas que ya están implementadas

- `build_computer` (en `services/inventory.js`): relee el stock, valida esenciales (gaming exige GPU), descuenta 1 unidad por pieza y por unidad armada, guarda la computer y **deshace** lo hecho si algo falla.
- `checkout`: relee el stock de cada computer, lo descuenta, guarda la `order` con los precios actuales y **deshace** si falla.
- **Sin `localStorage`**: la app no escribe nunca en él (verificado con pruebas de integración que no vienen en este zip).
  - **Sesión**: se guarda en el JSON, en el objeto único `session` (`{ userId }`), y se restaura al recargar. Emula una sesión de servidor: sirve para una demo con un navegador a la vez.
  - **Carrito**: con sesión iniciada se guarda en el JSON (`carts`, uno por usuario) y se restaura al volver. Sin sesión vive solo en memoria (se pierde al recargar) y se **fusiona** con el guardado al iniciar sesión. Al cerrar sesión se vacía el carrito local (el guardado queda en el servidor).
  - `add / set_quantity / remove / clear` siguen siendo síncronas; el guardado ocurre en segundo plano y en orden. Si falla, avisa con `notify`.

## Supuestos a confirmar (decisiones abiertas del documento de estrategia)

- **Decisión 2**: carrito y sesión en el JSON, sin `localStorage` (implementado así).
- **Decisión 3**: el checkout crea una `order` y descuenta stock (implementado así).
- **Decisión 4**: `/catalog` solo para `admin`; `users` con forma `{ id, name, email, password, role }`. Si ya existe un `api/Users.js` propio, fusionarlo con el de este proyecto.
- **Decisión 9**: la descripción de una computer usa el formato largo con etiquetas. Se cambia en un solo lugar: `Computer.build_description`.

## Problemas frecuentes

- *"Cannot reach the API. Is `npm run api` running?"*: levantar `npm run api` (o usar `dev:all`).
- Los datos quedaron raros después de probar: `npm run db:reset`.
