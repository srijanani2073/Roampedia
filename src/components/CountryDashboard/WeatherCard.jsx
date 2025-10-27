import React from "react";

/**
 * Props:
 * - weather: open-meteo forecast object
 * - capital: string
 */
export default function WeatherCard({ weather, capital }) {
  if (!weather || !weather.current_weather) {
    return (
      <div className="card">
        <div className="card-header">Weather — {capital || "Capital"}</div>
        <div className="card-body">No weather information available</div>
      </div>
    );
  }

  const cur = weather.current_weather;
  // Open-Meteo daily arrays (if present) - we provide a simple 3-day approximation if available
  const dailyMax = weather.daily?.temperature_2m_max || [];
  const dailyMin = weather.daily?.temperature_2m_min || [];
  const dailyDates = weather.daily?.time || [];

  return (
    <div className="card">
      <div className="card-header">Weather — {capital}</div>
      <div className="card-body">
        <div className="weather-top">
          <div className="temp">{Math.round(cur.temperature)}°C</div>
          <div className="weather-desc">
            <div style={{ fontSize: 14 }}>{cur.weathercode != null ? `Code ${cur.weathercode}` : "Weather"}</div>
            <div className="muted small">Wind: {cur.windspeed} m/s • Dir: {cur.winddirection}°</div>
          </div>
        </div>

        <div className="weather-meta">
          <div>UTC Time: {cur.time}</div>
        </div>

        <div className="forecast-row">
          {dailyDates && dailyDates.slice(1,4).map((d, i) => (
            <div className="forecast-cell" key={i}>
              <div className="f-date">{new Date(d).toLocaleDateString()}</div>
              <div className="f-temp">{dailyMax[i+1] ? `${Math.round(dailyMax[i+1])}° / ${Math.round(dailyMin[i+1])}°` : "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
