import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
        // Auto-hide after 3 seconds
        setTimeout(() => setNotification(null), 3000);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && <Notification notification={notification} />}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);