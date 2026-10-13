# Screen — Detalle de producto

- **Route:** `/productos/:id`
- **Feature:** [Catálogo de productos](../features/productos.md)
- **Design reference:** N/A (sin mockup; se usan componentes de Ionic)

---

## Purpose

Ver todos los datos de un producto (id, nombre, categoría, precio, stock y etiqueta de stock) y desde ahí editarlo o eliminarlo.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader` + `IonBackButton` + `IonTitle` | Título «Detalle del producto»; el botón atrás vuelve a `/productos` |
| Body | `IonList` con un `IonItem` por campo | Id, nombre, categoría, precio con `formatCOP`, stock y etiqueta de stock (de `toProductView`) |
| Footer / CTA | `IonButton` «Editar» y `IonButton` «Eliminar» | Al tocar «Eliminar» aparece la confirmación en la misma pantalla |
| Confirmación | Texto + `IonButton` «Confirmar» y «Cancelar» | «¿Eliminar este producto?». Solo se ve mientras `isConfirmingDelete` es `true` |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | Se está pidiendo el producto | Texto «Cargando producto…» |
| Loaded | La API devolvió el producto | Datos del producto y botones |
| No encontrado | La API respondió 404 | `EmptyState` «No encontramos ese producto.»; se regresa con el botón atrás |
| Error | La API no responde u otro error | `EmptyState` con el mensaje de `getErrorMessage` |
| Error al eliminar | `DELETE` falla | Mensaje de error encima de los botones; el producto sigue en pantalla |
| Empty / Offline | N/A | Un detalle no puede estar vacío; sin conexión se ve el estado Error |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Abrir la pantalla | Pide el producto con el id de la ruta | `getProduct(Number(id))` |
| Tocar «Editar» | Abre `/productos/:id/editar` | navegación |
| Tocar «Eliminar» | Muestra «¿Eliminar este producto?» con Confirmar y Cancelar | `isConfirmingDelete = true` |
| Tocar «Cancelar» | Oculta la confirmación | `isConfirmingDelete = false` |
| Tocar «Confirmar» | Elimina el producto y vuelve a `/productos` | `deleteProduct(id)` + `useHistory` |

---

## Accessibility

- [x] All interactive elements have accessible labels (todos los botones tienen texto).
- [x] Touch targets ≥ 44×44 pt / 48×48 dp (tamaño por defecto de `IonButton`).
- [x] Text scales with OS font-size setting (Ionic usa unidades relativas).
- [ ] Contrast meets WCAG AA (no se midió; se usan los colores por defecto de Ionic).
