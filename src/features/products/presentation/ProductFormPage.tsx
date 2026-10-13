import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ApiError, getErrorMessage } from '../data/api-error';
import { createProduct, getProduct, updateProduct } from '../data/products-api';
import { CATEGORIES, validateProduct, type ValidationResult } from '../domain/product';
import EmptyState from './EmptyState';

type LoadStatus = 'loading' | 'ready' | 'error';

interface ServerError {
  message: string;
  details: string[];
}

/** Convierte el texto de un campo numérico en número; vacío da NaN para que la validación lo rechace. */
function toNumber(text: string): number {
  return text.trim() === '' ? Number.NaN : Number(text);
}

/**
 * Pantalla: formulario de producto. La misma pantalla sirve para dos rutas:
 *  - /productos/nuevo          → crear (no hay `id` en la ruta)
 *  - /productos/:id/editar     → editar (hay `id`; los campos se llenan con `getProduct`)
 *
 * Cada campo es un campo controlado: su valor vive en una variable de estado y `onIonInput` la
 * actualiza. Precio y stock se guardan como texto mientras se escriben y se convierten a número al
 * guardar. Al tocar «Guardar» se valida con `validateProduct` (las mismas reglas de la API) y cada
 * error se muestra debajo de su campo. Si la API rechaza los datos, se muestran su mensaje y sus `details`.
 */
const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = id !== undefined;
  const productId = Number(id);
  const history = useHistory();

  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [category, setCategory] = useState('');
  const [stockText, setStockText] = useState('');
  const [status, setStatus] = useState<LoadStatus>(isEditing ? 'loading' : 'ready');
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState<ValidationResult['errors']>({});
  const [serverError, setServerError] = useState<ServerError | null>(null);

  useEffect(() => {
    if (!isEditing) return;
    const loadProduct = async () => {
      try {
        const product = await getProduct(productId);
        setName(product.name);
        setPriceText(String(product.price));
        setCategory(product.category);
        setStockText(String(product.stock));
        setStatus('ready');
      } catch (error) {
        setLoadError(getErrorMessage(error));
        setStatus('error');
      }
    };
    void loadProduct();
  }, [isEditing, productId]);

  const handleSave = async () => {
    const input = { name: name.trim(), price: toNumber(priceText), category, stock: toNumber(stockText) };
    const validation = validateProduct(input);
    setErrors(validation.errors);
    setServerError(null);
    if (!validation.isValid) return;

    try {
      if (isEditing) {
        await updateProduct(productId, input);
      } else {
        await createProduct(input);
      }
      history.replace('/productos');
    } catch (error) {
      setServerError({
        message: getErrorMessage(error),
        details: error instanceof ApiError ? error.details : [],
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/productos" />
          </IonButtons>
          <IonTitle>{isEditing ? 'Editar producto' : 'Nuevo producto'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {status === 'loading' && <p>Cargando producto…</p>}
        {status === 'error' && <EmptyState title="No se pudo cargar el producto" message={loadError} />}
        {status === 'ready' && (
          <>
            <IonInput
              label="Nombre"
              labelPlacement="floating"
              fill="outline"
              value={name}
              onIonInput={(event) => setName(String(event.detail.value ?? ''))}
            />
            {errors.name && (
              <IonText color="danger">
                <p>{errors.name}</p>
              </IonText>
            )}

            <IonInput
              className="ion-margin-top"
              label="Precio"
              labelPlacement="floating"
              fill="outline"
              type="number"
              value={priceText}
              onIonInput={(event) => setPriceText(String(event.detail.value ?? ''))}
            />
            {errors.price && (
              <IonText color="danger">
                <p>{errors.price}</p>
              </IonText>
            )}

            <p>Categoría</p>
            {CATEGORIES.map((item) => (
              <IonButton
                key={item}
                size="small"
                fill={category === item ? 'solid' : 'outline'}
                onClick={() => setCategory(item)}
              >
                {item}
              </IonButton>
            ))}
            {errors.category && (
              <IonText color="danger">
                <p>{errors.category}</p>
              </IonText>
            )}

            <IonInput
              className="ion-margin-top"
              label="Stock"
              labelPlacement="floating"
              fill="outline"
              type="number"
              value={stockText}
              onIonInput={(event) => setStockText(String(event.detail.value ?? ''))}
            />
            {errors.stock && (
              <IonText color="danger">
                <p>{errors.stock}</p>
              </IonText>
            )}

            {serverError && (
              <IonText color="danger">
                <p>{serverError.message}</p>
                <ul>
                  {serverError.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </IonText>
            )}

            <IonButton expand="block" className="ion-margin-top" onClick={() => void handleSave()}>
              Guardar
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductFormPage;
