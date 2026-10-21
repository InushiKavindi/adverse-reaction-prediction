import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'register'

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    setUser(currentUser);
    api.fetchCurrentUser().then((freshUser) => {
      if (freshUser) setUser(freshUser);
    }).catch(() => {});
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.success) {
      setUser(res.user);
      setIsAuthModalOpen(false);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      // Auto login after registration
      await login(userData.username, userData.password);
      setIsAuthModalOpen(false);
    }
    return res;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setIsAuthModalOpen(true);
    setAuthMode("login");
  };

  const openLogin = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode("register");
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        openLogin,
        openRegister
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
