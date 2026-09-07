import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Guards a route to a specific role. Redirects to the landing page if
 * the visitor isn't logged in, or hasn't got the right role — this is
 * the frontend mirror of the backend's requireRole middleware.
 */
const ProtectedRoute = ({ role, children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
