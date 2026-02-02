import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { eventsApi } from "../../services/events";
import { weatherApi } from "../../services/weather";
import { useAuth } from "../../app/useAuth";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";

export default function EventDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [weather, setWeather] = useState(null);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const canEdit = useMemo(() => {
    if (!user || !event) return false;
    if (user.role === "admin") return true;
    // organizer може да биде објект (populate) или string
    const organizerId = typeof event.organizer === "string" ? event.organizer : event.organizer?._id;
    return organizerId && organizerId === user.id;
  }, [user, event]);

  async function load() {
    setServerError("");
    setLoading(true);
    try {
      const e = await eventsApi.get(id);
      setEvent(e);

      // Weather: само ако е outside
      if (e?.isOutside && e?.location && e?.date) {
        try {
          const w = await weatherApi.getForecast(e.location, e.date);
          setWeather(w);
        } catch {
          setWeather(null);
        }
      } else {
        setWeather(null);
      }
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function doDelete() {
    setDeleteError("");
    setDeleting(true);
    try {
      await eventsApi.remove(id);
      setConfirmOpen(false);
      nav("/events");
    } catch (e) {
      setDeleteError(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (serverError) return <div style={{ color: "crimson" }}>{serverError}</div>;
  if (!event) return <div>Not found.</div>;

  return (
    <div>
      <Link to="/events">← Back</Link>
      <h2 style={{ marginTop: 10 }}>{event.title}</h2>

      <div style={{ opacity: 0.85 }}>{event.location}</div>
      <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
        {new Date(event.date).toLocaleString()} → {new Date(event.endDate).toLocaleString()}
      </div>

      <p style={{ marginTop: 10 }}>{event.description}</p>

      <div style={{ marginTop: 10 }}>
        Status: <b>{event.status}</b> | Category: <b>{event.category}</b> | Outside:{" "}
        <b>{event.isOutside ? "Yes" : "No"}</b>
      </div>

      <div style={{ marginTop: 10 }}>
        Organizer:{" "}
        <b>
          {typeof event.organizer === "string"
            ? event.organizer
            : `${event.organizer?.name} (${event.organizer?.email})`}
        </b>
      </div>

      <div style={{ marginTop: 12 }}>
        Participants: <b>{event.currentParticipants ?? 0}</b> / {event.maxParticipants ?? "?"}
      </div>

      {/* Weather */}
      {event.isOutside && (
        <div style={{ marginTop: 16, border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Weather</h3>
          {weather ? (
            <div>
              <div>
                <b>{weather.location}</b> — {weather.description}
              </div>
              <div style={{ marginTop: 6 }}>
                Temp: <b>{weather.temperature}°C</b> (feels like {weather.feelsLike}°C)
              </div>
              <div style={{ marginTop: 6 }}>
                Wind: {weather.windSpeed} m/s | Humidity: {weather.humidity}%
              </div>
            </div>
          ) : (
            <div style={{ opacity: 0.7 }}>No forecast available.</div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
        {canEdit && (
          <Link
            to={`/events/${event._id}/edit`}
            style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
          >
            Edit
          </Link>
        )}

        {canEdit && (
          <button
            onClick={() => setConfirmOpen(true)}
            style={{ padding: "8px 12px", cursor: "pointer", borderRadius: 8 }}
          >
            Delete
          </button>
        )}
      </div>

      <Modal open={confirmOpen} title="Confirm delete" onClose={() => setConfirmOpen(false)}>
        <p>Are you sure you want to delete this event?</p>
        {deleteError && <div style={{ color: "crimson" }}>{deleteError}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <button onClick={() => setConfirmOpen(false)} style={{ padding: "8px 12px", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={doDelete} disabled={deleting} style={{ padding: "8px 12px", cursor: "pointer" }}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
