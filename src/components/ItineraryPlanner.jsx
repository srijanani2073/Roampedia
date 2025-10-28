import React, { useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ItineraryPlanner.css";

// === Mock MongoDB-like attraction data ===
const MOCK_ATTRACTIONS = {
  France: [
    { name: "Eiffel Tower", city: "Paris", hours: 2, cost: 25 },
    { name: "Louvre Museum", city: "Paris", hours: 4, cost: 17 },
    { name: "Palace of Versailles", city: "Versailles", hours: 3, cost: 20 },
    { name: "Mont Saint-Michel", city: "Normandy", hours: 4, cost: 15 },
    { name: "Nice Old Town", city: "Nice", hours: 3, cost: 0 },
    { name: "Provence Lavender Fields", city: "Provence", hours: 3, cost: 0 },
  ],
  Italy: [
    { name: "Colosseum", city: "Rome", hours: 3, cost: 18 },
    { name: "Trevi Fountain", city: "Rome", hours: 1, cost: 0 },
    { name: "Venice Canals", city: "Venice", hours: 3, cost: 10 },
    { name: "Uffizi Gallery", city: "Florence", hours: 4, cost: 12 },
    { name: "Leaning Tower of Pisa", city: "Pisa", hours: 2, cost: 10 },
  ],
  Japan: [
    { name: "Tokyo Tower", city: "Tokyo", hours: 2, cost: 15 },
    { name: "Kyoto Fushimi Inari Shrine", city: "Kyoto", hours: 3, cost: 0 },
    { name: "Osaka Castle", city: "Osaka", hours: 3, cost: 10 },
    { name: "Mount Fuji", city: "Shizuoka", hours: 6, cost: 20 },
    { name: "Nara Deer Park", city: "Nara", hours: 2, cost: 5 },
  ],
};

const HOURS_PER_DAY = 8;

const COLORS = ["#06b6d4", "#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

export default function ItineraryPlanner() {
  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState("France");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState(2000);
  const [itinerary, setItinerary] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [loading, setLoading] = useState(false);
  const visualRef = useRef(null);

  const tripDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDate, endDate]);

  // === Generate itinerary from mock data ===
  const handleGenerate = () => {
    if (!destination || !startDate || !endDate || !budget)
      return alert("Please fill all fields");

    setLoading(true);
    setTimeout(() => {
      const attractions = MOCK_ATTRACTIONS[destination] || [];
      const days = Math.max(tripDays || 1, 1);
      const daysArr = Array.from({ length: days }, () => ({
        remaining: HOURS_PER_DAY,
        activities: [],
      }));

      const shuffled = [...attractions];
      for (const att of shuffled) {
        let assigned = false;
        for (const d of daysArr) {
          if (d.remaining >= att.hours) {
            d.activities.push(att);
            d.remaining -= att.hours;
            assigned = true;
            break;
          }
        }
        if (!assigned)
          daysArr[Math.floor(Math.random() * daysArr.length)].activities.push(att);
      }

      // simple expense breakdown
      const exp = {
        Accommodation: Math.round(budget * 0.4),
        Transport: Math.round(budget * 0.2),
        Food: Math.round(budget * 0.2),
        Activities: Math.round(budget * 0.15),
        Misc: Math.round(budget * 0.05),
      };

      setExpenses(exp);
      setItinerary(daysArr.map((d) => d.activities));
      setLoading(false);
    }, 600);
  };

  // === Charts ===
  const expenseData = Object.entries(expenses).map(([name, value]) => ({
    name,
    value,
  }));

  const perDayData = itinerary.map((d, i) => ({
    name: `Day ${i + 1}`,
    attractions: d.length,
  }));

  // === Export ===
  const exportCSV = () => {
    const rows = [
      ["Start Point", startPoint],
      ["Destination", destination],
      ["Start Date", startDate],
      ["End Date", endDate],
      ["Budget", budget],
      [],
    ];
    itinerary.forEach((day, i) => {
      rows.push([`Day ${i + 1}`]);
      day.forEach((a) => rows.push([a.name, a.city, a.hours, a.cost]));
      rows.push([]);
    });
    rows.push(["Expenses"]);
    Object.entries(expenses).forEach(([k, v]) => rows.push([k, v]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${destination}_itinerary.csv`;
    a.click();
  };

  const exportPDF = async () => {
    if (!visualRef.current) return;
    const canvas = await html2canvas(visualRef.current, { scale: 2 });
    const pdf = new jsPDF("p", "pt", "a4");
    const img = canvas.toDataURL("image/png");
    const width = pdf.internal.pageSize.getWidth() - 40;
    const props = pdf.getImageProperties(img);
    const height = (props.height * width) / props.width;
    pdf.addImage(img, "PNG", 20, 20, width, height);
    pdf.save(`${destination}_itinerary.pdf`);
  };

  return (
    <div className="itinerary-planner">
      <div className="form-section">
        <h2>Itinerary Planner</h2>

        <label>Start Point</label>
        <input
          value={startPoint}
          onChange={(e) => setStartPoint(e.target.value)}
          placeholder="Enter city or address"
        />

        <label>Destination</label>
        <select value={destination} onChange={(e) => setDestination(e.target.value)}>
          {Object.keys(MOCK_ATTRACTIONS).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="row">
          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <label>Budget (USD)</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />

        <button className="generate" onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>

        {itinerary.length > 0 && (
          <div className="export-buttons">
            <button onClick={exportCSV}>Download CSV</button>
            <button onClick={exportPDF}>Download PDF</button>
          </div>
        )}
      </div>

      <div className="output-section" ref={visualRef}>
        {itinerary.length === 0 ? (
          <p className="muted">Fill the form and click Generate.</p>
        ) : (
          <>
            <div className="trip-summary">
              <h3>
                {destination} Trip Plan ({tripDays} days)
              </h3>
              <p>
                {startDate} → {endDate}
              </p>
              <p>Total Budget: ${budget}</p>
            </div>

            <div className="day-plan">
              {itinerary.map((day, i) => (
                <div key={i} className="day-card">
                  <h4>Day {i + 1}</h4>
                  <ul>
                    {day.map((a, j) => (
                      <li key={j}>
                        <strong>{a.name}</strong> ({a.city}) — {a.hours} h — $
                        {a.cost}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="charts">
              <div className="chart-box">
                <h4>Expense Breakdown</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="value"
                      outerRadius={80}
                      label
                    >
                      {expenseData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-box">
                <h4>Attractions per Day</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={perDayData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="attractions" fill="#06b6d4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
