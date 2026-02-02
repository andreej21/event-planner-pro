import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "../../utils/validators";
import { eventsApi } from "../../services/events";
import { useAuth } from "../../app/useAuth";
import { getErrorMessage } from "../../services/api";

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setServerError("");
      setLoading(true);
      try {
        const e = await eventsApi.get(id);
        if (cancelled) return;

        setEvent(e);
        // fill form
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

  if (loading) return <div>Loading...</div>;
  if (serverError) return <div style={{ color: "crimson" }}>{serverError}</div>;
  if (!event) return <div>Not found.</div>;

  if (!canEdit) {
    return (
      <div>
        <Link to={`/events/${id}`}>← Back</Link>
        <h2>403 - Forbidden</h2>
        <p>Немаш право да го уредуваш овој настан.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <Link to={`/events/${id}`}>← Back</Link>
      <h2>Edit Event</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Field label="Title" error={errors.title?.message}>
          <input {...register("title")} style={inputStyle} />
        </Field>

        <Field label="Description" error={errors.description?.message}>
          <textarea {...register("description")} rows={5} style={inputStyle} />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Category" error={errors.category?.message} style={{ flex: 1 }}>
            <select {...register("category")} style={inputStyle}>
              <option value="conference">conference</option>
              <option value="workshop">workshop</option>
              <option value="social">social</option>
              <option value="sports">sports</option>
              <option value="other">other</option>
            </select>
          </Field>

          <Field label="Status" error={errors.status?.message} style={{ flex: 1 }}>
            <select {...register("status")} style={inputStyle}>
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="cancelled">cancelled</option>
              <option value="completed">completed</option>
            </select>
          </Field>
        </div>

        <Field label="Location" error={errors.location?.message}>
          <input {...register("location")} style={inputStyle} />
        </Field>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Start date/time" error={errors.date?.message} style={{ flex: 1 }}>
            <input type="datetime-local" {...register("date")} style={inputStyle} />
          </Field>

          <Field label="End date/time" error={errors.endDate?.message} style={{ flex: 1 }}>
            <input type="datetime-local" {...register("endDate")} style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <Field label="Max participants" error={errors.maxParticipants?.message} style={{ flex: 1 }}>
            <input type="number" {...register("maxParticipants")} style={inputStyle} />
          </Field>

          <Field label="Price" error={errors.price?.message} style={{ flex: 1 }}>
            <input type="number" step="0.01" {...register("price")} style={inputStyle} />
          </Field>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <input type="checkbox" {...register("isOutside")} />
          Outdoor event (show weather)
        </label>

        <button disabled={isSubmitting} style={{ marginTop: 16, padding: "10px 14px", cursor: "pointer" }}>
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, error, children, style }) {
  return (
    <div style={{ marginBottom: 10, ...style }}>
      <div style={{ marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {children}
      {error && <div style={{ color: "crimson", marginTop: 6 }}>{error}</div>}
    </div>
  );
}

const inputStyle = { width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" };

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
