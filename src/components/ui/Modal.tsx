import React from 'react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        // El fondo oscuro que se puede clickear para cerrar
        <div className="modal-overlay" onClick={onClose}>
            {/* El contenedor del modal que previene el cierre al hacer click dentro */}
            <div className="modal-container" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{title}</h2>
                    {/* Botón de cierre (X) en la esquina para mejor UX */}
                    <button className="modal-close-button" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="modal-content">
                    {children}
                </div>
                {/* No hay ningún botón "Close" genérico aquí abajo */}
            </div>
        </div>
    );
};