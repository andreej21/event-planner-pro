import { api } from "./api";

export const commentsApi = {
  async list(eventId) {
    const { data } = await api.get(`/api/events/${eventId}/comments`);
    return data.data || [];
  },
  async create(eventId, content) {
    const { data } = await api.post(`/api/events/${eventId}/comments`, { content });
    return data.data;
  },
  async remove(commentId) {
    const { data } = await api.delete(`/api/comments/${commentId}`);
    return data;
  }
};
