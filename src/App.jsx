import OktaLoginModal from "./components/OktaLogin";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainPage from "./MainPage";
import './index.css';
import './App.css';
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