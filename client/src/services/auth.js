import { api } from "./api";

export const authApi = {
  getToken() {
    return localStorage.getItem("token");
  },
  setToken(token) {
    localStorage.setItem("token", token);
  },
  clearToken() {
    localStorage.removeItem("token");
  },

  async login(email, password) {
    const { data } = await api.post("/api/auth/login", { email, password });
    // backend ти враќа { success, token, user }
    if (data?.token) this.setToken(data.token);
    return { token: data.token, user: data.user };
  },

  async register(name, email, password) {
    const { data } = await api.post("/api/auth/register", { name, email, password });
    if (data?.token) this.setToken(data.token);
    return { token: data.token, user: data.user };
  },

  async me() {
    const { data } = await api.get("/api/auth/me");
    // може да ти враќа { success, user }
    return data.user || data;
  }
};
