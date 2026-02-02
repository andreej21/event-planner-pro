import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h2>Welcome</h2>
      <p>This is your React SPA for EventPlanner Pro.</p>

      <ul>
        <li><Link to="/events">Browse events</Link></li>
        <li><a href="/api/docs" target="_blank" rel="noreferrer">Swagger docs</a></li>
        <li><a href="/db" target="_blank" rel="noreferrer">DB tools</a></li>
      </ul>
    </div>
  );
}
