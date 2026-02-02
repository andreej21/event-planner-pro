import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../utils/validators";
import { useAuth } from "../app/useAuth";
import { getErrorMessage } from "../services/api";

export default function Register() {
  const nav = useNavigate();
  const { register: doRegister } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" }
  });

  async function onSubmit(values) {
    setServerError("");
    try {
      await doRegister(values.name, values.email, values.password);
      nav("/events");
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Register</h2>

      {serverError && (
        <div style={{ background: "#ffecec", padding: 10, borderRadius: 8, marginBottom: 10 }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: 10 }}>
          <label>Name</label>
          <input {...register("name")} style={{ width: "100%", padding: 8 }} />
          {errors.name && <div style={{ color: "crimson" }}>{errors.name.message}</div>}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input {...register("email")} style={{ width: "100%", padding: 8 }} />
          {errors.email && <div style={{ color: "crimson" }}>{errors.email.message}</div>}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input type="password" {...register("password")} style={{ width: "100%", padding: 8 }} />
          {errors.password && <div style={{ color: "crimson" }}>{errors.password.message}</div>}
        </div>

        <button disabled={isSubmitting} style={{ padding: "10px 14px", cursor: "pointer" }}>
          {isSubmitting ? "Creating..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
