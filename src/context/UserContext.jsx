import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
export const UserContext = createContext(null);
import { injectUserToken } from '../api/ApiClient';
import init from "../init";
import axios from "axios";

const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const getHeaders = (rawIdToken) => {
  return {
    "Authorization": `Bearer ${rawIdToken}`,
  }
};

const getActiveUser = '/' + init.appName + '/api/users/';


export function UserContextProvider({ children }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    getIdTokenClaims
  } = useAuth0();

  let beingLogin = false;

  const [appUser, setAppUser] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [token, setToken] = useState(undefined);

  const getUser = async (rawIdToken) => {

    try {
      const response = await fetch(`${getActiveUser}`, { headers: getHeaders(rawIdToken) });
      
      if (!response.ok) throw new Error('Failed to fetch user');
      const user = await response.json();
      setAppUser(user);
      
      console.log('User fetched:', user);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {

    }
  };

  const cleanupAndLogout = async () => {
    console.log(`clear the localStorage`);
    setAppUser(undefined);
    setToken(undefined);
    localStorage.clear();
    logout({ logoutParams: { returnTo: window.location.origin } });
  }

  // const getRawToken = async () => {
  //   return (import.meta.env.VITE_DEV) 
  //   ? import.meta.env.VITE_DEV
  //   : await getRawTokenFromOkta();
  // }

  const getRawTokenFromOkta = async () => {
    const claims = await getIdTokenClaims();
    return claims?.__raw;
  }
  
  useEffect(() => {
    const initialize = async () => {
      if (appUser) return;

      if (beingLogin) return;
      beingLogin = !beingLogin;

      const rawIdToken = (import.meta.env.VITE_DEV) ? import.meta.env.VITE_DEV : await getRawTokenFromOkta();
      if (!rawIdToken) return;
      setToken(import.meta.env.VITE_DEV);
      await getUser(rawIdToken);
      injectUserToken(rawIdToken);
      
      beingLogin = !beingLogin;
    }
    initialize();
  }, [isAuthenticated, appUser]);

  const value = {
    user,
    appUser,
    isAuthenticated,
    isLoading,
    token,
    loginWithRedirect,
    login: () => loginWithRedirect(),
    logout: () => cleanupAndLogout(),
    getAccessTokenSilently
  };



  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
