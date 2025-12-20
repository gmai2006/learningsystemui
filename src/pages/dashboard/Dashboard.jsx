import React, { useEffect, useRef, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation
} from "react-router-dom";

import {
  LayoutDashboard,
  TriangleAlert,
  Computer,
  ShieldAlert,
  User,
  Lock,
  Phone,
  GraduationCap,
  Briefcase,
  ClipboardCheck,
  Calendar,
  Users
} from 'lucide-react';
import axios from "axios";

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useUser } from "../../context/UserContext";

import '../../index.css';
import '../../App.css';

import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

import init from "../../init";
// import MainPage from './MainPage.jsx';
// import UserManagement from '../user/UserManagement.jsx';
// import AppliedLearningDashboard from '../appliedlearning/AppliedLearningDashboard.jsx';
// import StudentJobSearch from '../careermanagement/StudentJobSearch.jsx';

const menuItems = [
    { id: 'dashboard', path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['STUDENT', 'FACULTY', 'STAFF'] },
    { id: 'learning', path: 'learning', icon: GraduationCap, label: 'Applied Learning', roles: ['STUDENT', 'FACULTY', 'STAFF'] },
    { id: 'jobs', path: 'jobs', icon: GraduationCap, label: 'Jobs Listing', roles: ['STUDENT', 'FACULTY', 'STAFF'] },
    { id: 'Career Services', icon: Briefcase, label: 'Career Services', roles: ['STUDENT', 'STAFF', 'EMPLOYER'] },
    { id: 'Approvals', icon: ClipboardCheck, label: 'Approvals', roles: ['FACULTY', 'STAFF'] },
    { id: 'Events & Fairs', icon: Calendar, label: 'Events & Fairs', roles: ['STUDENT', 'STAFF', 'EMPLOYER'] },
    { id: 'Partnerships', icon: Users, label: 'Partnerships', roles: ['STAFF', 'EMPLOYER'] },
    { id: 'users', path: 'users', icon: Users, label: 'User Management', roles: ['STAFF', 'EMPLOYER'] },

  ];

export default function Dashboard() {
  const { appUser, token } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filteredMenu, setFilteredMenu] = useState([]);

  // --- CONFIGURATION & MOCK DATA ---
  const BRAND = {
    primary: "bg-red-700", // EWU Red branding
    primaryText: "text-red-700",
    secondary: "bg-gray-900",
    accent: "text-red-600"
  };

  useEffect(() => {
    if (!appUser) return;
    setFilteredMenu(menuItems.filter(item => item.roles.includes(appUser.role)));
  }, [appUser]);

  // --- SHARED COMPONENTS ---
  const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
      {children}
    </div>
  );

  const Badge = ({ status }) => {
    const styles = {
      PENDING: "bg-amber-100 text-amber-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      DRAFT: "bg-gray-100 text-gray-600",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.DRAFT}`}>
        {status}
      </span>
    );
  };

  
  if (!appUser) {
    return <LoadingSpinner />
  }


  return (
    <div className="flex h-screen bg-gray-50 text-slate-900">

      <DashboardSidebar menuItems={filteredMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <DashboardHeader />

        {/* Routes */}
        <div className="flex-1 overflow-y-auto p-6">
          <Routes>
            {/* <Route path="/" element={<MainPage />} />
            <Route path="learning" element={<AppliedLearningDashboard user={appUser} />} />
            <Route path="jobs" element={<StudentJobSearch user={appUser} />} />
            <Route path="users" element={<UserManagement />} /> */}

          </Routes>
        </div>

      </div>
    </div>
  );
}
