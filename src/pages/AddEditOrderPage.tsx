import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, createOrder } from '../services/orderService.ts';
import { getProducts } from '../services/productService.ts';
import type { Order, Product, CreateOrderPayload, OrderProduct } from '../types/interfaces';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { Toast } from '../components/ui/Toast';
import { formatDate, formatFinalPrice } from '../utils/formatters';
import { useApi } from '../hooks/useApi';
import './AddEditOrderPage.css';

// Asegúrate de tener el componente AddProductForm definido al final de este archivo.

export const AddEditOrderPage: React.FC = () => {
    // --- HOOKS & ROUTING ---
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const isEditMode = useMemo(() => Boolean(id), [id]);

    // --- STATE MANAGEMENT ---
    const [order, setOrder] = useState<Partial<Order>>({ Products: [], status: 'Pending' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalKey, setModalKey] = useState(Date.now());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // --- DATA FETCHING ---
    const { data: availableProducts, error: productsError, refetch: refetchProducts } = useApi(getProducts);

    useEffect(() => {
        if (isEditMode && id) {
            getOrderById(Number(id))
                .then(orderData => {
                    setOrder(orderData);
                })
                .catch(err => {
                    console.error("Failed to load order:", err);
                    setToastMessage("Error: Could not load the order data.");
                    navigate('/my-orders');
                });
        }
    }, [id, isEditMode, navigate]);

    // --- DERIVED STATE ---
    const finalPrice = useMemo(() => formatFinalPrice(order.Products ?? []), [order.Products]);
    const productCount = useMemo(() => {
        // Usa reduce para sumar la propiedad 'quantity' de cada producto en el array.
        return order.Products?.reduce((total, product) => total + product.quantity, 0) ?? 0;
    }, [order.Products]);
    const isOrderCompleted = order.status === 'Completed';

    // --- EVENT HANDLERS ---
    const handleOpenModal = () => {
        setModalKey(Date.now());
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleAddProduct = (productToAdd: Product, quantity: number) => {
        const newOrderProduct: OrderProduct = {
            id: Date.now(),
            productId: productToAdd.id,
            productName: productToAdd.name,
            productPrice: productToAdd.price,
            quantity,
            totalPrice: productToAdd.price * quantity,
        };
        setOrder(prevOrder => ({
            ...prevOrder,
            Products: [...(prevOrder.Products ?? []), newOrderProduct]
        }));
        handleCloseModal();
    };

    const handleRemoveProduct = (productIdToRemove: number) => {
        if (window.confirm("Are you sure you want to remove this product from the order?")) {
            setOrder(prev => ({ ...prev, Products: prev.Products?.filter(p => p.id !== productIdToRemove) }));
        }
    };

    const handleSubmit = async () => {
        if (!order.Products || order.Products.length === 0) {
            setToastMessage("Error: Please add at least one product to the order.");
            return;
        }

        setIsSubmitting(true);

        const payload: CreateOrderPayload = { products: order.Products.map(p => ({ productId: p.productId, quantity: p.quantity })) };
        try {
            if (isEditMode) {
                // await updateOrder(Number(id), payload);
                setToastMessage("Order updated successfully!");
            } else {
                await createOrder(payload);
                setToastMessage("Order created successfully!");
            }
            setTimeout(() => {
                navigate('/my-orders');
            }, 1500); // Espera 1.5s antes de redirigir
        } catch (err) {
            console.error("Failed to save order", err);
            setToastMessage("Error: An error occurred while saving the order.");
            setIsSubmitting(false); // Vuelve a habilitar el botón en caso de error
        }
    };

    // --- RENDER LOGIC ---
    if (productsError) return <ErrorMessage message="Could not load available products." onRetry={refetchProducts} />;
    if (!availableProducts && !isEditMode) return <Spinner />;
    if (isEditMode && !order.id) return <Spinner />;

    return (
        <>
            <div className="content-card">
                <div className="card-header">
                    <h1>{isEditMode ? `Edit Order #${order.orderNumber}` : 'Add New Order'}</h1>
                    <div className="header-actions">
                        <button type="button" className="button" onClick={() => navigate('/my-orders')} disabled={isSubmitting}>
                            Back
                        </button>
                        {!isOrderCompleted && (
                            <button
                                type="button"
                                className="button button-primary"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Order')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="form-body">
                    <div className="order-summary-section">
                        <div className="summary-item"><label>Order #</label><div className="value">{order.orderNumber ?? 'Will be generated'}</div></div>
                        <div className="summary-item"><label>Date</label><div className="value">{formatDate(order.date ?? new Date())}</div></div>
                        <div className="summary-item"><label># Products</label><div className="value">{productCount}</div></div>
                        <div className="summary-item"><label>Final Price</label><div className="value">${finalPrice}</div></div>
                    </div>

                    <div>
                        <div className="products-section-header">
                            <h2>Products in Order</h2>
                            {!isOrderCompleted && (
                                <button type="button" className="button button-primary" onClick={handleOpenModal} disabled={isSubmitting}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="button-icon"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                                    <span>Add Product</span>
                                </button>
                            )}
                        </div>

                        {order.Products?.length === 0 ? (
                            <div className="empty-state"><h3>No Products Added</h3><p>Click "Add Product" to add items to this order.</p></div>
                        ) : (
                            <table>
                                <thead><tr><th>Name</th><th>Unit Price</th><th>Qty</th><th>Total Price</th><th>Options</th></tr></thead>
                                <tbody>
                                {order.Products?.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.productName}</td>
                                        <td>${p.productPrice.toFixed(2)}</td>
                                        <td>{p.quantity}</td>
                                        <td>${p.totalPrice.toFixed(2)}</td>
                                        <td>
                                            <div className="options-cell">
                                                {!isOrderCompleted && <button type="button" className="button button-danger" onClick={() => handleRemoveProduct(p.id)} disabled={isSubmitting}>Remove</button>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {toastMessage && (
                <Toast
                    message={toastMessage}
                    type={toastMessage.toLowerCase().includes("error") ? 'error' : 'success'}
                    onClose={() => setToastMessage(null)}
                />
            )}

            <Modal key={modalKey} isOpen={isModalOpen} onClose={handleCloseModal} title="Add Product to Order">
                <AddProductForm products={availableProducts ?? []} onAdd={handleAddProduct} onCancel={handleCloseModal} />
            </Modal>
        </>
    );
};

interface AddProductFormProps {
    products: Product[]; // La lista de productos del catálogo para poblar el <select>
    onAdd: (product: Product, quantity: number) => void; // Callback para añadir el producto
    onCancel: () => void; // Callback para cerrar el modal
}

const AddProductForm: React.FC<AddProductFormProps> = ({ products, onAdd, onCancel }) => {
    // --- STATE MANAGEMENT ---
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    // --- EVENT HANDLERS ---
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Buscar el producto completo a partir del ID seleccionado
        const selectedProduct = products.find(p => p.id === Number(selectedProductId));

        if (selectedProduct && quantity > 0) {
            // Si es válido, llama a la función onAdd del componente padre
            onAdd(selectedProduct, quantity);
        } else {
            // Alerta si no se ha seleccionado un producto o la cantidad es inválida
            alert("Please select a valid product and quantity.");
        }
    };

    // --- ESTILOS ---
    // Definimos los estilos como objetos para mantener el JSX limpio y organizado.
    const formStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem' // Espacio vertical generoso entre los campos
    };
    const labelStyles: React.CSSProperties = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: 600,
        color: '#495057'
    };
    const inputStyles: React.CSSProperties = {
        width: '100%',
        padding: '0.75rem',
        fontSize: '1rem',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        boxSizing: 'border-box'
    };
    const buttonContainerStyles: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        marginTop: '1rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #dee2e6'
    };

    // --- RENDER LOGIC ---
    return (
        <form onSubmit={handleFormSubmit} style={formStyles}>
            <div>
                <label htmlFor="product-select" style={labelStyles}>Product</label>
                <select
                    id="product-select"
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    required
                    style={inputStyles}
                >
                    <option value="" disabled>-- Select a product --</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} - ${p.price.toFixed(2)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="quantity-input" style={labelStyles}>Quantity</label>
                <input
                    id="quantity-input"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    required
                    style={inputStyles}
                />
            </div>
            <div style={buttonContainerStyles}>
                <button type="button" className="button" onClick={onCancel}>Cancel</button>
                <button type="submit" className="button button-primary">Add Product</button>
            </div>
        </form>
    );
};