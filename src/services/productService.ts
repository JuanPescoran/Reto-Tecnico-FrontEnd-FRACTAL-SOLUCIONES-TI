import type { Product, ProductPayload } from '../types/interfaces';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/products`;

/**
 * Función de utilidad reutilizable para parsear un objeto genérico a un tipo Product.
 * Se asegura de que los tipos de datos sean los correctos (ej. price es number).
 * @param item - El objeto de datos recibido de la API.
 * @returns {Product} - Un objeto Product correctamente tipado.
 */
const parseProduct = (item: any): Product => {
    return {
        id: Number(item.id),
        name: String(item.name),
        price: Number(item.price), // La conversión clave está aquí
    };
};

// =================================================================
// FUNCIONES DEL SERVICIO CRUD
// =================================================================

/**
 * GET all products
 * Obtiene todos los productos y los transforma para asegurar que los tipos de datos
 * coincidan con la interfaz Product.
 */
export const getProducts = async (): Promise<Product[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch products');

    // Obtiene los datos, que pueden tener tipos incorrectos (ej. price como string)
    const rawData: any[] = await response.json();

    // Mapea sobre los datos crudos y usa la función de parseo para limpiar cada uno
    return rawData.map(parseProduct);
};

/**
 * CREATE a new product
 * Envía el payload para crear un producto y parsea la respuesta para asegurar
 * que el producto recién creado tenga los tipos de datos correctos.
 */
export const createProduct = async (payload: ProductPayload): Promise<Product> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create product');

    const rawData = await response.json();
    return parseProduct(rawData);
};

/**
 * UPDATE an existing product
 * Envía el payload para actualizar un producto y parsea la respuesta para asegurar
 * que los datos del producto actualizado tengan los tipos correctos.
 */
export const updateProduct = async (id: number, payload: ProductPayload): Promise<Product> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update product');

    const rawData = await response.json();
    return parseProduct(rawData);
};

/**
 * DELETE a product
 * No devuelve contenido, por lo que no necesita parseo.
 */
export const deleteProduct = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
};