import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById, createOrder /*, updateOrder */ } from '../services/orderService.ts';
import { getProducts } from '../services/productService.ts';
import type { Order, Product, CreateOrderPayload, OrderProduct } from '../types/interfaces';
import { Modal } from '../components/ui/Modal';

export const AddEditOrderPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [order, setOrder] = useState<Partial<Order>>({ Products: [] });
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Carga los datos iniciales (orden existente y productos del catálogo)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener siempre la lista de productos del catálogo
                const productsData = await getProducts();
                setAvailableProducts(productsData);

                // Si estamos en modo edición, obtener los datos de la orden
                if (isEditMode && id) {
                    const orderData = await getOrderById(Number(id));
                    setOrder(orderData);
                }
            } catch (error) {
                console.error("Failed to load data", error);
                alert("Could not load page data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode]);

    // Valores calculados para los campos deshabilitados del formulario
    const finalPrice = useMemo(() => {
        return order.Products?.reduce((sum, p) => sum + p.totalPrice, 0) ?? 0;
    }, [order.Products]);

    const productCount = useMemo(() => order.Products?.length ?? 0, [order.Products]);

    const handleAddProduct = (productToAdd: Product, quantity: number) => {
        const newOrderProduct: OrderProduct = {
            id: Date.now(), // ID temporal para el cliente
            productId: productToAdd.id,
            productName: productToAdd.name,
            productPrice: productToAdd.price,
            quantity,
            totalPrice: productToAdd.price * quantity,
        };
        setOrder(prev => ({ ...prev, Products: [...(prev.Products ?? []), newOrderProduct]}));
        setIsModalOpen(false);
    };

    const handleRemoveProduct = (productIdToRemove: number) => {
        if(window.confirm("Are you sure you want to remove this product?")) {
            setOrder(prev => ({...prev, Products: prev.Products?.filter(p => p.id !== productIdToRemove)}));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!order.Products || order.Products.length === 0) {
            alert("Please add at least one product to the order.");
            return;
        }

        const payload: CreateOrderPayload = {
            products: order.Products.map(p => ({
                productId: p.productId,
                quantity: p.quantity,
            }))
        };

        try {
            if (isEditMode) {
                // Aquí llamarías a updateOrder(Number(id), payload)
                alert("Order updated successfully!");
            } else {
                await createOrder(payload);
                alert("Order created successfully!");
            }
            navigate('/my-orders');
        } catch (error) {
            console.error("Failed to save order", error);
            alert("An error occurred while saving the order.");
        }
    };

    if (loading && isEditMode) return <p>Loading order data...</p>;

    return (
        <div>
            <h1>{isEditMode ? `Edit Order #${id}` : 'Add New Order'}</h1>

            <form onSubmit={handleSubmit}>
                {/* Campos deshabilitados */}
                <div>Order #: <input value={order.orderNumber ?? 'Will be generated'} disabled /></div>
                <div>Date: <input value={new Date().toLocaleDateString()} disabled /></div>
                <div># Products: <input value={productCount} disabled /></div>
                <div>Final Price: <input value={`$${finalPrice.toFixed(2)}`} disabled /></div>

                <hr />

                <h3>Products in Order</h3>
                <button type="button" onClick={() => setIsModalOpen(true)}>Add Product</button>

                <table>
                    <thead>
                    <tr><th>Name</th><th>Unit Price</th><th>Qty</th><th>Total Price</th><th>Options</th></tr>
                    </thead>
                    <tbody>
                    {order.Products?.map(p => (
                        <tr key={p.id}>
                            <td>{p.productName}</td>
                            <td>${p.productPrice.toFixed(2)}</td>
                            <td>{p.quantity}</td>
                            <td>${p.totalPrice.toFixed(2)}</td>
                            <td>
                                {/* El modal de edición sería similar al de añadir */}
                                <button type="button">Edit</button>
                                <button type="button" onClick={() => handleRemoveProduct(p.id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <hr />
                <button type="submit">{isEditMode ? 'Save Changes' : 'Create Order'}</button>
            </form>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product to Order">
                <AddProductForm products={availableProducts} onAdd={handleAddProduct} />
            </Modal>
        </div>
    );
};


// Componente interno para el formulario del modal
interface AddProductFormProps {
    products: Product[];
    onAdd: (product: Product, quantity: number) => void;
}
const AddProductForm: React.FC<AddProductFormProps> = ({ products, onAdd }) => {
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const product = products.find(p => p.id === Number(selectedProductId));
        if (product && quantity > 0) {
            onAdd(product, quantity);
        } else {
            alert("Please select a valid product and quantity.");
        }
    };

    return (
        <form onSubmit={handleFormSubmit}>
            <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} required>
                <option value="" disabled>Select a product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required/>
            <button type="submit">Confirm and Save</button>
        </form>
    );
};