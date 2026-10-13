# Endpoint Integration — Productos (`/api/products`)

- **Feature:** [Catálogo de productos](../features/productos.md)
- **Base URL:** `API_URL` (por defecto `http://localhost:3000`, ver `src/features/products/data/config.ts`)
- **Auth required:** No

Este documento reúne los cinco endpoints del recurso. La entidad está descrita en [product-entity.md](./product-entity.md).

**Formato de error (todos los endpoints):**
```json
{ "error": "mensaje", "details": ["un texto por cada problema"] }
```

**Mensajes de validación (POST y PUT), uno en `details` por cada campo con problema:**

| Campo | Regla | Texto en `details` |
|-------|-------|--------------------|
| `name` | Texto no vacío (solo espacios cuenta como vacío) | `name es obligatorio` |
| `name` | Máximo 60 caracteres | `name debe tener máximo 60 caracteres` |
| `price` | Número mayor que 0 | `price debe ser un número mayor que 0` |
| `category` | Obligatoria, una de `Bebidas`, `Snacks`, `Aseo`, `Hogar` (exacta) | `category debe ser una de: Bebidas, Snacks, Aseo, Hogar` |
| `stock` | Entero mayor o igual que 0 | `stock debe ser un entero mayor o igual que 0` |

---

## 1. `GET /api/products` — lista con filtros

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `search` | query | string | No | Conserva los productos cuyo nombre contiene el texto, sin distinguir mayúsculas |
| `category` | query | string | No | Conserva solo los productos de esa categoría (coincidencia exacta) |

**Body:** ninguno.

### Response

**Success (200):** arreglo de productos (puede ser vacío).
```json
[{ "id": 1, "name": "Agua mineral 600 ml", "price": 1800, "category": "Bebidas", "stock": 120 }]
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| — | Este endpoint no tiene errores propios | — |
| Sin respuesta | La API está apagada o no hay red | La lista muestra el error de conexión y el botón «Reintentar» |

La app llama a `getProducts()` sin filtros y filtra en memoria con `filterProducts` (ver ADR-001). Los filtros por query quedan disponibles en la API y se prueban con `startTestServer()`.

---

## 2. `GET /api/products/:id` — detalle

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | integer | Yes | Solo dígitos; se lee con `parseId` |

**Body:** ninguno.

### Response

**Success (200):** el producto.
```json
{ "id": 3, "name": "Gaseosa cola 1,5 L", "price": 4800, "category": "Bebidas", "stock": 4 }
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | El id no es numérico: `{ "error": "Id inválido", "details": ["El id debe ser numérico"] }` | No ocurre desde la app: las rutas de la app solo aceptan dígitos en `:id` |
| 404 | No existe: `{ "error": "Producto no encontrado", "details": ["No existe un producto con id 99"] }` | El detalle y el formulario de edición muestran «No encontramos ese producto.» |

---

## 3. `POST /api/products` — crear

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| — | — | — | — | Sin parámetros; los datos van en el cuerpo |

**Body:**
```json
{ "name": "Café molido 500 g", "price": 18500, "category": "Bebidas", "stock": 10 }
```

### Response

**Success (201):** el producto creado, con un id nuevo e incremental (el siguiente al mayor que existe).
```json
{ "id": 9, "name": "Café molido 500 g", "price": 18500, "category": "Bebidas", "stock": 10 }
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | Datos inválidos: `{ "error": "Datos inválidos", "details": [...] }` | El formulario muestra el mensaje y cada texto de `details` |
| 400 | El cuerpo no es un JSON válido (lo responde el manejador de errores dado) | No ocurre desde la app: el cuerpo se arma con `JSON.stringify` |

---

## 4. `PUT /api/products/:id` — actualizar

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | integer | Yes | Solo dígitos; se lee con `parseId` |

**Body:** el producto completo, con las mismas reglas que el POST.
```json
{ "name": "Gaseosa cola 1,5 L", "price": 5000, "category": "Bebidas", "stock": 12 }
```

### Response

**Success (200):** el producto actualizado (el id no cambia).
```json
{ "id": 3, "name": "Gaseosa cola 1,5 L", "price": 5000, "category": "Bebidas", "stock": 12 }
```

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | Id no numérico o datos inválidos | El formulario muestra el mensaje y cada texto de `details` |
| 404 | No existe un producto con ese id | El formulario muestra «No encontramos ese producto.» y el texto de `details` |

---

## 5. `DELETE /api/products/:id` — eliminar

### Request

| Param | In | Type | Required | Notes |
|-------|----|------|----------|-------|
| `id` | path | integer | Yes | Solo dígitos; se lee con `parseId` |

**Body:** ninguno.

### Response

**Success (204):** sin cuerpo. `request` devuelve `undefined` y el detalle regresa a la lista.

### Errors

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 400 | El id no es numérico | No ocurre desde la app |
| 404 | No existe (por ejemplo, ya se había eliminado) | El detalle muestra el mensaje encima de los botones |

---

## Errores generales (manejadores que ya trae el starter)

| Status | Meaning | App behavior |
|--------|---------|--------------|
| 404 | Ruta desconocida: `{ "error": "Ruta no encontrada", "details": ["MÉTODO /ruta"] }` | No ocurre desde la app; se comprueba con una prueba |
| 500 | Error inesperado en el servidor: `{ "error": "Error interno del servidor", "details": [] }` | Se muestra el mensaje de la API (o el de `getErrorMessage`) |

---

## DTO → domain mapping

| DTO field | Domain field | Transform |
|-----------|--------------|-----------|
| `id`, `name`, `price`, `category`, `stock` | `Product` (`domain/product.ts`) | Ninguna: la API ya entrega la forma del dominio |
| `price` | `ProductView.priceLabel` | `formatCOP` (1250000 → «$ 1.250.000») |
| `stock` | `ProductView.stockLabel` | 0 → «Agotado»; menos de 5 → «Pocas unidades»; otro caso → «Disponible» |

---

## Caching / offline

- **Strategy:** online-only. Cada pantalla pide los datos al abrirse.
- **Cached entity:** N/A.
- **TTL / invalidation:** N/A. La lista se vuelve a pedir cada vez que se regresa a ella.
