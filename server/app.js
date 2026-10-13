/**
 * API de productos (Express).
 *
 * `createApp()` construye y devuelve la aplicación SIN ponerla a escuchar:
 *  - `server/index.js` la pone a escuchar en el puerto 3000 (`npm run server`);
 *  - las pruebas la levantan con `app.listen(0)` (puerto libre) y llaman con `fetch`
 *    (ver el helper `startTestServer()` en src/features/products/__tests__/test-server.ts).
 *
 * Contrato (el detalle se documenta en docs/api/products-endpoints.md, Parte 1):
 *   GET    /api/products?search=&category=   200 + arreglo
 *   GET    /api/products/:id                 200 | 400 | 404
 *   POST   /api/products                     201 | 400
 *   PUT    /api/products/:id                 200 | 400 | 404
 *   DELETE /api/products/:id                 204 | 400 | 404
 * Formato de error uniforme: { "error": "mensaje", "details": ["..."] }
 *
 * QUÉ YA VIENE HECHO (no se pide escribirlo, pero sí entenderlo y explicarlo en el ADR-002
 * y en la sección «API error handling» del README):
 *   - express.json(): convierte el cuerpo JSON en `req.body`.
 *   - cors(): permite que la app (puerto 5173) llame a la API (puerto 3000).
 *   - parseId(): convierte el parámetro `:id` en número, o devuelve null si no es numérico.
 *   - Manejador 404 (ruta desconocida) y manejador de errores central (500).
 *
 * QUÉ SE ESCRIBIÓ (Parte 2 del TODO.md): las cinco rutas de /api/products, la validación
 * del cuerpo (validateProductBody) y los filtros de la lista.
 */
const express = require('express');
const cors = require('cors');
const seedProducts = require('./data/products.json');

// Categorías permitidas (la app usa la misma lista).
const CATEGORIES = ['Bebidas', 'Snacks', 'Aseo', 'Hogar'];

/**
 * YA DADO. Convierte el texto de `:id` en número.
 * Devuelve null si no son solo dígitos ("abc", "1.5", "-2"): la ruta responde 400 en ese caso.
 */
function parseId(rawId) {
  return /^\d+$/.test(rawId) ? Number(rawId) : null;
}

// Longitud máxima del nombre (la app usa el mismo valor en domain/product.ts).
const NAME_MAX_LENGTH = 60;

/**
 * Valida el cuerpo de POST y PUT. Devuelve un mensaje por cada problema (arreglo vacío si todo está bien).
 * `body` puede ser undefined si la petición no trae JSON.
 */
function validateProductBody(body) {
  const { name, price, category, stock } = body ?? {};
  const details = [];
  if (typeof name !== 'string' || name.trim() === '') {
    details.push('name es obligatorio');
  } else if (name.trim().length > NAME_MAX_LENGTH) {
    details.push(`name debe tener máximo ${NAME_MAX_LENGTH} caracteres`);
  }
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
    details.push('price debe ser un número mayor que 0');
  }
  if (!CATEGORIES.includes(category)) {
    details.push(`category debe ser una de: ${CATEGORIES.join(', ')}`);
  }
  if (!Number.isInteger(stock) || stock < 0) {
    details.push('stock debe ser un entero mayor o igual que 0');
  }
  return details;
}

/** Toma solo los campos del producto (ignora cualquier otro, incluido un `id` en el cuerpo). */
function toProductData(body) {
  return { name: body.name.trim(), price: body.price, category: body.category, stock: body.stock };
}

function createApp() {
  const app = express();

  // YA DADO: CORS para el origen de desarrollo de la app y lectura del cuerpo JSON.
  app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
  app.use(express.json());

  // Almacenamiento en memoria: copia de la semilla (se reinicia con el servidor).
  const products = seedProducts.map((item) => ({ ...item }));
  // El id nuevo es el siguiente al mayor que existe; no se reutilizan ids de productos borrados.
  let nextId = Math.max(0, ...products.map((product) => product.id)) + 1;

  // Respuestas de error con el formato uniforme { error, details }.
  const sendInvalidId = (res) =>
    res.status(400).json({ error: 'Id inválido', details: ['El id debe ser numérico'] });
  const sendNotFound = (res, id) =>
    res.status(404).json({ error: 'Producto no encontrado', details: [`No existe un producto con id ${id}`] });

  app.get('/api/products', (req, res) => {
    const { search, category } = req.query;
    let result = products;
    if (search) {
      const text = String(search).toLowerCase();
      result = result.filter((product) => product.name.toLowerCase().includes(text));
    }
    if (category) {
      result = result.filter((product) => product.category === category);
    }
    res.json(result);
  });

  app.get('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return sendInvalidId(res);
    const product = products.find((item) => item.id === id);
    if (!product) return sendNotFound(res, id);
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    const details = validateProductBody(req.body);
    if (details.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details });
    }
    const product = { id: nextId, ...toProductData(req.body) };
    nextId += 1;
    products.push(product);
    res.status(201).json(product);
  });

  app.put('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return sendInvalidId(res);
    const product = products.find((item) => item.id === id);
    if (!product) return sendNotFound(res, id);
    const details = validateProductBody(req.body);
    if (details.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', details });
    }
    Object.assign(product, toProductData(req.body));
    res.json(product);
  });

  app.delete('/api/products/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (id === null) return sendInvalidId(res);
    const index = products.findIndex((item) => item.id === id);
    if (index === -1) return sendNotFound(res, id);
    products.splice(index, 1);
    res.status(204).end();
  });

  // YA DADO: ruta desconocida → 404 con el formato de error uniforme.
  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada', details: [`${req.method} ${req.originalUrl}`] });
  });

  // YA DADO: manejador de errores central (se reconoce por tener CUATRO parámetros).
  // Express lo ejecuta cuando una ruta lanza una excepción o llama a next(error).
  // eslint-disable-next-line no-unused-vars -- Express exige los 4 parámetros para reconocerlo.
  app.use((err, _req, res, _next) => {
    if (err && err.type === 'entity.parse.failed') {
      // JSON malformado en el cuerpo: es un error de quien llama, no del servidor.
      return res.status(400).json({ error: 'El cuerpo no es un JSON válido', details: [] });
    }
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor', details: [] });
  });

  return app;
}

module.exports = { createApp, CATEGORIES, parseId };
