import React, { useContext, useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase-config";
const AuthContext = React.createContext();
const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(false);
  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signUp,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
