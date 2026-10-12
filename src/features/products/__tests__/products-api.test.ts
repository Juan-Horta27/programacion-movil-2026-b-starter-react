// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { startTestServer } from './test-server';

/**
 * Prueba de la API de EJEMPLO (ya viene dada). Patrón que se espera en las pruebas de la API:
 *  1. `startTestServer()` levanta la API en un puerto libre antes de cada prueba.
 *  2. `fetch` (el de Node, sin dependencias extra) llama a la API como lo haría la app.
 *  3. Se comprueba el código de estado y el cuerpo.
 *  4. `close()` cierra el servidor al terminar.
 */
let baseUrl = '';
let close: () => Promise<void>;

beforeEach(async () => {
  ({ baseUrl, close } = await startTestServer());
});

afterEach(async () => {
  await close();
});

describe('API de productos (ejemplo)', () => {
  it('arranca y responde 404 con el formato de error en una ruta desconocida', async () => {
    const response = await fetch(`${baseUrl}/api/no-existe`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: expect.any(String), details: expect.any(Array) });
  });
});

const validProduct = { name: 'Café molido 500 g', price: 18500, category: 'Bebidas', stock: 10 };

describe('GET /api/products', () => {
  it('filtra por nombre sin distinguir mayúsculas y por categoría exacta', async () => {
    const bySearch = await (await fetch(`${baseUrl}/api/products?search=JUGO`)).json();
    expect(bySearch.map((product: { id: number }) => product.id)).toEqual([2]);

    const byCategory = await (await fetch(`${baseUrl}/api/products?category=Aseo`)).json();
    expect(byCategory.map((product: { id: number }) => product.id)).toEqual([6, 7]);
  });
});

describe('POST /api/products', () => {
  it('responde 400 con { error, details } cuando los datos no validan', async () => {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '   ', price: 0, category: 'Ropa', stock: 1.5 }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Datos inválidos');
    expect(body.details).toHaveLength(4); // un mensaje por cada campo inválido
  });

  it('responde 201 con el producto creado y el siguiente id', async () => {
    const response = await fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validProduct),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ id: 9, ...validProduct });
  });
});

describe('GET /api/products/:id', () => {
  it('responde 404 cuando el producto no existe', async () => {
    const response = await fetch(`${baseUrl}/api/products/999`);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Producto no encontrado', details: ['No existe un producto con id 999'] });
  });

  it('responde 400 cuando el id no es numérico', async () => {
    const response = await fetch(`${baseUrl}/api/products/abc`);

    expect(response.status).toBe(400);
  });
});

describe('PUT y DELETE /api/products/:id', () => {
  it('actualiza con 200 y elimina con 204 sin cuerpo', async () => {
    const updated = await fetch(`${baseUrl}/api/products/3`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validProduct, stock: 0 }),
    });
    expect(updated.status).toBe(200);
    expect(await updated.json()).toEqual({ id: 3, ...validProduct, stock: 0 });

    const deleted = await fetch(`${baseUrl}/api/products/3`, { method: 'DELETE' });
    expect(deleted.status).toBe(204);
    expect(await deleted.text()).toBe('');

    const afterDelete = await fetch(`${baseUrl}/api/products/3`);
    expect(afterDelete.status).toBe(404);
  });
});

describe('manejador 404 dado (ruta desconocida)', () => {
  it('responde 404 con el método y la ruta en details cuando ninguna ruta coincide', async () => {
    // POST con id no está definido (POST solo existe en /api/products), así que Express
    // pasa por todas las rutas sin coincidencia y termina en el manejador 404 de createApp().
    const response = await fetch(`${baseUrl}/api/products/1`, { method: 'POST' });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ error: 'Ruta no encontrada', details: ['POST /api/products/1'] });
  });
});
