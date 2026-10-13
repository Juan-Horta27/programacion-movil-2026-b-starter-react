import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { getErrorMessage } from '../data/api-error';
import { getProducts } from '../data/products-api';
import { CATEGORIES, filterProducts, toProductView, type Product } from '../domain/product';
import EmptyState from './EmptyState';
import ProductCard from './ProductCard';

/**
 * Pantalla: lista de productos (ruta /productos).
 *
 * La carga ya venía en el starter:
 *  - `useState` guarda los productos, el estado de la carga y el mensaje de error;
 *  - `useEffect` con `[]` carga la lista UNA vez, al abrir la pantalla;
 *  - `useIonViewWillEnter` la recarga cuando la persona VUELVE a esta pantalla (Ionic mantiene la
 *    página en memoria, así que sin esto no se vería, por ejemplo, un producto recién creado).
 *
 * El buscador y la categoría son dos variables de estado más. No se vuelve a pedir la lista al
 * filtrar: `filterProducts` filtra en memoria los productos ya cargados (ver ADR-001).
 * Estados: cargando, error (con «Reintentar»), vacío (la API no tiene productos) y sin resultados
 * (hay productos, pero los filtros no dejan ninguno).
 */
type LoadStatus = 'loading' | 'ready' | 'error';

/** Botones del filtro: «Todas» (sin filtro) y una por cada categoría. */
const categoryOptions = [
  { label: 'Todas', value: '' },
  ...CATEGORIES.map((item) => ({ label: item, value: item })),
];

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(''); // '' = «Todas»
  const isLoadingRef = useRef(false);
  const history = useHistory();

  const loadProducts = useCallback(async () => {
    if (isLoadingRef.current) return; // evita pedir la lista dos veces a la vez
    isLoadingRef.current = true;
    setStatus('loading');
    try {
      setProducts(await getProducts());
      setStatus('ready');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setStatus('error');
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useIonViewWillEnter(() => {
    void loadProducts();
  });

  const visibleProducts = filterProducts(products, { search, category });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Productos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {status === 'loading' && <p className="ion-padding">Cargando productos…</p>}
        {status === 'error' && (
          <EmptyState
            title="No se pudo cargar"
            message={errorMessage}
            actionLabel="Reintentar"
            onAction={() => void loadProducts()}
          />
        )}
        {status === 'ready' && products.length === 0 && (
          <EmptyState title="No hay productos" message="Todavía no se ha registrado ningún producto." />
        )}
        {status === 'ready' && products.length > 0 && (
          <>
            <div className="ion-padding">
              <IonInput
                label="Buscar por nombre"
                labelPlacement="floating"
                fill="outline"
                value={search}
                onIonInput={(event) => setSearch(String(event.detail.value ?? ''))}
              />
              <div className="ion-margin-top">
                {categoryOptions.map((option) => (
                  <IonButton
                    key={option.label}
                    size="small"
                    fill={category === option.value ? 'solid' : 'outline'}
                    onClick={() => setCategory(option.value)}
                  >
                    {option.label}
                  </IonButton>
                ))}
              </div>
            </div>
            {visibleProducts.length === 0 ? (
              <EmptyState title="Sin resultados" message="Ningún producto coincide con la búsqueda o la categoría." />
            ) : (
              <IonList>
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={toProductView(product)}
                    onSelect={(id) => history.push(`/productos/${id}`)}
                  />
                ))}
              </IonList>
            )}
          </>
        )}
        <IonButton routerLink="/productos/nuevo" className="ion-margin">
          Nuevo producto
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default ProductListPage;
