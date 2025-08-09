import type {CreateOrderPayload, Order, OrderStatus} from '../types/interfaces';

// La forma correcta de acceder a variables de entorno en Vite
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not defined. Please check your .env file.");
}

/**
 * Obtiene todas las órdenes del backend.
 */
export async function getOrders(): Promise<Order[]> {
    const response = await fetch(`${API_BASE_URL}/orders`);
    if (!response.ok) {
        throw new Error('Failed to fetch orders');
    }
    return response.json();
}

/**
 * Obtiene una orden específica por su ID.
 * Necesario para la vista de "Editar Orden".
 */
export async function getOrderById(id: number): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch order with id: ${id}`);
    }
    return response.json();
}

/**
 * Envía los datos para crear una nueva orden.
 * El payload solo contiene la información necesaria para la creación.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        // Podrías intentar leer el mensaje de error del backend si lo hay
        const errorData = await response.json().catch(() => ({ message: 'Failed to create order' }));
        throw new Error(errorData.message);
    }
    // El backend debe devolver la orden completa recién creada.
    return await response.json();
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
    // Una petición DELETE exitosa no necesita devolver contenido.
}

/**
 * Actualiza el estado de una orden específica.
 */
export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, { // Asumiendo un endpoint específico para el estado
        method: 'PATCH', // PATCH es ideal para actualizaciones parciales
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order status');
    return response.json();
}