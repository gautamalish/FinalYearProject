import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase-config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState(null);

  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logOut() {
    // Clear the refresh interval when logging out
    if (tokenRefreshInterval) {
      clearInterval(tokenRefreshInterval);
      setTokenRefreshInterval(null);
    }
    setToken(null);
    return signOut(auth);
  }

  // Function to refresh the token
  const refreshToken = async (user) => {
    try {
      const freshToken = await user.getIdToken(true);
      setToken(freshToken);
      return freshToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  // Function to set up automatic token refresh
  const setupTokenRefresh = (user) => {
    // First get the token immediately
    refreshToken(user);

    // Set up interval to refresh token before it expires
    const interval = setInterval(async () => {
      await refreshToken(user);
    }, 55 * 60 * 1000); // Refresh every 55 minutes (tokens expire after 1 hour)

    setTokenRefreshInterval(interval);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Set up token refresh when user logs in
        setupTokenRefresh(user);
      } else {
        // Clear interval when no user is logged in
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
          setTokenRefreshInterval(null);
        }
        setToken(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
      // Clean up interval on unmount
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, []);

  const value = {
    currentUser,
    token,
    signUp,
    logIn,
    logOut,
    loading,
    refreshToken: () =>
      currentUser ? refreshToken(currentUser) : Promise.resolve(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
