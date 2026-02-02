import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./authContext";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

import EventsList from "../pages/Events/EventsList";
import EventDetails from "../pages/Events/EventDetails";
import EventCreate from "../pages/Events/EventCreate";
import EventEdit from "../pages/Events/EventEdit";
import AdminDashboard from "../pages/Admin/AdminDashboard";

import ProtectedRoute from "../components/ProtectedRoute";
import RoleGate from "../components/RoleGate";

export default function App() {
  return (
    <AuthProvider>
      <Navbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/events" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetails />} />

          {/* Protected */}
          <Route
            path="/events/new"
            element={
              <ProtectedRoute>
                <EventCreate />
              </ProtectedRoute>
            }
          />

          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute>
                <EventEdit />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGate roles={["admin"]}>
                  <AdminDashboard />
                </RoleGate>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
