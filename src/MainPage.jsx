import React, { useState, useEffect } from 'react';

import AppRoutes from './AppRoutes';
import { useUser } from './context/UserContext';

const MainPage = () => {
    const { appUser, token } = useUser();

    if (!appUser) {
        return <div className="h-screen flex items-center justify-center">Please Log In via Okta.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {<AppRoutes appUser={appUser} token={token} />}
        </div>
    );
};

export default MainPage;