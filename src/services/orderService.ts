import type { Order, OrderProduct, CreateOrderPayload, OrderStatus } from '../types/interfaces';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not defined. Please check your .env file.");
}

/**
  * Función de utilidad para parsear un objeto de producto de orden crudo (de la API)
 * a un objeto OrderProduct correctamente tipado.
 * @param item - El objeto de producto de orden recibido de la API.
 * @returns {OrderProduct}
 */
const parseOrderProduct = (item: any): OrderProduct => ({
    id: Number(item.id),
    productId: Number(item.productId),
    productName: String(item.productName),
    // --- CONVERSIONES CLAVE ---
    productPrice: Number(item.productPrice),
    quantity: Number(item.quantity),
    totalPrice: Number(item.totalPrice),
});

/**
 * Función de utilidad para parsear un objeto de orden crudo (de la API)
 * a un objeto Order correctamente tipado.
 * @param item - El objeto de orden recibido de la API.
 * @returns {Order}
 */
const parseOrder = (item: any): Order => ({
    id: Number(item.id),
    orderNumber: String(item.orderNumber),
    // Convierte el string de fecha de la API a un objeto Date de JavaScript
    date: new Date(item.date),
    status: item.status as OrderStatus,
    // Mapea y parsea el array anidado de productos
    Products: (item.Products || []).map(parseOrderProduct),
    finalPrice: Number(item.finalPrice)
});


// =================================================================
// FUNCIONES DEL SERVICIO CRUD
// =================================================================

/**
 * Obtiene todas las órdenes y las parsea para asegurar tipos de datos correctos.
 */
export async function getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');

    const rawData: any[] = await response.json();
    return rawData.map(parseOrder);
}

/**
 * Obtiene una orden específica por su ID y la parsea.
 */
export async function getOrderById(id: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch order with id: ${id}`);

    const rawData = await response.json();
    return parseOrder(rawData);
}

/**
 * Envía los datos para crear una nueva orden y parsea la respuesta.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create order' }));
        throw new Error(errorData.message);
    }

    const rawData = await response.json();
    return parseOrder(rawData);
}

/**
 * Actualiza el estado de una orden y parsea la respuesta.
 */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order status');

    const rawData = await response.json();
    return parseOrder(rawData);
}

/**
 * Elimina una orden por su ID.
 */
export async function deleteOrder(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error(`Failed to delete order with id: ${id}`);
    }
}