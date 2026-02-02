import React, { useEffect, useState } from "react";
import { eventsApi } from "../../services/events";
import { getErrorMessage } from "../../services/api";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const list = await eventsApi.list();
        setEvents(Array.isArray(list) ? list : list.data || []);
      } catch (e) {
        setErr(getErrorMessage(e));
      }
    })();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p style={{ opacity: 0.8 }}>
        (Placeholder) — тука подоцна ќе додадеме manage users / events.
      </p>

      {err && <div style={{ color: "crimson" }}>{err}</div>}

      <div style={{ marginTop: 12 }}>
        <h3>All events</h3>
        <ul>
          {events.map((e) => (
            <li key={e._id}>
              {e.title} — <b>{e.status}</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
