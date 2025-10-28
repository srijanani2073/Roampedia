// 📁 src/components/TravelInsights.jsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const TravelInsights = () => {
  // --- Dummy data (replace later with real analytics)
  const visitedByRegion = [
    { region: "Asia", count: 12 },
    { region: "Europe", count: 8 },
    { region: "Africa", count: 4 },
    { region: "Americas", count: 7 },
    { region: "Oceania", count: 2 },
  ];

  const wishlistByPriority = [
    { name: "High", value: 5 },
    { name: "Medium", value: 8 },
    { name: "Low", value: 3 },
  ];

  const visitsPerYear = [
    { year: 2021, count: 5 },
    { year: 2022, count: 7 },
    { year: 2023, count: 9 },
    { year: 2024, count: 6 },
    { year: 2025, count: 4 },
  ];

  const COLORS = ["#4C9AFF", "#FFB347", "#7AE582"];

  return (
    <div className="travel-insights-container">
      <h2 className="insights-title">Travel Insights</h2>

      <div className="charts-grid">
        {/* 🌏 Visited by Region (Bar) */}
        <div className="chart-card">
          <h3>Visited by Region</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={visitedByRegion}>
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4C9AFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ⭐ Wishlist by Priority (Pie) */}
        <div className="chart-card">
          <h3>Wishlist by Priority</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={wishlistByPriority}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {wishlistByPriority.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 📈 Visits per Year (Line) */}
        <div className="chart-card">
          <h3>Visits per Year</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={visitsPerYear}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#FF8042" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📄 Generate Report Button */}
      <div className="report-section">
        <button
          className="generate-report-btn"
          onClick={() => alert("Report generation coming soon!")}
        >
          Generate Travel Summary Report
        </button>
      </div>
    </div>
  );
};

export default TravelInsights;
