# Feature — Catálogo de productos

- **Owner:** Juan José Horta Vanegas
- **Status:** In progress
- **Related stories:** N/A (parcial práctico C2, sin historias de usuario numeradas)

---

## Purpose

Permitir que una persona consulte el catálogo de productos de una tienda, lo busque por nombre o por categoría y pueda crear, editar o eliminar productos. Los datos vienen de nuestra propia API Express.

---

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| Lista de productos | `/productos` | Ver todos los productos, buscarlos por nombre y filtrarlos por categoría |
| Detalle de producto | `/productos/:id` | Ver todos los datos de un producto, ir a editarlo o eliminarlo |
| Formulario de producto | `/productos/nuevo` y `/productos/:id/editar` | Crear un producto nuevo o editar uno existente (una sola pantalla) |

> Cada pantalla tiene su documento en `docs/screens/`.

---

## State

- **Pattern:** estado local en cada página con `useState` y `useEffect` (ver [ADR-001](../decisions/ADR-001-estado.md)).
- **State object(s):**
  - Lista: `products`, `status` (`'loading' | 'ready' | 'error'`), `errorMessage`, `search` y `category`.
  - Detalle: `product`, `status`, `errorMessage`, `isConfirmingDelete` y `deleteError`.
  - Formulario: un valor por campo (`name`, `price`, `category`, `stock`), el `status` de la carga cuando se edita, los errores por campo de `validateProduct` y el error que devuelve el servidor.
- **Key transitions:**
  - Lista y detalle: `loading → ready` o `loading → error`; con «Reintentar», `error → loading`.
  - Formulario: edición → validación en línea → guardado → regreso a la lista, o error del servidor con sus `details`.

---

## Data

- **Use cases:** funciones del cliente HTTP en `data/products-api.ts`: `getProducts`, `getProduct`, `createProduct`, `updateProduct` y `deleteProduct`. Funciones del dominio en `domain/product.ts`: `validateProduct`, `toProductView`, `filterProducts` y `formatCOP`.
- **Repositories:** N/A. La capa `data` llama a la API directamente con `fetch` (ver [ADR-002](../decisions/ADR-002-consumo-api.md)).
- **Remote sources / endpoints:** `GET /api/products`, `GET /api/products/:id`, `POST /api/products`, `PUT /api/products/:id` y `DELETE /api/products/:id` (ver [products-endpoints.md](../api/products-endpoints.md)).
- **Local persistence:** N/A. La app no guarda datos en el teléfono, y la API los guarda en memoria (se reinician al apagar el servidor).

---

## Edge cases & states

- [x] Loading: la lista y el detalle muestran «Cargando…» mientras llega la respuesta.
- [x] Empty: la API no tiene productos → mensaje «No hay productos».
- [x] Sin resultados: hay productos, pero la búsqueda o la categoría no encuentran ninguno → mensaje propio, distinto del vacío.
- [x] Error / retry: la API no responde o responde con error → mensaje y botón «Reintentar».
- [x] No encontrado: el detalle o la edición de un id que no existe muestran «No encontramos ese producto.».
- [x] Datos inválidos: el formulario muestra el error junto a cada campo y, si el servidor rechaza, su mensaje y sus `details`.
- [ ] Offline: N/A como estado propio. Sin conexión, la petición falla y se ve el mismo estado de error con «Reintentar».
- [ ] Permission denied: N/A (la app no pide permisos ni tiene inicio de sesión).

---

## Decisions

- [ADR-001 — Manejo del estado](../decisions/ADR-001-estado.md)
- [ADR-002 — Consumo de la API](../decisions/ADR-002-consumo-api.md)

---

## Tests

- Unit: `validateProduct`, `toProductView` y `filterProducts` (Vitest, en `src/features/products/__tests__/product.test.ts`).
- Widget/UI: N/A en este parcial. Las pantallas se prueban a mano en el navegador contra la API.
- Integration/E2E: pruebas de la API con `startTestServer()` en `products-api.test.ts`: filtros, POST inválido (400), POST válido (201), GET de un id inexistente (404), id no numérico (400), PUT (200) y DELETE (204), y una ruta desconocida que llega al manejador 404.
