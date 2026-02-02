import { api } from "./api";

export const eventsApi = {
  async list(params = {}) {
    const { data } = await api.get("/api/events", { params });
    return data.data || data; // твојот backend враќа {success,count,data:[...]}
  },

  async get(id) {
    const { data } = await api.get(`/api/events/${id}`);
    return data.data || data;
  },

  async create(payload) {
    const { data } = await api.post("/api/events", payload);
    return data.data || data;
  },

  async update(id, payload) {
    const { data } = await api.put(`/api/events/${id}`, payload);
    return data.data || data;
  },

  async remove(id) {
    const { data } = await api.delete(`/api/events/${id}`);
    return data.data || data;
  }
};
