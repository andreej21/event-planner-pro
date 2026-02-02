import { api } from "./api";

export const registrationsApi = {
  async participate(eventId) {
    const { data } = await api.post(`/api/events/${eventId}/registrations`);
    return data.data;
  },
  async myStatus(eventId) {
    const { data } = await api.get(`/api/events/${eventId}/registrations/me`);
    return data.data; // reg or null
  },
  async cancel(eventId) {
    const { data } = await api.delete(`/api/events/${eventId}/registrations/me`);
    return data;
  }
};
