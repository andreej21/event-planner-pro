import React from "react";
import { useAuth } from "../app/useAuth";

export default function RoleGate({ roles = [], children }) {
  const { user } = useAuth();

  if (!user) return null;
  if (!roles.includes(user.role)) {
    return (
      <div style={{ padding: 16, border: "1px solid #f2c" }}>
        <h3>403 - Forbidden</h3>
        <p>Немаш пристап до оваа страница.</p>
      </div>
    );
  }
  return children;
}
