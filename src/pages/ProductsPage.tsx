import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService.ts';
import type { Product, ProductPayload } from '../types/interfaces';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import './ProductsPage.css'; // Importación de los estilos específicos de la página

/**
 * ProductsPage
 *
 * Página para la gestión completa (CRUD) de los productos del catálogo.
 * Permite a los usuarios ver, añadir, editar y eliminar productos.
 */
export const ProductsPage: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [error, setError] = useState<string | null>(null);

    // --- DATA FETCHING ---
    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products:", err);
            setError("Could not load products. Please check the API connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // --- MODAL & FORM HANDLERS ---
    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (payload: ProductPayload) => {
        setError(null);
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, payload);
            } else {
                await createProduct(payload);
            }
            handleCloseModal();
            fetchProducts(); // Recargar la lista para ver los cambios
        } catch (err) {
            console.error("Failed to save product:", err);
            setError("The product could not be saved. Please try again.");
            handleCloseModal(); // Cierra el modal incluso si hay error
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
            setError(null);
            try {
                await deleteProduct(id);
                fetchProducts(); // Recargar la lista
            } catch (err) {
                console.error("Failed to delete product:", err);
                setError("The product could not be deleted. It might be associated with existing orders.");
            }
        }
    };

    // --- RENDER LOGIC ---
    if (isLoading) return <Spinner />;
    if (error) return <ErrorMessage message={error} onRetry={fetchProducts} />;

    return (
        <div className="content-card">
            <div className="card-header">
                <h1>Manage Products</h1>
                <button className="button button-primary" onClick={() => handleOpenModal()}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="button-icon"
                    >
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                    </svg>
                    <span>Add New Product</span>
                </button>
            </div>

            {products.length === 0 ? (
                <div className="empty-state">
                    <h3>No Products Found</h3>
                    <p>Get started by adding a new product.</p>
                </div>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Options</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(p => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.name}</td>
                            <td>${p.price.toFixed(2)}</td>
                            <td>
                                <div className="options-cell">
                                    <button className="button button-secondary" onClick={() => handleOpenModal(p)}>Edit</button>
                                    <button className="button button-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Edit Product' : 'Add Product'}>
                <ProductForm product={editingProduct} onSave={handleSaveProduct} onCancel={handleCloseModal} />
            </Modal>
        </div>
    );
};

// --- SUB-COMPONENT: ProductForm ---

interface ProductFormProps {
    product: Product | null;
    onSave: (payload: ProductPayload) => void;
    onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
    const [name, setName] = useState(product?.name ?? '');
    const [price, setPrice] = useState(product?.price ?? 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || price <= 0) {
            alert("Please provide a valid name and a price greater than zero.");
            return;
        }
        onSave({ name, price });
    };

    // Estilos para el formulario. Se definen como objetos para mantener el JSX limpio.
    const formStyles: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem' // Espacio vertical entre los campos
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
        border: '1px solid #dee2e6', // Usando variable de color implícita de nuestro CSS
        borderRadius: '6px',
        boxSizing: 'border-box'
    };
    const buttonContainerStyles: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        marginTop: '1rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #dee2e6' // Usando variable de color implícita
    };

    return (
        <form onSubmit={handleSubmit} style={formStyles}>
            <div>
                <label htmlFor="product-name" style={labelStyles}>Product Name</label>
                <input
                    id="product-name"
                    type="text"
                    placeholder="e.g., Laptop Pro"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    maxLength={255}
                    style={inputStyles}
                />
            </div>
            <div>
                <label htmlFor="product-price" style={labelStyles}>Price</label>
                <input
                    id="product-price"
                    type="number"
                    placeholder="e.g., 999.99"
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    required
                    step="0.01"
                    min="0.01"
                    max="99999999.99"
                    style={inputStyles}
                />
            </div>
            <div style={buttonContainerStyles}>
                <button type="button" className="button" onClick={onCancel}>Cancel</button>
                <button type="submit" className="button button-primary">Save</button>
            </div>
        </form>
    );
};