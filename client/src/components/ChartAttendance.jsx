import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ChartAttendance({ events = [] }) {
  const chartData = useMemo(() => {
    const labels = events.map((e) => e.title);
    const values = events.map((e) => e.currentParticipants ?? 0);

    return {
      labels,
      datasets: [
        {
          label: "Participants",
          data: values
        }
      ]
    };
  }, [events]);

  const options = {
    responsive: true,
    plugins: { legend: { display: true } }
  };

  if (!events.length) return null;

  return (
    <div style={{ marginTop: 18, border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Attendance Chart</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
}
