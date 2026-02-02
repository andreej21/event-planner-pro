import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "../../utils/validators";
import { eventsApi } from "../../services/events";
import { useAuth } from "../../app/useAuth";
import { getErrorMessage } from "../../services/api";

function Field({ label, error, children, style }) {
  return (
    <div className="mb-4" style={style}>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

const inputStyle = "w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors";

function toLocalDatetime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function EventEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(eventSchema)
  });

  const canEdit = useMemo(() => {
    if (!user || !event) return false;
    if (user.role === "admin") return true;
    const organizerId = typeof event.organizer === "string" ? event.organizer : event.organizer?._id;
    return organizerId && organizerId === user.id;
  }, [user, event]);

  const isOutside = watch("isOutside");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setServerError("");
      setLoading(true);
      try {
        const e = await eventsApi.get(id);
        if (cancelled) return;

        setEvent(e);
        reset({
          title: e.title ?? "",
          description: e.description ?? "",
          category: e.category ?? "other",
          location: e.location ?? "",
          date: toLocalDatetime(e.date),
          endDate: toLocalDatetime(e.endDate),
          maxParticipants: e.maxParticipants ?? 50,
          price: e.price ?? 0,
          isOutside: !!e.isOutside,
          status: e.status ?? "draft"
        });
      } catch (err) {
        setServerError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, reset]);

  async function onSubmit(values) {
    setServerError("");
    try {
      if (!canEdit) {
        setServerError("No permission to edit this event.");
        return;
      }
      const payload = {
        ...values,
        date: new Date(values.date).toISOString(),
        endDate: new Date(values.endDate).toISOString()
      };
      await eventsApi.update(id, payload);
      nav(`/events/${id}`);
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  }

  if (loading) return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    </div>
  );
  
  if (serverError) return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg bg-red-50 p-6 text-red-700">
        <h2 className="mb-2 text-xl font-semibold">Error</h2>
        <p>{serverError}</p>
        <Link 
          to={`/events/${id}`} 
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Back to Event
        </Link>
      </div>
    </div>
  );
  
  if (!event) return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Event Not Found</h2>
        <p className="text-gray-600">The event you're looking for doesn't exist.</p>
      </div>
    </div>
  );

  if (!canEdit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Link 
          to={`/events/${id}`} 
          className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Event
        </Link>
        
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 110-6 3 3 0 010 6z" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-red-800">403 - Forbidden</h2>
          <p className="text-red-600">Немаш право да го уредуваш овој настан.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        to={`/events/${id}`} 
        className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Event
      </Link>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Edit Event</h2>
        <p className="text-gray-600">Update the details of your event</p>
      </div>

      {serverError && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <Field label="Title" error={errors.title?.message}>
            <input 
              {...register("title")} 
              className={inputStyle}
              placeholder="Enter event title"
            />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <textarea 
              {...register("description")} 
              rows={5} 
              className={inputStyle}
              placeholder="Describe your event"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category?.message}>
              <select {...register("category")} className={inputStyle}>
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="social">Social</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Status" error={errors.status?.message}>
              <select {...register("status")} className={inputStyle}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Location & Time</h3>
          
          <Field label="Location" error={errors.location?.message}>
            <input 
              {...register("location")} 
              className={inputStyle}
              placeholder="Enter event location or address"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date/time" error={errors.date?.message}>
              <input 
                type="datetime-local" 
                {...register("date")} 
                className={inputStyle}
              />
            </Field>

            <Field label="End date/time" error={errors.endDate?.message}>
              <input 
                type="datetime-local" 
                {...register("endDate")} 
                className={inputStyle}
              />
            </Field>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Participants & Pricing</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Max participants" error={errors.maxParticipants?.message}>
              <input 
                type="number" 
                {...register("maxParticipants", { valueAsNumber: true })} 
                className={inputStyle}
                min="1"
              />
            </Field>

            <Field label="Price ($)" error={errors.price?.message}>
              <input 
                type="number" 
                step="0.01" 
                {...register("price", { valueAsNumber: true })} 
                className={inputStyle}
                min="0"
              />
            </Field>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Additional Settings</h3>
          
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="isOutside"
              {...register("isOutside")} 
              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isOutside" className="ml-3 text-gray-700">
              <span className="font-medium">Outdoor event</span>
              <p className="text-sm text-gray-500">Show weather forecast for this location</p>
            </label>
          </div>

          {isOutside && (
            <div className="mt-3 rounded-lg bg-blue-50 p-4">
              <div className="flex items-center">
                <svg className="mr-2 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-blue-700">Weather forecast will be shown on the event details page</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => nav(`/events/${id}`)}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Saving...
              </span>
            ) : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}