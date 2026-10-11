# Local Entity — Product

- **Store:** N/A (almacenamiento en memoria). La API copia los 8 productos de `server/data/products.json` en un arreglo al arrancar; los cambios se pierden al reiniciar el servidor. La app no guarda nada en el teléfono.
- **Table/collection:** N/A (almacenamiento en memoria). En el código es el arreglo `products` dentro de `createApp()`.
- **Schema version introduced:** N/A (almacenamiento en memoria).

---

## Fields

| Column | Type | Null | Notes |
|--------|------|------|-------|
| `id` | integer | No | Identificador. Lo asigna la API al crear: el siguiente número al mayor que existe (incremental). No se cambia al editar |
| `name` | string | No | Obligatorio, no puede quedar vacío ni tener solo espacios. Máximo 60 caracteres. Se guarda sin espacios al inicio ni al final |
| `price` | number | No | Precio en pesos colombianos. Mayor que 0. En la app se muestra con `formatCOP` |
| `category` | string | No | Una de `Bebidas`, `Snacks`, `Aseo` u `Hogar` (coincidencia exacta, con mayúscula inicial) |
| `stock` | integer | No | Unidades disponibles. Entero mayor o igual que 0. En la app define la etiqueta: «Agotado», «Pocas unidades» (menos de 5) o «Disponible» |
| `created_at` / `updated_at` | — | — | N/A: la entidad no guarda fechas |

> En el ejercicio de Kotlin (`kotlin/Product.kt`) `stock` es `Int?` porque allí se pide practicar con un dato que puede faltar («Sin dato»). En la API y en la app, `stock` siempre es obligatorio.

---

## Indexes

| Index | Columns | Reason |
|-------|---------|--------|
| N/A (almacenamiento en memoria) | — | Las búsquedas recorren el arreglo con `find` y `filter` |

---

## Relationships

| Related entity | Key | Cardinality |
|----------------|-----|-------------|
| N/A | — | `Product` es la única entidad; la categoría es un texto, no otra entidad |

---

## Sync

- **Synced?** N/A (almacenamiento en memoria).
- **Conflict policy:** N/A. Si dos personas editan el mismo producto, queda el último cambio que llega a la API.

---

## Migration notes

N/A (almacenamiento en memoria). No hay base de datos ni migraciones; para volver a los datos iniciales basta con reiniciar `npm run server`.
