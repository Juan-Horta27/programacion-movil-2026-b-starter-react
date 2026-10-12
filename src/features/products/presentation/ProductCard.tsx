import { IonBadge, IonItem, IonLabel } from '@ionic/react';

import type { ProductView } from '../domain/product';

export interface ProductCardProps {
  product: ProductView;
  /** Se invoca con el id del producto cuando la persona toca la tarjeta. */
  onSelect?: (id: number) => void;
}

/**
 * Tarjeta reutilizable de un producto (se usa en la lista).
 *
 * Igual que `EmptyState`: recibe los datos ya listos por props tipadas y avisa con `onSelect`,
 * sin saber de dónde vienen. La etiqueta de stock cambia de color para que el aviso se vea:
 * rojo si está agotado, amarillo si quedan pocas unidades y verde en otro caso.
 */
const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  let stockColor = 'success';
  if (product.isOutOfStock) stockColor = 'danger';
  else if (product.isLowStock) stockColor = 'warning';

  return (
    <IonItem button detail onClick={() => onSelect?.(product.id)}>
      <IonLabel>
        <h2>{product.name}</h2>
        <p>{product.category}</p>
        <p>{product.priceLabel}</p>
      </IonLabel>
      <IonBadge slot="end" color={stockColor}>
        {product.stockLabel}
      </IonBadge>
    </IonItem>
  );
};

export default ProductCard;
