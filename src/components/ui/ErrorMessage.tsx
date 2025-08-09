import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="error-box">
            <div className="error-icon">
                {/* SVG de un triángulo de advertencia */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
            </div>
            <div className="error-content">
                <h3 className="error-title">Oops! Something went wrong.</h3>
                <p className="error-message">{message}</p>
                {onRetry && (
                    <button className="retry-button" onClick={onRetry}>
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
};