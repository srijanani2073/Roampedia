import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./ItineraryDashboard.css";
import ExpensesTable from "./ExpensesTable";

/*
Frontend-only Travel Dashboard
- Editable fields
- Local persistence via localStorage
- Donut chart for expense breakdown
- Horizontal bars comparing Budget vs Actual
- CSV and PDF export
- Countdown to start date
Dependencies:
  npm install recharts html2canvas jspdf
*/

const STORAGE_KEY = "roampedia_travel_dashboard_v1";

const DEFAULT_STATE = {
  title: "My Travel Plan",
  destination: "Thailand",
  today: new Date().toISOString().slice(0, 10),
  startDate: "",
  endDate: "",
  travellers: { adults: 2, children: 0, pets: 0 },
  currency: { from: "USD", to: "THB", rate: 38.0 },
  tasks: {
    whenYouBook: 6,
    oneDayBefore: 6,
    toDo: 15,
    oneWeekBefore: 8,
    departureDay: 6,
    leftToPay: 970,
  },
  expenses: [
    { category: "Flights", budget: 600, actual: 380 },
    { category: "Accommodation", budget: 345, actual: 225 },
    { category: "Activities", budget: 565, actual: 385 },
    { category: "Restaurants", budget: 165, actual: 305 },
    { category: "Car rental", budget: 120, actual: 350 },
    { category: "Vaccinations", budget: 320, actual: 120 },
    { category: "Food", budget: 200, actual: 75 },
    { category: "Other", budget: 100, actual: 120 },
  ],
};

const COLORS = [
  "#2c7a7b",
  "#48bb78",
  "#38bdf8",
  "#4f46e5",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
];

