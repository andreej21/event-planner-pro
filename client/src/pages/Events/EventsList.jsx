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

  const canCreate = !!user;

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Events</h2>
        {canCreate && (
          <Link
            to="/events/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            + New Event
          </Link>
        )}
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={load}
            className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {serverError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {!filtered.length ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
              No events found.
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((e) => (
                <div
                  key={e._id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      <Link
                        to={`/events/${e._id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {e.title}
                      </Link>
                    </h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      e.status === 'published' ? 'bg-green-100 text-green-800' :
                      e.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      e.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {e.status}
                    </span>
                  </div>

                  <div className="mt-2 text-gray-600">{e.location}</div>
                  <div className="mt-1 text-sm text-gray-500">
                    {new Date(e.date).toLocaleString()}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Participants: <span className="font-semibold">{e.currentParticipants ?? 0}</span> / {e.maxParticipants ?? "?"}
                    </div>
                    <span className="text-sm font-medium text-gray-500">{e.category}</span>
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