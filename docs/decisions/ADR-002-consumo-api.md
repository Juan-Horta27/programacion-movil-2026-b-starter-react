# ADR-002 — Consumo de la API desde la app

- **ID:** ADR-002
- **Date:** 2026-10-10
- **Status:** Accepted
- **Authors:** Juan José Horta Vanegas

---

## Context

La app tiene que leer, crear, editar y eliminar productos en nuestra API Express (`server/`). Hay que decidir con qué se hacen las peticiones, dónde se escribe la dirección de la API y cómo llegan los errores a la pantalla.

`fetch` no lanza una excepción cuando la API responde 400, 404 o 500; solo la lanza cuando no hay respuesta (por ejemplo, si el servidor está apagado). Si las pantallas no distinguen esos dos casos, la persona usuaria vería mensajes equivocados.

**Known constraints:**
- El starter ya trae `API_URL`, la clase `ApiError`, `getErrorMessage`, la función `request` y `getProducts`.
- Todo error de la API llega con el formato `{ "error": "mensaje", "details": ["..."] }`.
- La app (puerto 5173) y la API (puerto 3000) corren en orígenes distintos; la API ya tiene `cors()`.

---

## Decision

**We decided:** hacer todas las peticiones con `fetch` dentro de la capa `data` (`data/products-api.ts`), siempre a través de la función `request`, y convertir cualquier falla en un `ApiError` antes de que llegue a la pantalla.

**Justification:**
- `API_URL` sale de `data/config.ts`, que lee `VITE_API_URL` del archivo `.env` y, si no existe, usa `http://localhost:3000`. Así la dirección está en un solo lugar.
- `request` distingue los dos tipos de error: si `fetch` lanza una excepción, crea un `ApiError` de red (`status` en `null`); si la respuesta no es `ok`, lee el cuerpo `{ error, details }` y crea un `ApiError` con el código de estado. El 204 del DELETE no trae cuerpo y devuelve `undefined`.
- `getProduct`, `createProduct`, `updateProduct` y `deleteProduct` siguen el mismo patrón que `getProducts`, así que no se repite el manejo de errores.
- La traducción a un texto para la persona se hace en la presentación con `getErrorMessage`: error de red → «No fue posible conectar con el servidor…», 404 → «No encontramos ese producto.», y en otro caso el mensaje que envió la API. En el formulario, cuando la API rechaza el guardado (por ejemplo, con un 400), se muestra además cada texto de `details`.
- `fetch` ya viene en el navegador y en Node, y es lo que se usó en la semana 8.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| `fetch` + `request` + `ApiError` en `data/` | Sin dependencias, un solo lugar para los errores, ya viene en el starter | Hay que revisar `response.ok` a mano (ya lo hace `request`) | — (chosen) |
| Librería Axios | Lanza error con 4xx y 5xx automáticamente | Una dependencia más que no vimos en clase | No aporta lo suficiente para cinco endpoints |
| Llamar a `fetch` directamente en cada página | Menos archivos | Repite la URL y el manejo de errores en cada pantalla; mezcla capas | Rompe la separación `data` / `presentation` |

---

## Consequences

**Positive:**
- Las pantallas no saben de URLs ni de códigos HTTP: reciben datos o un `ApiError`.
- Un error de red y una respuesta 400/404/500 se muestran con mensajes distintos.
- Las pruebas de la API usan el mismo `fetch` contra `startTestServer()`.

**Negative / Trade-offs:**
- No hay reintentos automáticos ni caché: si la API falla, la persona toca «Reintentar» en la lista.
- No hay tiempo de espera máximo; si la API tarda mucho, la pantalla se queda en «Cargando…».

**Impact on the system:**
- Affected features/screens: lista, detalle y formulario de productos.
- Documents to update: `docs/api/products-endpoints.md` y la sección «API error handling» del README.

---

## References

- Mobile Governance Framework: `03-api-and-data/api-networking.md`.
- Related to: [ADR-001 — Manejo del estado](./ADR-001-estado.md).
