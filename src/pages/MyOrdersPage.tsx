// src/pages/MyOrdersPage.tsx

import React from 'react'; // Eliminado useState que no se usa
import { getOrders, deleteOrder, updateOrderStatus } from '../services/orderService.ts';
import type { OrderStatus } from '../types/interfaces';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatFinalPrice } from "../utils/formatters";
import { useApi } from "../hooks/useApi";
import {ErrorMessage} from "../components/ui/ErrorMessage.tsx";
import {Spinner} from "../components/ui/Spinner.tsx";

export const MyOrdersPage: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const navigate = useNavigate();

    const { data: orders, loading, error, setData: setOrders } = useApi(getOrders);

    if (loading) return <Spinner/>;
    if (error) {
        // Pasa el mensaje y la función para reintentar
        return <ErrorMessage message={error}     onRetry={async () => setOrders(await getOrders())}/>;
    }    if (!orders) return null; // Estado inicial mientras se cargan los datos

    // --- EVENT HANDLERS ---
    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders(currentOrders => {
                if (!currentOrders) return [];
                return currentOrders.map(o => (o.id === orderId ? updatedOrder : o));
            });
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("An error occurred while updating the order status.");
        }
    };

    const handleDelete = async (orderId: number) => {
        if (window.confirm(`Are you sure you want to delete the order?`)) {
            try {
                await deleteOrder(orderId);
                setOrders(currentOrders => {
                    if (!currentOrders) return [];
                    return currentOrders.filter(o => o.id !== orderId);
                });
            } catch (error) {
                console.error("Failed to delete order:", error);
                alert("An error occurred while deleting the order.");
            }
        }
    };

    // --- RENDER LOGIC (MAIN) ---
    return (
        <div>
            <h1>My Orders</h1>
            {/* ... JSX sigue exactamente igual ... */}
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th># Products</th>
                    <th>Final Price</th>
                    <th>Options</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => {
                    const isCompleted = order.status === 'Completed';
                    return (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.orderNumber}</td>
                            <td>{formatDate(order.date)}</td>
                            <td>
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                    disabled={isCompleted}
                                    style={{ padding: '4px' }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="InProgress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </td>
                            <td>{order.Products.length}</td>
                            <td>${formatFinalPrice(order.Products)}</td>
                            <td>
                                <button onClick={() => navigate(`/add-order/${order.id}`)} disabled={isCompleted} style={{ marginRight: '5px' }}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(order.id)} disabled={isCompleted}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};