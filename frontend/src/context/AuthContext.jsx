import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

/**
 * Holds the current logged-in user + JWT in memory (backed by
 * localStorage for persistence across refreshes). role is either
 * "student" or "counsellor" and drives which dashboard/routes render.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mindcare_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((token, userData) => {
    localStorage.setItem("mindcare_token", token);
    localStorage.setItem("mindcare_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("mindcare_token");
    localStorage.removeItem("mindcare_user");
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedProfile) => {
    setUser((prev) => {
      if (!prev) return null;
      const newUserData = {
        ...prev,
        name: updatedProfile.name || prev.name,
        profile: { ...prev.profile, ...updatedProfile },
      };
      localStorage.setItem("mindcare_user", JSON.stringify(newUserData));
      return newUserData;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
