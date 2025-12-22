import React, { useEffect, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const SessionTimer = () => {
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [warned, setWarned] = useState(false);

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Decode JWT payload (Base64)
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiryTime = payload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                const timeLeft = expiryTime - currentTime;

                // 1. Warning logic (60 seconds remaining)
                if (timeLeft <= 60000 && timeLeft > 0 && !warned) {
                    showNotification(
                        "Your session will expire in 1 minute. Please save your work!", 
                        "warning"
                    );
                    setWarned(true);
                }

                // 2. Auto-Logout logic (Token expired)
                if (timeLeft <= 0) {
                    localStorage.removeItem('token');
                    showNotification("Session expired. Redirecting to login...", "error");
                    navigate('/login');
                    setWarned(false);
                }
                
                // Reset warning if token is refreshed/changed
                if (timeLeft > 60000 && warned) {
                    setWarned(false);
                }

            } catch (e) {
                console.error("Invalid token format");
            }
        };

        // Run check every 5 seconds
        const interval = setInterval(checkToken, 5000);
        return () => clearInterval(interval);
    }, [showNotification, navigate, warned]);

    return null; // Logic-only component
};

export default SessionTimer;