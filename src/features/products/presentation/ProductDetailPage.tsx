import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { getErrorMessage } from '../data/api-error';
import { deleteProduct, getProduct } from '../data/products-api';
import { toProductView, type ProductView } from '../domain/product';
import EmptyState from './EmptyState';

type LoadStatus = 'loading' | 'ready' | 'error';

/**
 * Pantalla: detalle de un producto (ruta /productos/:id).
 *
 * `useParams` lee el `:id` de la ruta; llega como TEXTO, así que se convierte con `Number`.
 * El producto se carga con `getProduct` (mismo patrón de la lista: `useState` + `useEffect`).
 * Un id que no existe llega como ApiError 404 y `getErrorMessage` lo traduce a «No encontramos
 * ese producto.». Para eliminar se pide confirmación en la misma pantalla con una variable booleana.
 */
const ProductDetailPage: React.FC = () => {
  const productId = Number(useParams<{ id: string }>().id);
  const history = useHistory();
  const [product, setProduct] = useState<ProductView | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      setStatus('loading');
      try {
        setProduct(toProductView(await getProduct(productId)));
        setStatus('ready');
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
        setStatus('error');
      }
    };
    void loadProduct();
  }, [productId]);

  const handleDelete = async () => {
    try {
      await deleteProduct(productId);
      history.replace('/productos');
    } catch (error) {
      setDeleteError(getErrorMessage(error));
      setIsConfirmingDelete(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>Detalle del producto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {status === 'loading' && <p>Cargando producto…</p>}
        {status === 'error' && <EmptyState title="No se pudo mostrar el producto" message={errorMessage} />}
        {status === 'ready' && product && (
          <>
            <IonList>
              <IonItem>
                <IonLabel>Id</IonLabel>
                <IonLabel slot="end">{product.id}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Nombre</IonLabel>
                <IonLabel slot="end">{product.name}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Categoría</IonLabel>
                <IonLabel slot="end">{product.category}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Precio</IonLabel>
                <IonLabel slot="end">{product.priceLabel}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Stock</IonLabel>
                <IonLabel slot="end">{product.stock}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Estado</IonLabel>
                <IonLabel slot="end">{product.stockLabel}</IonLabel>
              </IonItem>
            </IonList>

            {deleteError && (
              <IonText color="danger">
                <p>{deleteError}</p>
              </IonText>
            )}

            {/* Las `key` hacen que React cree botones nuevos al cambiar de bloque, en vez de
                reutilizar los anteriores con su color y relleno. */}
            {isConfirmingDelete ? (
              <div key="confirm" className="ion-margin-top">
                <p>¿Eliminar este producto?</p>
                <IonButton color="danger" onClick={() => void handleDelete()}>
                  Confirmar
                </IonButton>
                <IonButton fill="outline" onClick={() => setIsConfirmingDelete(false)}>
                  Cancelar
                </IonButton>
              </div>
            ) : (
              <div key="actions" className="ion-margin-top">
                <IonButton routerLink={`/productos/${product.id}/editar`}>Editar</IonButton>
                <IonButton color="danger" fill="outline" onClick={() => setIsConfirmingDelete(true)}>
                  Eliminar
                </IonButton>
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductDetailPage;
