import React, { useState, useEffect, useRef } from 'react';
import type { OrderStatus } from '../../types/interfaces';
import './StatusSelector.css';

interface StatusSelectorProps {
    value: OrderStatus;
    onChange: (newStatus: OrderStatus) => void;
    disabled?: boolean;
}

const options: OrderStatus[] = ['Pending', 'InProgress', 'Completed'];

export const StatusSelector: React.FC<StatusSelectorProps> = ({ value, onChange, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Este efecto cierra el menú si el usuario hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (status: OrderStatus) => {
        onChange(status);
        setIsOpen(false);
    };

    return (
        <div className="status-selector" ref={wrapperRef}>
            <button
                type="button"
                className="status-badge"
                data-status={value}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
            >
                {value}
            </button>
            {isOpen && (
                <ul className="status-options">
                    {options.map(option => (
                        <li
                            key={option}
                            className={`status-option ${value === option ? 'selected' : ''}`}
                            data-status={option}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};