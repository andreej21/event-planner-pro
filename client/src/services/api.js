import axios from "axios";

export const api = axios.create({
  baseURL: "", // Vite proxy ќе ги рутира /api -> http://localhost:5000
  withCredentials: false,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Пример: ако token е невалиден
    if (err?.response?.status === 401) {
      // optional auto-logout:
      // localStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

export function getErrorMessage(err) {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Unknown error"
  );
}
