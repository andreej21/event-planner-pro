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

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-gray-600 text-lg">⏳ Loading event...</div>
    </div>
  );
  
  if (serverError) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-red-600">{serverError}</div>
    </div>
  );
  
  if (!event) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-gray-600">Event not found</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/events" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium">
        ← Back to Events
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              <span className="flex items-center gap-2">📍 {event.location}</span>
              <span className="flex items-center gap-2">🕒 {new Date(event.date).toLocaleDateString()}</span>
              <span className="flex items-center gap-2">⏰ {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full font-semibold ${
            event.status === 'published' ? 'bg-green-100 text-green-800' :
            event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
            event.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {event.status}
          </span>
        </div>

        <p className="text-gray-600 mt-6 leading-relaxed">{event.description}</p>

        {/* Event Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
          <div>
            <div className="text-gray-600 text-sm">Category</div>
            <div className="font-bold text-gray-900 mt-1">{event.category}</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Price</div>
            <div className="font-bold text-green-600 mt-1">${event.price?.toFixed(2) || '0.00'}</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Outdoor</div>
            <div className="font-bold text-gray-900 mt-1">{event.isOutside ? '✅ Yes' : '❌ No'}</div>
          </div>
          <div>
            <div className="text-gray-600 text-sm">Participants</div>
            <div className="font-bold text-gray-900 mt-1">{event.currentParticipants ?? 0} / {event.maxParticipants ?? '∞'}</div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="text-gray-600 text-sm">Organizer</div>
          <div className="font-bold text-gray-900 mt-1">
            {typeof event.organizer === "string"
              ? event.organizer
              : `${event.organizer?.name} (${event.organizer?.email})`}
          </div>
        </div>
      </div>

      {/* Weather */}
      {event.isOutside && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">🌤️ Weather Forecast</h3>
          {weather ? (
            <div className="space-y-3">
              <div>
                <div className="font-bold text-gray-900">{weather.location}</div>
                <div className="text-gray-600 mt-1">{weather.description}</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-gray-600 text-sm">Temperature</div>
                  <div className="font-bold text-lg text-orange-600">{weather.temperature}°C</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm">Feels Like</div>
                  <div className="font-bold text-lg">{weather.feelsLike}°C</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm">Wind Speed</div>
                  <div className="font-bold text-lg">{weather.windSpeed} m/s</div>
                </div>
                <div>
                  <div className="text-gray-600 text-sm">Humidity</div>
                  <div className="font-bold text-lg">{weather.humidity}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">⚠️ No weather forecast available</div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-3 mb-6">
          {canEdit && (
            <Link
              to={`/events/${event._id}/edit`}
              className="bg-gray-100 text-gray-800 px-5 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
            >
              ✏️ Edit Event
            </Link>
          )}

          {canEdit && (
            <button
              onClick={() => setConfirmOpen(true)}
              className="bg-red-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Delete Event
            </button>
          )}
        </div>

        {user && (
          <div>
            {regErr && <div className="text-red-600 mb-4">{regErr}</div>}

            {!myReg ? (
              <button
                onClick={doParticipate}
                disabled={regLoading}
                className="bg-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {regLoading ? "Processing..." : "✅ Participate"}
              </button>
            ) : (
              <button
                onClick={doCancelParticipation}
                disabled={regLoading}
                className="border-2 border-blue-600 text-blue-600 px-5 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {regLoading ? "Processing..." : "❌ Cancel Participation"}
              </button>
            )}
          </div>
        )}
      </div>

      <Modal open={confirmOpen} title="Delete Event" onClose={() => setConfirmOpen(false)}>
        <p className="text-gray-700 mb-4">Are you sure you want to delete this event? This action cannot be undone.</p>
        {deleteError && <div className="text-red-600 mb-4">{deleteError}</div>}
        <div className="flex gap-3 justify-end">
          <button 
            onClick={() => setConfirmOpen(false)} 
            className="border-2 border-blue-600 text-blue-600 px-5 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            onClick={doDelete} 
            disabled={deleting} 
            className="bg-red-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </Modal>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">💬 Comments</h3>

        {!user ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
            You must <Link to="/login" className="font-semibold hover:underline">login</Link> to comment.
          </div>
        ) : (
          <div className="mb-6">
            {commentErr && <div className="text-red-600 mb-3">{commentErr}</div>}
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
              placeholder="Share your thoughts about this event..."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
            />
            <button 
              onClick={addComment} 
              className="bg-gray-100 text-gray-800 px-5 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 mt-3"
            >
              📝 Post Comment
            </button>
          </div>
        )}

        {!comments.length ? (
          <div className="text-gray-600 text-center py-8">No comments yet. Be the first to comment!</div>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{c.author?.name || "Anonymous"}</div>
                  <div className="text-gray-600 text-sm">{new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-gray-700">{c.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}