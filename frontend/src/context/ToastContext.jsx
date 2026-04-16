import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ message: null, type: null });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: null }), 3000);
  }, []);

  const dismissToast = useCallback(() => {
    setToast({ message: null, type: null });
  }, []);

  return (
    <ToastContext.Provider value={{ toast, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
