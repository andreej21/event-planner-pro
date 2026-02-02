import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../app/useAuth";

export default function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return children;
}