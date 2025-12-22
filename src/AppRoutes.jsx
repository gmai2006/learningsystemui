import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import CommandCenter from './pages/admin/CommandCenter';
import UserManagement from './pages/admin/user/UserManagement';
import StaffJobOversight from './pages/admin/staff/StaffJobOversight';
import SystemSettings from './pages/admin/settting/SystemSettings';
import AppliedLearningDashboard from './pages/admin/learning/AppliedLearningDashboard';

// ... other imports

const AppRoutes = ({ appUser, token }) => {
    const location = useLocation();
  if (!appUser) return <Navigate to="/login" />;

  return (
    <Routes>
      {/* 1. Redirect Root to the correct dashboard based on role */}
      <Route path="/" element={<RoleBasedRedirect role={appUser.role} />} />

      {/* 2. Admin & Faculty Routes (Staff Dashboard) */}
      {(appUser.role === 'STAFF' || appUser.role === 'FACULTY') && (
        <Route path="/admin" element={<AdminDashboard user={appUser} token={token} />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<CommandCenter user={appUser} token={token} />} />
          <Route path="users" element={<UserManagement user={appUser} token={token} />} />
          <Route path="jobs" element={<StaffJobOversight user={appUser} token={token} />} />
          <Route path="learning" element={<AppliedLearningDashboard user={appUser} token={token} />} />
          <Route path="settings" element={<SystemSettings user={appUser} token={token} />} />
        </Route>
      )}

      {/* 3. Student Routes */}
      {/* {appUser.role === 'STUDENT' && (
        <Route path="/student" element={<StudentDashboard user={appUser} token={token} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentJobSearch />} />
          <Route path="portfolio" element={<CareerPortfolio />} />
        </Route>
      )} */}

      {/* 4. Employer Routes */}
      {/* {appUser.role === 'EMPLOYER' && (
        <Route path="/employer" element={<EmployerDashboard user={appUser} token={token} />}>
          <Route index element={<Navigate to="portal" replace />} />
          <Route path="portal" element={<EmployerPortalMain />} />
          <Route path="post-job" element={<JobPostingForm />} />
        </Route>
      )} */}

      {/* 5. Fallback for unauthorized access or 404 */}
      <Route path="*" element={<div className="p-10 text-center">Current Path: {location.pathname} 404: Page Not Found or Unauthorized</div>} />
    </Routes>
  );
};

/**
 * Helper component to handle the initial landing redirect
 */
const RoleBasedRedirect = ({ role }) => {
  switch (role) {
    case 'STUDENT': return <Navigate to="/student" replace />;
    case 'EMPLOYER': return <Navigate to="/employer" replace />;
    case 'STAFF':
    case 'FACULTY': return <Navigate to="/admin" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

export default AppRoutes;