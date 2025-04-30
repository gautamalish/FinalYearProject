import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../config/firebase-config";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState(null);
  const [mongoUser, setMongoUser] = useState(null);

  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  const fetchMongoUser = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await axios.get(
        `http://localhost:3000/api/users/firebase/${firebaseUser.uid}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      if (response.data) {
        // If user is a worker, fetch worker data to get hourlyRate
        if (response.data.role === 'worker') {
          try {
            const workerResponse = await axios.get(
              `http://localhost:3000/api/workers/${firebaseUser.uid}`,
              {
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
              }
            );
            
            if (workerResponse.data) {
              // Combine user data with worker data
              const combinedData = {
                ...response.data,
                hourlyRate: workerResponse.data.hourlyRate
              };
              setMongoUser(combinedData);
              return combinedData;
            }
          } catch (workerError) {
            console.error("Error fetching worker data:", workerError.response || workerError);
            // Continue with just the user data if worker data fetch fails
          }
        }
        
        setMongoUser(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching MongoDB user:", error.response || error);
      return null;
    }
  };

  // Modifying auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Ensure we're using the Firebase auth user object
          const firebaseUser = auth.currentUser;
          if (!firebaseUser) throw new Error("No Firebase user available");
          
          const initialToken = await firebaseUser.getIdToken();
          setToken(initialToken);
          const mongoData = await fetchMongoUser(firebaseUser);
          console.log('MongoDB User Data:', mongoData);
          
          // Set the current user with the Firebase auth instance and ensure it has auth methods
          setCurrentUser(firebaseUser);
          setMongoUser({ ...mongoData, role: mongoData?.role || "client" });
          // Only setup token refresh if we have a valid Firebase user
          if (firebaseUser?.getIdToken) {
            setupTokenRefresh();
          }
        } catch (error) {
          console.error("Error during auth state change:", error);
          setCurrentUser(null);
          setMongoUser(null);
          setToken(null);
        }
      } else {
        setCurrentUser(null);
        setMongoUser(null);
        setToken(null);
        if (tokenRefreshInterval) {
          clearInterval(tokenRefreshInterval);
          setTokenRefreshInterval(null);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, []);

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = await currentUser.getIdToken();
      console.log("Attempting to update role for:", userId); // Debug log

      const response = await axios.patch(
        `http://localhost:3000/api/users/${userId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Full error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  };

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
  const refreshToken = async () => {
    try {
      // Always get the current Firebase user directly from auth
      const currentFirebaseUser = auth.currentUser;
      if (!currentFirebaseUser?.getIdToken) return null;
      
      const freshToken = await currentFirebaseUser.getIdToken(true);
      setToken(freshToken);
      
      // Refresh MongoDB user data after token refresh
      const mongoData = await fetchMongoUser(currentFirebaseUser);
      if (mongoData) {
        // Update currentUser while preserving Firebase auth instance
        setCurrentUser(currentFirebaseUser);
        setMongoUser({ ...mongoData, role: mongoData.role || "client" });
      }
      
      return freshToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  // Function to set up automatic token refresh
  const setupTokenRefresh = () => {
    // First get the token immediately
    refreshToken();

    // Set up interval to refresh token before it expires
    const interval = setInterval(async () => {
      await refreshToken();
    }, 55 * 60 * 1000); // Refresh every 55 minutes (tokens expire after 1 hour)

    setTokenRefreshInterval(interval);
  };

  const value = {
    currentUser: auth.currentUser || currentUser,
    token,
    signUp,
    logIn,
    logOut,
    loading,
    fetchMongoUser,
    mongoUser,
    updateUserRole,
    refreshToken: async () => {
      const firebaseUser = auth.currentUser;
      return firebaseUser ? refreshToken() : Promise.resolve(null);
    },
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
