import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder, updateOrderStatus } from '../services/orderService.ts';
import type { OrderStatus } from '../types/interfaces';
import { useApi } from '../hooks/useApi';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatDate } from '../utils/formatters';
import './MyOrdersPage.css';
import {StatusSelector} from "../components/ui/StatusSelector.tsx";

export const MyOrdersPage: React.FC = () => {
    const { data: orders, loading, error, setData: setOrders, refetch } = useApi(getOrders);
    const navigate = useNavigate();

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders(currentOrders => {
                if (!currentOrders) return [];
                return currentOrders.map(o => (o.id === orderId ? updatedOrder : o));
            });
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
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
            } catch (err) {
                console.error(err);
                alert("Failed to delete the order.");
            }
        }
    };

    if (loading) return <Spinner />;
    if (error) return <ErrorMessage message={error} onRetry={refetch} />;
    if (!orders) return null;

    return (
        <div className="content-card">
            <div className="card-header">
                <h1>My Orders</h1>
                <Link to="/add-order" className="button button-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="button-icon"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    <span>Add New Order</span>
                </Link>
            </div>

            <div className="card-body">
                {orders.length === 0 ? (
                    <div className="empty-state">
                        <h3>No Orders Yet</h3>
                        <p>Click "Add New Order" to get started.</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                        <tr><th>ID</th><th>Order #</th><th>Date</th><th>Status</th><th># Products</th><th>Final Price</th><th>Options</th></tr>
                        </thead>
                        <tbody>
                        {orders.map(order => {
                            const isCompleted = order.status === 'Completed';
                            return (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.orderNumber}</td>
                                    <td>{formatDate(order.date)}</td>
                                    <td className="status-cell">
                                        {/* REEMPLAZA el <select> con ESTO: */}
                                        <StatusSelector
                                            value={order.status}
                                            onChange={newStatus => handleStatusChange(order.id, newStatus)}
                                            disabled={isCompleted}
                                        />
                                    </td>
                                    <td>{order.Products.length}</td>
                                    <td>${order.finalPrice.toFixed(2)}</td>
                                    <td>
                                        <div className="options-cell">
                                            <button className="button button-secondary" onClick={() => navigate(`/add-order/${order.id}`)} disabled={isCompleted}>Edit</button>
                                            <button className="button button-danger" onClick={() => handleDelete(order.id)} disabled={isCompleted}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};