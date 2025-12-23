import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import CommandCenter from './pages/admin/CommandCenter';
import UserManagement from './pages/admin/user/UserManagement';
import StaffJobOversight from './pages/admin/staff/StaffJobOversight';
import SystemSettings from './pages/admin/settting/SystemSettings';
import AppliedLearningDashboard from './pages/admin/learning/AppliedLearningDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentOverview from './pages/student/StudentOverview';
import StudentJobBoard from './pages/student/job/StudentJobBoard';
import StudentApplications from './pages/student/application/StudentApplications';
import StudentLearning from './pages/student/learning/StudentLearning';
import StudentProfile from './pages/student/career/StudentProfile';
import EmployerDashboard from './pages/employer/EmployerDashboard';
import EmployerOverview from './pages/employer/EmployerOverview';
import EmployerJobsList from './pages/employer/job/EmployerJobsList';
import JobPostingForm from './pages/employer/job/JobPostingForm';
import EmployerJobDetail from './pages/employer/job/EmployerJobDetail';

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
      {appUser.role === 'STUDENT' && (
        <Route path="/student" element={<StudentDashboard user={appUser} token={token} />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<StudentOverview user={appUser} token={token} />} />
          <Route path="jobs" element={<StudentJobBoard user={appUser} token={token}/>} />
          <Route path="applications" element={<StudentApplications user={appUser} token={token}/>} />
          <Route path="learning" element={<StudentLearning user={appUser} token={token}/>} />
          <Route path="profile" element={<StudentProfile user={appUser} token={token}/>} />
        </Route>
      )}

      {/* 4. Employer Routes */}
      {appUser.role === 'EMPLOYER' && (
        <Route path="/employer" element={<EmployerDashboard user={appUser} token={token} />}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<EmployerOverview user={appUser} token={token} />} />
          <Route path="my-jobs" element={<EmployerJobsList user={appUser} token={token} />} />
          <Route path="my-jobs/new" element={<JobPostingForm />} />
          <Route path="my-jobs/:jobId" element={<EmployerJobDetail />} />
        </Route>
        
      )}

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