import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { AddEditOrderPage } from './pages/AddEditOrderPage';
import { ProductsPage } from './pages/ProductsPage';

export const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <Routes>
                    <Route path="/my-orders" element={<MyOrdersPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/add-order" element={<AddEditOrderPage />} />
                    <Route path="/add-order/:id" element={<AddEditOrderPage />} />
                    <Route path="*" element={<Navigate to="/my-orders" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
};

export default App;