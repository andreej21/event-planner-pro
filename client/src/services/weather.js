import { api } from "./api";

export const weatherApi = {
  async getForecast(location, dateISO) {
    // очекуваме твоја рута: /api/weather?location=Skopje&date=2026-03-01T...
    const { data } = await api.get("/api/weather", {
      params: { location, date: dateISO }
    });
    return data.data || data;
  }
};
