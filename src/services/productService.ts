import type { Product, ProductPayload } from '../types/interfaces';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/products`;

// GET all products
export const getProducts = async (): Promise<Product[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
};

// CREATE a new product
export const createProduct = async (payload: ProductPayload): Promise<Product> => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
};

// UPDATE an existing product
export const updateProduct = async (id: number, payload: ProductPayload): Promise<Product> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
};

// DELETE a product
export const deleteProduct = async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
};