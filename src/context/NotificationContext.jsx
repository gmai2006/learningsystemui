// context/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Notification from '../components/Notification';
import { injectNotification } from '../api/ApiClient';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState(null);

    const showNotification = useCallback((message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    }, []);

    // Link the API client to this specific notification instance
    useEffect(() => {
        injectNotification(showNotification);
    }, [showNotification]);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notification && <Notification notification={notification} />}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);