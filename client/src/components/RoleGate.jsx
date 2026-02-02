import React from "react";
import { useAuth } from "../app/useAuth";

export default function RoleGate({ roles = [], children }) {
  const { user } = useAuth();

  if (!user) return null;
  
  if (!roles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 110-6 3 3 0 010 6z" />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-red-800">403 - Forbidden</h3>
          <p className="text-red-600">Немаш пристап до оваа страница.</p>
        </div>
      </div>
    );
  }
  
  return children;
}