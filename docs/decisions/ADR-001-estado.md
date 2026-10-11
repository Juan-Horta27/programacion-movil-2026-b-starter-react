# ADR-001 — Manejo del estado en las pantallas

- **ID:** ADR-001
- **Date:** 2026-10-10
- **Status:** Accepted
- **Authors:** Juan José Horta Vanegas

---

## Context

La app tiene tres pantallas (lista, detalle y formulario) que piden datos a la API y tienen que mostrar estados de carga, error, vacío y sin resultados. Hay que decidir dónde se guardan esos datos antes de escribir las pantallas, porque de eso depende cómo se escribe cada página.

Ninguna pantalla comparte datos con otra mientras está abierta: la lista pide la lista, el detalle pide un producto por su id y el formulario pide el producto solo cuando se edita. Lo que una pantalla necesita de otra (el id) llega en la ruta.

**Known constraints:**
- Parcial individual de 6 a 8 horas; se usa solo lo visto en las semanas 6 a 9.
- El starter ya trae la lista cargada con `useState`, `useEffect` y `useIonViewWillEnter`.
- El PDF indica que el estado vive en cada página con `useState` y `useEffect`.

---

## Decision

**We decided:** guardar el estado de cada pantalla dentro de su propia página con `useState` y cargar los datos con `useEffect`, sin un store global.

**Justification:**
Cada pantalla solo necesita sus propios datos, así que un estado global no aporta nada y sí agrega código. Con `useState` cada página es fácil de leer: sus variables están arriba y se ve qué cambia cada una. La carga se describe con una variable `status` (`'loading' | 'ready' | 'error'`), así la página muestra un solo estado a la vez. Para que la lista muestre los cambios al volver del formulario o del detalle, se recarga con `useIonViewWillEnter`, porque Ionic deja la página en memoria. El filtrado se hace en la lista con `filterProducts` sobre los productos ya cargados, para no pedir la lista otra vez cada vez que se escribe una letra.

---

## Evaluated alternatives

| Alternative | Pros | Cons | Reason for discarding |
|-------------|------|------|-----------------------|
| `useState` + `useEffect` en cada página | Simple, ya está en el starter, se vio en clase | Si dos pantallas necesitaran el mismo dato, cada una lo pediría por separado | — (chosen) |
| Un hook propio por pantalla (por ejemplo, `useProducts`) | Saca la lógica de carga de la página | Un archivo más por pantalla sin un beneficio claro en una app tan pequeña | No hace falta con tres pantallas |
| Store global (Context de React o una librería tipo Redux) | Un solo lugar para todos los datos | Más código y conceptos que no vimos; los datos tendrían que mantenerse sincronizados con la API | Las pantallas no comparten estado |

---

## Consequences

**Positive:**
- Cada página se entiende sola, sin buscar el estado en otro archivo.
- Las pantallas siempre muestran lo que tiene la API, porque cada una pide sus datos al abrirse.

**Negative / Trade-offs:**
- Se hacen más peticiones: la lista se vuelve a pedir cada vez que se regresa a ella.
- El código de carga (`status`, `try/catch`) se repite un poco en la lista, el detalle y el formulario.
- El framework recomienda que la presentación no llame a la capa de datos directamente; aquí las páginas llaman a `data/products-api.ts`, como propone el starter, para no crear casos de uso que no aportan nada en este tamaño.
- Si la app creciera (carrito, sesión de usuario, datos compartidos entre pantallas), habría que pasar a un hook propio o a un store.

**Impact on the system:**
- Affected features/screens: lista, detalle y formulario de productos.
- Documents to update: `docs/features/productos.md` y la sección «State management decision» del README.

---

## References

- Mobile Governance Framework: `01-architecture/layers-and-state.md`.
- Related to: [ADR-002 — Consumo de la API](./ADR-002-consumo-api.md).