export default function ItineraryModule() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_STATE;
    } catch (e) {
      return DEFAULT_STATE;
    }
  });

  const visualRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // derived values
  const totalBudget = useMemo(
    () => state.expenses.reduce((s, e) => s + Number(e.budget || 0), 0),
    [state.expenses]
  );
  const totalActual = useMemo(
    () => state.expenses.reduce((s, e) => s + Number(e.actual || 0), 0),
    [state.expenses]
  );

  const daysLeft = useMemo(() => {
    if (!state.startDate) return null;
    const today = new Date(state.today);
    const start = new Date(state.startDate);
    const diff = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  }, [state.startDate, state.today]);

  const nights = useMemo(() => {
    if (!state.startDate || !state.endDate) return null;
    const s = new Date(state.startDate);
    const e = new Date(state.endDate);
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [state.startDate, state.endDate]);

  // pie chart data
  const pieData = state.expenses.map((e) => ({
    name: e.category,
    value: Number(e.actual || e.budget || 0),
  }));

  // handlers
  const updateField = (path, value) =>
    setState((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let cur = copy;
      keys.forEach((k, i) => {
        if (i === keys.length - 1) cur[k] = value;
        else cur = cur[k];
      });
      return copy;
    });

  const updateExpense = (index, field, value) =>
    setState((prev) => {
      const copy = { ...prev, expenses: prev.expenses.map((e) => ({ ...e })) };
      copy.expenses[index][field] = value;
      return copy;
    });

  const addExpenseRow = () =>
    setState((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { category: "New", budget: 0, actual: 0 }],
    }));

  const removeExpenseRow = (i) =>
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((_, idx) => idx !== i),
    }));

  const resetDemo = () => {
    setState((s) => ({ ...DEFAULT_STATE, today: s.today }));
  };

  // export CSV
  const exportCSV = () => {
    const rows = [];
    rows.push(["Title", state.title]);
    rows.push(["Destination", state.destination]);
    rows.push(["Start Date", state.startDate || ""]);
    rows.push(["End Date", state.endDate || ""]);
    rows.push(["Nights", nights ?? ""]);
    rows.push([]);
    rows.push(["Category", "Budget", "Actual", "Difference"]);
    state.expenses.forEach((e) =>
      rows.push([e.category, e.budget, e.actual, (e.budget || 0) - (e.actual || 0)])
    );
    rows.push([]);
    rows.push(["Total Budget", totalBudget]);
    rows.push(["Total Actual", totalActual]);
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(state.title || "itinerary").replace(/\s+/g, "_")}.csv`;
    a.click();
  };

  // export PDF (snapshot of visualRef)
  const exportPDF = async () => {
    if (!visualRef.current) return;
    try {
      const canvas = await html2canvas(visualRef.current, { scale: 2, useCORS: true });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "pt", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      // fit width
      const imgProps = pdf.getImageProperties(img);
      const imgW = pageW - 40;
      const imgH = (imgProps.height * imgW) / imgProps.width;
      pdf.addImage(img, "PNG", 20, 20, imgW, imgH);
      pdf.save(`${(state.title || "travel_dashboard").replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
      alert("Could not generate PDF (see console).");
    }
  };

  return (
    <div className="travel-dashboard">
      <div className="dashboard-top">
        <div className="hero">
          <div className="hero-left">
            <h1 contentEditable suppressContentEditableWarning onBlur={(e) => updateField("title", e.target.textContent)}>
              {state.title}
            </h1>
            <p className="destination">
              <label>Destination: </label>
              <input value={state.destination} onChange={(e) => updateField("destination", e.target.value)} />
            </p>
          </div>
          <div className="hero-right">
            <div className="today">
              <div>TODAY'S DATE:</div>
              <div className="bold">{state.today}</div>
            </div>
            <div className="countdown">
              <div>TRIP COUNTDOWN:</div>
              <div className="bold">{daysLeft != null ? `${daysLeft} DAYS LEFT` : "--"}</div>
            </div>
            <div className="actions">
              <button onClick={resetDemo}>Reset Demo</button>
              <button onClick={exportCSV}>Export CSV</button>
              <button onClick={exportPDF}>Export PDF</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" ref={visualRef}>
        {/* Left column */}
        <div className="col left-col">
          <section className="card trip-details">
            <h3>TRIP DETAILS</h3>
            <div className="row">
              <label>Start Date</label>
              <input type="date" value={state.startDate} onChange={(e) => updateField("startDate", e.target.value)} />
            </div>
            <div className="row">
              <label>End Date</label>
              <input type="date" value={state.endDate} onChange={(e) => updateField("endDate", e.target.value)} />
            </div>
            <div className="row">
              <label>No. of Nights</label>
              <input type="number" value={nights ?? ""} readOnly />
            </div>
          </section>

          <section className="card travellers">
            <h3>TRAVELLERS</h3>
            <div className="row small">
              <label>Adults</label>
              <input type="number" value={state.travellers.adults} min="0" onChange={(e) => updateField("travellers.adults", Number(e.target.value))} />
            </div>
            <div className="row small">
              <label>Children</label>
              <input type="number" value={state.travellers.children} min="0" onChange={(e) => updateField("travellers.children", Number(e.target.value))} />
            </div>
            <div className="row small">
              <label>Pets</label>
              <input type="number" value={state.travellers.pets} min="0" onChange={(e) => updateField("travellers.pets", Number(e.target.value))} />
            </div>
            <div className="currency">
              <label>Currency Conv.</label>
              <div className="cc-row">
                <input value={state.currency.from} onChange={(e) => updateField("currency.from", e.target.value)} />
                <span>→</span>
                <input value={state.currency.to} onChange={(e) => updateField("currency.to", e.target.value)} />
                <input type="number" value={state.currency.rate} onChange={(e) => updateField("currency.rate", Number(e.target.value))} />
              </div>
            </div>
          </section>

          <section className="card tasks">
            <h3>TASKS LEFT TO DO</h3>
            <div className="task-grid">
              <div className="task-row"><div>WHEN YOU BOOK</div><div>{state.tasks.whenYouBook}</div></div>
              <div className="task-row"><div>ONE DAY BEFORE</div><div>{state.tasks.oneDayBefore}</div></div>
              <div className="task-row"><div>TO DO</div><div>{state.tasks.toDo}</div></div>
              <div className="task-row"><div>ONE WEEK BEFORE</div><div>{state.tasks.oneWeekBefore}</div></div>
              <div className="task-row"><div>DEPARTURE DAY</div><div>{state.tasks.departureDay}</div></div>
              <div className="task-row"><div>LEFT TO PAY</div><div>{state.tasks.leftToPay}</div></div>
            </div>
          </section>
        </div>

        {/* Middle column (charts) */}
        <div className="col mid-col">
          <section className="card expenses-pie">
            <h3>EXPENSES BREAKDOWN</h3>
            <div className="pie-area">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="legend">
                {state.expenses.map((e, i) => (
                  <div key={e.category} className="legend-row">
                    <span className="swatch" style={{ background: COLORS[i % COLORS.length] }} />
                    <div>
                      <div className="cat">{e.category}</div>
                      <div className="meta">Budget: {e.budget} • Actual: {e.actual}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="card budget-bars">
            <h3>TRIP BUDGET</h3>
            <div className="bars-area">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart layout="vertical" data={state.expenses} margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="budget" barSize={12} radius={[6, 6, 6, 6]} />
                  <Bar dataKey="actual" barSize={8} radius={[6, 6, 6, 6]} fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>

              <div className="totals">
                <div><strong>BUDGET</strong><div className="big">{totalBudget}</div></div>
                <div><strong>ACTUAL</strong><div className="big">{totalActual}</div></div>
                <div><strong>DIFFERENCE</strong><div className="big">{totalBudget - totalActual}</div></div>
              </div>
            </div>
          </section>
        </div>

        {/* Right column (table & edit) */}
        <div className="col right-col">
            <ExpensesTable />
          <section className="card notes">
            <h3>NOTES</h3>
            <textarea value={state.notes || ""} onChange={(e) => updateField("notes", e.target.value)} placeholder="Trip notes..." />
          </section>
        </div>
      </div>
    </div>
  );
}
