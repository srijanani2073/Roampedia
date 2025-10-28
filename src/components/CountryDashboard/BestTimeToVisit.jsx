import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

export default function BestTimeToVisit({ latitude, longitude, countryName }) {
  const [climate, setClimate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClimateData(lat, lon) {
      try {
        const startYear = 2023;
        const startDate = `${startYear}-01-01`;
        const endDate = `${startYear}-12-31`;
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        setClimate(data);
      } catch (err) {
        console.error("Error fetching climate data:", err);
        setError("Unable to load climate information.");
      }
    }

    if (latitude && longitude) fetchClimateData(latitude, longitude);
  }, [latitude, longitude]);

  if (error) {
    return (
      <div className="card best-time-card">
        <div className="card-header">🌤️ Best Time to Visit</div>
        <div className="card-body">{error}</div>
      </div>
    );
  }

  if (!climate) {
    return (
      <div className="card best-time-card">
        <div className="card-header">🌤️ Best Time to Visit</div>
        <div className="card-body">Loading climate data...</div>
      </div>
    );
  }

  // ✅ Process daily data into monthly averages
  const { daily } = climate;
  const avgPerMonth = Array(12).fill(0);
  const rainPerMonth = Array(12).fill(0);
  const daysPerMonth = Array(12).fill(0);

  daily.time.forEach((dateStr, i) => {
    const month = new Date(dateStr).getMonth();
    const avgTemp = (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2;
    avgPerMonth[month] += avgTemp;
    rainPerMonth[month] += daily.precipitation_sum[i];
    daysPerMonth[month] += 1;
  });

  const avgTemps = avgPerMonth.map((sum, i) =>
    daysPerMonth[i] ? sum / daysPerMonth[i] : null
  );

  const labels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Avg Temperature (°C)",
        data: avgTemps,
        borderColor: "#ff6b6b",
        backgroundColor: "rgba(255, 107, 107, 0.2)",
        yAxisID: "y1",
        tension: 0.4,
      },
      {
        label: "Total Rainfall (mm)",
        data: rainPerMonth,
        borderColor: "#1e90ff",
        backgroundColor: "rgba(30, 144, 255, 0.2)",
        yAxisID: "y2",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    stacked: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: { enabled: true },
    },
    scales: {
      y1: {
        type: "linear",
        position: "left",
        title: { display: true, text: "Temperature (°C)" },
      },
      y2: {
        type: "linear",
        position: "right",
        title: { display: true, text: "Rainfall (mm)" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="card best-time-card">
      <div className="card-header">
        🌤️ Best Time to Visit {countryName ? `— ${countryName}` : ""}
      </div>
      <div className="card-body">
        <p className="summary-text">
          This chart shows average monthly temperature and rainfall trends.
          Lower rainfall and moderate temperatures usually indicate the best months to visit.
        </p>

        <div className="chart-container">
          <Line data={chartData} options={chartOptions} />
        </div>

        <p className="note">
          (Data sourced from Open-Meteo Historical Weather API)
        </p>
      </div>
    </div>
  );
}
