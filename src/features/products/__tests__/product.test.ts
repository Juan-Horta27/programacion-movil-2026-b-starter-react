import { describe, expect, it } from 'vitest';
import seedProducts from '../../../../server/data/products.json';
import {
  CATEGORIES,
  filterProducts,
  formatCOP,
  LOW_STOCK_THRESHOLD,
  toProductView,
  validateProduct,
} from '../domain/product';

/**
 * Pruebas unitarias de EJEMPLO (ya vienen dadas) para que `npm test` corra desde el inicio.
 * Muestran el estilo esperado: describe / it / expect, sin red ni pantallas.
 */
describe('datos semilla de la API (ejemplo)', () => {
  it('trae 8 productos con ids 1 a 8', () => {
    expect(seedProducts).toHaveLength(8);
    expect(seedProducts.map((item) => item.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('usa solo categorías permitidas y stock entero no negativo', () => {
    for (const item of seedProducts) {
      expect(CATEGORIES).toContain(item.category);
      expect(Number.isInteger(item.stock)).toBe(true);
      expect(item.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it('incluye productos agotados y con pocas unidades para probar las etiquetas', () => {
    expect(seedProducts.some((item) => item.stock === 0)).toBe(true);
    expect(seedProducts.some((item) => item.stock > 0 && item.stock < LOW_STOCK_THRESHOLD)).toBe(true);
  });
});

describe('formatCOP (ejemplo)', () => {
  it('separa los miles con punto y antepone el signo de pesos', () => {
    expect(formatCOP(1250000)).toBe('$ 1.250.000');
    expect(formatCOP(8500)).toBe('$ 8.500');
    expect(formatCOP(950)).toBe('$ 950');
  });
});

describe('validateProduct', () => {
  it('rechaza un nombre vacío, un precio menor o igual que 0 y una categoría no permitida', () => {
    const result = validateProduct({ name: '   ', price: 0, category: 'Ropa', stock: 2.5 });

    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).sort()).toEqual(['category', 'name', 'price', 'stock']);
  });

  it('acepta un producto válido y rechaza un nombre de más de 60 caracteres', () => {
    const valid = { name: 'Café molido 500 g', price: 18500, category: 'Bebidas', stock: 0 };

    expect(validateProduct(valid)).toEqual({ isValid: true, errors: {} });
    expect(validateProduct({ ...valid, name: 'a'.repeat(61) }).errors.name).toBeDefined();
  });
});

describe('toProductView', () => {
  it('formatea el precio en pesos y marca «Agotado» y «Pocas unidades»', () => {
    const [, , lowStock, , outOfStock, , , pot] = seedProducts.map(toProductView);

    expect(pot.priceLabel).toBe('$ 189.900');
    expect(pot.stockLabel).toBe('Disponible');
    expect(lowStock).toMatchObject({ stockLabel: 'Pocas unidades', isLowStock: true, isOutOfStock: false });
    expect(outOfStock).toMatchObject({ stockLabel: 'Agotado', isLowStock: false, isOutOfStock: true });
  });
});

describe('filterProducts', () => {
  it('filtra por texto sin distinguir mayúsculas y por categoría exacta', () => {
    const idsOf = (search: string, category: string) =>
      filterProducts(seedProducts, { search, category }).map((product) => product.id);

    expect(idsOf('JABÓN', '')).toEqual([7]);
    expect(idsOf('', 'Snacks')).toEqual([4, 5]);
    expect(idsOf('de', 'Snacks')).toEqual([5]);
    expect(idsOf('   ', '')).toHaveLength(8);
    expect(idsOf('', 'snacks')).toEqual([]); // la categoría es exacta
  });
});
