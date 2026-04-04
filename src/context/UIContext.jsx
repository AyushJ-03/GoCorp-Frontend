import React, { createContext, useState, useContext, useCallback } from 'react';

const UIContext = createContext();

// A simple event emitter for axios to trigger toasts outside the React tree
let globalToastEmitter = () => {};

export const UIProvider = ({ children }) => {
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        setToast({ visible: true, message, type });
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, duration);
    }, []);

    // Attach local showToast to global emitter
    globalToastEmitter = showToast;

    return (
        <UIContext.Provider value={{ toast, showToast }}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);

// Global function for non-React code
export const toastService = {
    show: (msg, type) => globalToastEmitter(msg, type)
};
