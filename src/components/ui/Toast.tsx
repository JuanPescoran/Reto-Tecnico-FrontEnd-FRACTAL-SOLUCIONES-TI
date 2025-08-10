import React, { useEffect } from 'react';
import './Toast.css'; // Crearemos este archivo CSS

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    // El Toast se cerrará automáticamente después de 3 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    return (
        <div className={`toast toast-${type}`}>
            {message}
        </div>
    );
};