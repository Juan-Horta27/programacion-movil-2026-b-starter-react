# Screen — Formulario de producto (crear y editar)

- **Route:** `/productos/nuevo` (crear) y `/productos/:id/editar` (editar)
- **Feature:** [Catálogo de productos](../features/productos.md)
- **Design reference:** N/A (sin mockup; se usan componentes de Ionic)

---

## Purpose

Crear un producto nuevo o cambiar los datos de uno que ya existe. Es la misma pantalla para las dos rutas: si la ruta trae `id`, se está editando.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader` + `IonBackButton` + `IonTitle` | Título «Nuevo producto» o «Editar producto» |
| Body | Tres `IonInput` (nombre, precio, stock) y cuatro `IonButton` de categoría | Debajo de cada campo aparece su mensaje de error (validación en línea) |
| Error del servidor | Texto con el mensaje y la lista de `details` | Solo se ve cuando la API rechaza los datos |
| Footer / CTA | `IonButton` «Guardar» | Valida, envía y regresa a la lista |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Editar: se están pidiendo los datos del producto | Texto «Cargando producto…» |
| Loaded | Crear: campos vacíos. Editar: campos llenos con los datos actuales | Formulario |
| Datos inválidos | `validateProduct` devuelve errores | Mensaje rojo debajo de cada campo con problema; no se envía nada |
| Rechazado por el servidor | La API responde 400 | Mensaje de la API y cada texto de `details` en una lista |
| Error / no encontrado | Editar: falla la carga o el id no existe | `EmptyState` con el mensaje; se regresa con el botón atrás |
| Empty / Offline | N/A | Sin conexión, al guardar se muestra el mensaje de error de red |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Abrir `/productos/:id/editar` | Pide el producto y llena los campos | `getProduct(Number(id))` |
| Escribir en un campo | Se actualiza su variable de estado | `onIonInput` |
| Tocar una categoría | Queda marcada como elegida | variable de estado `category` |
| Tocar «Guardar» con errores | Muestra el error junto a cada campo | `validateProduct` |
| Tocar «Guardar» con datos válidos | Crea o actualiza y vuelve a `/productos` | `createProduct` o `updateProduct` |
| La API rechaza los datos | Muestra su mensaje y sus `details` | `ApiError` con `status` 400 |

---

## Accessibility

- [x] All interactive elements have accessible labels (cada `IonInput` tiene `label` y los botones tienen texto).
- [x] Touch targets ≥ 44×44 pt / 48×48 dp (tamaño por defecto de `IonButton` e `IonInput`).
- [x] Text scales with OS font-size setting (Ionic usa unidades relativas).
- [ ] Contrast meets WCAG AA (no se midió; se usan los colores por defecto de Ionic).
