import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../utils/validators";
import { useAuth } from "../app/useAuth";
import { getErrorMessage } from "../services/api";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  async function onSubmit(values) {
    setServerError("");
    try {
      await login(values.email, values.password);
      nav("/events");
    } catch (e) {
      setServerError(getErrorMessage(e));
    }
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Login</h2>

      {serverError && (
        <div style={{ background: "#ffecec", padding: 10, borderRadius: 8, marginBottom: 10 }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
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
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        No account? <Link to="/register">Register</Link>
      </p>

      <p style={{ marginTop: 12, fontSize: 13, opacity: 0.8 }}>
        Seed users: admin@example.com / password123
      </p>
    </div>
  );
}
