import React from 'react';

const modalStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const modalContentStyles: React.CSSProperties = {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div style={modalStyles} onClick={onClose}>
            <div style={modalContentStyles} onClick={e => e.stopPropagation()}>
                <h2>{title}</h2>
                {children}
                <button onClick={onClose} style={{ marginTop: '10px' }}>Close</button>
            </div>
        </div>
    );
};