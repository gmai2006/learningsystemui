import React, { useState, useEffect } from 'react';


import { useUser } from './context/UserContext';
import App from './App';

const MainPage = () => {
    const { appUser, token } = useUser();

    if (!appUser) {
        return <div className="h-screen flex items-center justify-center">Please Log In via Okta.</div>;
    }

    return (
        <App />
    );
};

export default MainPage;