import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Welcome to EventPlanner Pro
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Your all-in-one solution for organizing and managing events with ease.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              to="/events"
              className="rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Browse Events</h3>
              <p className="text-gray-600">Discover upcoming events and join the ones that interest you.</p>
            </Link>

            <a
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <h3 className="mb-2 text-xl font-semibold text-gray-900">API Documentation</h3>
              <p className="text-gray-600">Explore our comprehensive API documentation with Swagger.</p>
            </a>

            <a
              href="/db"
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <h3 className="mb-2 text-xl font-semibold text-gray-900">Database Tools</h3>
              <p className="text-gray-600">Access database administration and management tools.</p>
            </a>

          </div>
        </div>
      </div>
    </div>
  );
}