import React, { useState, useEffect } from 'react';
import StudentDashboard from './pages/student/StudentDashboard';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard'; // Staff View
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