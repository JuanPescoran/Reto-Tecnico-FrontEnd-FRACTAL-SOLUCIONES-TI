import type { OrderProduct } from "../types/interfaces";

/**
 * Calcula el precio final sumando el total de cada producto en una lista.
 * @param products - Un array de OrderProduct.
 * @returns El precio final como un string formateado con dos decimales.
 */
export const formatFinalPrice = (products: OrderProduct[]): string => {
    const price = products.reduce((sum, p) => sum + p.totalPrice, 0);
    return price.toFixed(2);
};

/**
 * Formatea un objeto Date o un string de fecha a un formato legible (ej. "12/25/2024").
 * @param date - El objeto o string de fecha.
 * @returns La fecha formateada.
 */
export const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString();
};