import OktaLoginModal from "./components/OktaLogin";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./MainPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CommandCenter from "./pages/admin/CommandCenter";
import UserManagement from "./pages/admin/user/UserManagement";
import StaffJobOversight from "./pages/admin/staff/StaffJobOversight";



const App = () => {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      {!isAuthenticated && !import.meta.env.VITE_DEV ? (
        <OktaLoginModal />
      ) : (
        <div>
          <BrowserRouter>
            <MainPage />
          </BrowserRouter>

        </div>
      )}
    </>
  );
};
export default App;