# Screen — Lista de productos

- **Route:** `/productos`
- **Feature:** [Catálogo de productos](../features/productos.md)
- **Design reference:** N/A (sin mockup; se usan componentes de Ionic)

---

## Purpose

Ver el catálogo completo, buscar un producto por su nombre, filtrar por categoría y entrar al detalle de un producto o al formulario para crear uno nuevo.

---

## UI regions

| Region | Component | Notes |
|--------|-----------|-------|
| Header | `IonHeader` + `IonToolbar` + `IonTitle` | Título «Productos» |
| Filtros | `IonInput` + cinco `IonButton` | Buscador por texto y botones «Todas», «Bebidas», «Snacks», «Aseo» y «Hogar». El botón activo se ve relleno |
| Body | `IonList` con un `ProductCard` por producto | Cada tarjeta muestra nombre, categoría, precio en pesos y la etiqueta de stock |
| Footer / CTA | `IonButton` | «Nuevo producto», lleva a `/productos/nuevo` |

---

## States

| State | Trigger | UI |
|-------|---------|-----|
| Loading | La lista se está pidiendo a la API | Texto «Cargando productos…» |
| Loaded | La API devolvió productos | Lista de `ProductCard` filtrada con `filterProducts` |
| Empty | La API devolvió un arreglo vacío | `EmptyState` «No hay productos» (el botón «Nuevo producto» sigue visible) |
| Sin resultados | Hay productos, pero el filtro no deja ninguno | `EmptyState` «Sin resultados» que invita a cambiar la búsqueda o la categoría |
| Error | La API no responde o responde con error | `EmptyState` con el mensaje de `getErrorMessage` y el botón «Reintentar» |
| Offline | N/A | Sin conexión se ve el estado Error |

---

## Actions

| User action | Result | Use case / event |
|-------------|--------|------------------|
| Escribir en el buscador | La lista se filtra por nombre, sin distinguir mayúsculas | `filterProducts` |
| Tocar un botón de categoría | La lista muestra solo esa categoría («Todas» quita el filtro) | `filterProducts` |
| Tocar un producto | Abre `/productos/:id` | navegación (`useHistory`) |
| Tocar «Nuevo producto» | Abre `/productos/nuevo` | navegación |
| Tocar «Reintentar» | Vuelve a pedir la lista | `getProducts` |
| Volver a esta pantalla desde otra | La lista se recarga para mostrar los cambios | `useIonViewWillEnter` + `getProducts` |

---

## Accessibility

- [x] All interactive elements have accessible labels (los botones tienen texto y el buscador tiene `label`).
- [x] Touch targets ≥ 44×44 pt / 48×48 dp (tamaño por defecto de `IonButton` e `IonItem`).
- [x] Text scales with OS font-size setting (Ionic usa unidades relativas).
- [ ] Contrast meets WCAG AA (no se midió; se usan los colores por defecto de Ionic).
