import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../app/useAuth";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left side: Logo and Events link */}
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-xl font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              EventPlanner Pro
            </Link>

            <NavLink 
              to="/events" 
              className={({ isActive }) =>
                `text-gray-700 hover:text-blue-600 transition-colors ${
                  isActive ? "font-semibold text-blue-600" : ""
                }`
              }
            >
              Events
            </NavLink>
          </div>

          {/* Right side: Auth links */}
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) =>
                    `text-gray-700 hover:text-blue-600 transition-colors ${
                      isActive ? "font-semibold text-blue-600" : ""
                    }`
                  }
                >
                  Login
                </NavLink>
                <NavLink 
                  to="/register" 
                  className={({ isActive }) =>
                    `text-gray-700 hover:text-blue-600 transition-colors ${
                      isActive ? "font-semibold text-blue-600" : ""
                    }`
                  }
                >
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <span className="text-gray-600">
                  {user?.name} <span className="text-gray-500">({user?.role})</span>
                </span>

                {user?.role === "admin" && (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) =>
                      `text-gray-700 hover:text-blue-600 transition-colors ${
                        isActive ? "font-semibold text-blue-600" : ""
                      }`
                    }
                  >
                    Admin
                  </NavLink>
                )}

                <button
                  onClick={() => {
                    logout();
                    nav("/");
                  }}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}