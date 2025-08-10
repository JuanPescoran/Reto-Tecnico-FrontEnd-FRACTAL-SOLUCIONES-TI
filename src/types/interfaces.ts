/**
 * Este archivo contiene todas las interfaces de TypeScript utilizadas en la aplicación de React.
 * Estas interfaces definen la "forma" de los objetos de datos, asegurando la consistencia
 * y proveyendo autocompletado y seguridad de tipos en el proyecto.
 */

// =================================================================
// 1. Tipos de Estado y Catálogo
// =================================================================

/**
 * Representa los posibles estados de una orden.
 * Usar un tipo de unión previene errores y asegura consistencia.
 */
export type OrderStatus = 'Pending' | 'InProgress' | 'Completed';

/**
 * Representa un producto en su forma más pura, tal como existiría en un catálogo.
 * No contiene información relativa a una orden específica.
 */
export interface Product {
    id: number;
    name: string;
    price: number;
}


// =================================================================
// 2. Interfaces para Órdenes (Estructuras de Datos Principales)
// =================================================================

/**
 * Representa una línea de producto DENTRO de una orden.
 * Es una entidad intermedia que contiene detalles específicos de la venta.
 */
export interface OrderProduct {
    id: number; // ID único de esta línea de pedido en la base de datos
    productId: number; // ID del producto original del catálogo

    // Los siguientes campos son una "foto" del producto en el momento de la compra
    // para mantener la integridad histórica del pedido.
    productName: string;
    productPrice: number;

    // Campos específicos de esta orden
    quantity: number;
    totalPrice: number; // Calculado: productPrice * quantity
}

/**
 * Representa una orden completa.
 * Es la estructura de datos principal que se recibirá de la API y se manejará en el estado de la UI.
 * Nota: `finalPrice` se omite intencionadamente. En la UI, es más seguro calcularlo
 * directamente desde el array `Products` para evitar inconsistencias de datos.
 */
export interface Order {
    id: number;
    orderNumber: string;
    date: Date; // El JSON de la API enviará un string, que se puede convertir a objeto Date
    status: OrderStatus;
    Products: OrderProduct[];
    finalPrice: number;
}


// =================================================================
// 3. Interfaces para Payloads de API (Qué se envía al Backend)
// =================================================================

/**
 * Define la estructura de datos que el frontend envía al backend para CREAR una nueva orden.
 * Contiene la mínima información necesaria para que el backend pueda procesar la petición.
 */
export interface CreateOrderPayload {
    products: {
        productId: number;
        quantity: number;
    }[];
}

/**
 * Define la estructura para actualizar la CANTIDAD de un producto dentro de una orden existente.
 * Se usaría en un modal de "Editar Producto" en la vista de la orden.
 */
export interface UpdateOrderProductPayload {
    quantity: number;
}

// =================================================================
// 4. Payloads para la Gestión de Productos (Extra Points)
// =================================================================

/**
 * Define la estructura para CREAR o ACTUALIZAR un producto del catálogo.
 * No incluye el 'id', ya que este es generado por la base de datos al crear.
 */
export interface ProductPayload {
    name: string;
    price: number;
}