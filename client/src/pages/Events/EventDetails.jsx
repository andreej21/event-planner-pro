import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { eventsApi } from "../../services/events";
import { weatherApi } from "../../services/weather";
import { useAuth } from "../../app/useAuth";
import { getErrorMessage } from "../../services/api";
import Modal from "../../components/Modal";
import { commentsApi } from "../../services/comments";
import { registrationsApi } from "../../services/registrations";

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

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentErr, setCommentErr] = useState("");

  const [myReg, setMyReg] = useState(null);
  const [regErr, setRegErr] = useState("");
  const [regLoading, setRegLoading] = useState(false);


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

      // comments
        try {
            const list = await commentsApi.list(id);
            setComments(list);
        } catch {
            setComments([]);
        }

// my registration status (only if logged in)
        if (user) {
            try {
                const r = await registrationsApi.myStatus(id);
            setMyReg(r);
            } catch {
            setMyReg(null);
            }
        } else {
            setMyReg(null);
        }

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
}, [id, user]);

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
  async function addComment() {
  setCommentErr("");
  try {
    if (!commentText.trim()) {
      setCommentErr("Write a comment.");
      return;
    }
    const created = await commentsApi.create(id, commentText.trim());
    setComments((prev) => [created, ...prev]);
    setCommentText("");
  } catch (e) {
    setCommentErr(getErrorMessage(e));
  }
}

async function doParticipate() {
  setRegErr("");
  setRegLoading(true);
  try {
    await registrationsApi.participate(id);
    const updated = await eventsApi.get(id);
    setEvent(updated);
    const r = await registrationsApi.myStatus(id);
    setMyReg(r);
  } catch (e) {
    setRegErr(getErrorMessage(e));
  } finally {
    setRegLoading(false);
  }
}

async function doCancelParticipation() {
  setRegErr("");
  setRegLoading(true);
  try {
    await registrationsApi.cancel(id);
    const updated = await eventsApi.get(id);
    setEvent(updated);
    setMyReg(null);
  } catch (e) {
    setRegErr(getErrorMessage(e));
  } finally {
    setRegLoading(false);
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
        {user && (
  <div style={{ marginTop: 12 }}>
    {regErr && <div style={{ color: "crimson" }}>{regErr}</div>}

    {!myReg ? (
      <button
        onClick={doParticipate}
        disabled={regLoading}
        style={{ padding: "8px 12px", cursor: "pointer", borderRadius: 8 }}
      >
        {regLoading ? "Working..." : "Participate"}
      </button>
    ) : (
      <button
        onClick={doCancelParticipation}
        disabled={regLoading}
        style={{ padding: "8px 12px", cursor: "pointer", borderRadius: 8 }}
      >
        {regLoading ? "Working..." : "Cancel participation"}
      </button>
    )}
  </div>
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

      <div style={{ marginTop: 18, borderTop: "1px solid #eee", paddingTop: 14 }}>
  <h3>Comments</h3>

  {!user ? (
    <div style={{ opacity: 0.8 }}>
      You must <Link to="/login">login</Link> to comment.
    </div>
  ) : (
    <div style={{ marginBottom: 12 }}>
      {commentErr && <div style={{ color: "crimson" }}>{commentErr}</div>}
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        rows={3}
        placeholder="Write a comment..."
        style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
      />
      <button onClick={addComment} style={{ marginTop: 8, padding: "8px 12px", cursor: "pointer" }}>
        Post comment
      </button>
    </div>
  )}

  {!comments.length ? (
    <div style={{ opacity: 0.7 }}>No comments yet.</div>
  ) : (
    <div style={{ display: "grid", gap: 10 }}>
      {comments.map((c) => (
        <div key={c._id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            <b>{c.author?.name || "Unknown"}</b> • {new Date(c.createdAt).toLocaleString()}
          </div>
          <div style={{ marginTop: 8 }}>{c.content}</div>
        </div>
      ))}
    </div>
  )}
</div>

    </div>

    
  );
}
