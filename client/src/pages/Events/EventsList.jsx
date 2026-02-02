import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../../services/events";
import { useAuth } from "../../app/useAuth";
import { getErrorMessage } from "../../services/api";
import ChartAttendance from "../../components/ChartAttendance";

export default function EventsList() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);

  const canCreate = !!user; // logged in

  async function load() {
    setServerError("");
    setLoading(true);
    try {
      const list = await eventsApi.list(search ? { search } : {});
      setEvents(Array.isArray(list) ? list : list.data || []);
    } catch (e) {
      setServerError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!search) return events;
    const s = search.toLowerCase();
    return events.filter((e) => (e.title || "").toLowerCase().includes(s));
  }, [events, search]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2 style={{ marginRight: 12 }}>Events</h2>
        <div style={{ flex: 1 }} />
        {canCreate && (
          <Link to="/events/new" style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}>
            + New Event
          </Link>
        )}
      </div>

      <div style={{ margin: "12px 0" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title..."
          style={{ width: "100%", padding: 10 }}
        />
        <button onClick={load} style={{ marginTop: 8, padding: "8px 12px", cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {serverError && <div style={{ color: "crimson" }}>{serverError}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {!filtered.length ? (
            <div>No events.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {filtered.map((e) => (
                <div key={e._id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <h3 style={{ margin: 0 }}>
                      <Link to={`/events/${e._id}`}>{e.title}</Link>
                    </h3>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: 12, opacity: 0.8 }}>{e.status}</span>
                  </div>

                  <div style={{ marginTop: 6, opacity: 0.9 }}>{e.location}</div>
                  <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
                    {new Date(e.date).toLocaleString()}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    Participants: <b>{e.currentParticipants ?? 0}</b> / {e.maxParticipants ?? "?"}
                  </div>
                </div>
              ))}
            </div>
          )}

          <ChartAttendance events={events} />
        </>
      )}
    </div>
  );
}
