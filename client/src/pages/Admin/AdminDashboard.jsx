import React, { useEffect, useState } from "react";
import { eventsApi } from "../../services/events";
import { getErrorMessage } from "../../services/api";

export default function AdminDashboard() {
  const [events, setEvents] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await eventsApi.list();
        setEvents(Array.isArray(list) ? list : list.data || []);
      } catch (e) {
        setErr(getErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">Admin Dashboard</h2>
      <p className="mb-6 text-gray-600">
        Manage your platform's events and users from one central location.
      </p>

      {err && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
          {err}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">All Events</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                No events found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Participants
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {events.map((e) => (
                      <tr key={e._id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                          {e.title}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            e.status === 'published' ? 'bg-green-100 text-green-800' :
                            e.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            e.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {new Date(e.date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                          {e.currentParticipants ?? 0} / {e.maxParticipants ?? '∞'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Total Events</div>
                <div className="text-2xl font-bold text-gray-900">{events.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Published Events</div>
                <div className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.status === 'published').length}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Coming Soon</h3>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                User Management
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Advanced Analytics
              </li>
              <li className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Email Notifications
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}