import React from 'react';
import './Spinner.css'; // Crearemos este archivo a continuación

export const Spinner: React.FC = () => {
    return (
        <div className="spinner-container">
            <div className="spinner"></div>
        </div>
    );
};