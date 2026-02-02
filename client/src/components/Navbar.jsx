import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../app/useAuth";

const linkStyle = ({ isActive }) => ({
  marginRight: 12,
  textDecoration: "none",
  fontWeight: isActive ? 700 : 500
});

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div style={{ borderBottom: "1px solid #eee", padding: "12px 16px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center" }}>
        <Link to="/" style={{ fontWeight: 800, textDecoration: "none", marginRight: 18 }}>
          EventPlanner Pro
        </Link>

        <NavLink to="/events" style={linkStyle}>
          Events
        </NavLink>

        <div style={{ flex: 1 }} />

        {!isAuthenticated ? (
          <>
            <NavLink to="/login" style={linkStyle}>Login</NavLink>
            <NavLink to="/register" style={linkStyle}>Register</NavLink>
          </>
        ) : (
          <>
            <span style={{ marginRight: 12 }}>
              {user?.name} ({user?.role})
            </span>

            {user?.role === "admin" && (
              <NavLink to="/admin" style={linkStyle}>
                Admin
              </NavLink>
            )}

            <button
              onClick={() => {
                logout();
                nav("/");
              }}
              style={{ padding: "8px 12px", cursor: "pointer" }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
