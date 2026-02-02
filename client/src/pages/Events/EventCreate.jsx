import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "../../utils/validators";
import { eventsApi } from "../../services/events";
import { getErrorMessage } from "../../services/api";

export default function EventCreate() {
  const nav = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "other",
      location: "",
      date: "",
      endDate: "",
      maxParticipants: 50,
      price: 0,
      isOutside: false,
      status: "draft"
    }
  });

  async function onSubmit(values) {
    setServerError("");
    try {
      const payload = {
        ...values,
        date: new Date(values.date).toISOString(),
        endDate: new Date(values.endDate).toISOString()
      };
      const created = await eventsApi.create(payload);
      nav(`/events/${created._id}`);
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  }

  const isOutside = watch("isOutside");

  return (
    <div style={{ maxWidth: 700 }}>
      <Link to="/events">← Back</Link>
      <h2>Create Event</h2>

      {serverError && (
        <div style={{ background: "#ffecec", padding: 10, borderRadius: 8, marginBottom: 10 }}>
          {serverError}
        </div>
      )}

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

        {isOutside && (
          <div style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>
            Weather forecast will be shown in details page using your backend.
          </div>
        )}

        <button disabled={isSubmitting} style={{ marginTop: 16, padding: "10px 14px", cursor: "pointer" }}>
          {isSubmitting ? "Saving..." : "Create"}
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
