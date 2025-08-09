import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <NavLink
                    to="/my-orders"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    My Orders
                </NavLink>
                <NavLink
                    to="/products"
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                    Manage Products
                </NavLink>
            </div>
        </nav>
    );
};