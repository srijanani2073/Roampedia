// import React, { useEffect, useState, useRef } from "react";
// import axios from "axios";
// import { v4 as uuidv4 } from "uuid";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Cell,
// } from "recharts";
// import "./ItineraryModule.css";

// /*
//   Usage:
//     <ItineraryModule user={user} />
//   where `user` is the logged-in user object containing an `email` field (or id).
//   API base URL: set REACT_APP_API_BASE in your .env or it will default to http://localhost:5000
// */

// const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000/api";

// const defaultExample = [
//   {
//     id: uuidv4(),
//     name: "Paris",
//     days: 2,
//     notes: "Eiffel, Louvre",
//     activities: [{ id: uuidv4(), title: "Louvre visit", time: "10:00" }],
//   },
//   {
//     id: uuidv4(),
//     name: "Nice",
//     days: 2,
//     notes: "Promenade des Anglais",
//     activities: [{ id: uuidv4(), title: "Beach", time: "14:00" }],
//   },
// ];

// export default function ItineraryModule({ user }) {
//   const [tripName, setTripName] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [travellers, setTravellers] = useState(1);
//   const [preferences, setPreferences] = useState("");
//   const [destinations, setDestinations] = useState(defaultExample);
//   const [savedList, setSavedList] = useState([]);
//   const [activeId, setActiveId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const visualRef = useRef(null);

//   // compute total days from destinations or dates if provided
//   const computedTotalDays = destinations.reduce((acc, d) => acc + Number(d.days || 0), 0);

//   useEffect(() => {
//     if (user?.email) fetchSaved();
//     // eslint-disable-next-line
//   }, [user]);

//   // --------- CRUD with backend (Mongo) ----------
//   async function fetchSaved() {
//     try {
//       setLoading(true);
//       const res = await axios.get(`${API_BASE}/itineraries`, {
//         params: { user: user.email },
//       });
//       setSavedList(res.data || []);
//     } catch (err) {
//       console.error("Error fetching itineraries", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function saveItinerary() {
//     if (!user?.email) return alert("Please sign in to save itineraries.");
//     if (!tripName) return alert("Please provide a trip name.");

//     const payload = {
//       user: user.email,
//       tripName,
//       startDate,
//       endDate,
//       travellers,
//       preferences,
//       destinations,
//       totalDays: computedTotalDays,
//     };

//     try {
//       setLoading(true);
//       if (activeId) {
//         await axios.put(`${API_BASE}/itineraries/${activeId}`, payload);
//         alert("Itinerary updated.");
//       } else {
//         await axios.post(`${API_BASE}/itineraries`, payload);
//         alert("Itinerary saved.");
//       }
//       await fetchSaved();
//     } catch (err) {
//       console.error("Save error", err);
//       alert("Error saving itinerary.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function deleteItinerary(id) {
//     if (!confirm("Delete this itinerary?")) return;
//     try {
//       await axios.delete(`${API_BASE}/itineraries/${id}`);
//       if (activeId === id) {
//         clearForm();
//       }
//       await fetchSaved();
//     } catch (err) {
//       console.error("Delete error", err);
//       alert("Error deleting itinerary.");
//     }
//   }

//   function loadItinerary(it) {
//     setActiveId(it._id);
//     setTripName(it.tripName || "");
//     setStartDate(it.startDate || "");
//     setEndDate(it.endDate || "");
//     setTravellers(it.travellers || 1);
//     setPreferences(it.preferences || "");
//     setDestinations(it.destinations || []);
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }

//   function clearForm() {
//     setActiveId(null);
//     setTripName("");
//     setStartDate("");
//     setEndDate("");
//     setTravellers(1);
//     setPreferences("");
//     setDestinations(defaultExample);
//   }

//   // ---------- Destinations & Activities helpers ----------
//   function addDestination() {
//     setDestinations((s) => [...s, { id: uuidv4(), name: "", days: 1, notes: "", activities: [] }]);
//   }

//   function updateDestination(id, patch) {
//     setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
//   }

//   function removeDestination(id) {
//     setDestinations((prev) => prev.filter((d) => d.id !== id));
//   }

//   function addActivity(destId) {
//     updateDestination(destId, {
//       activities: [...(destinations.find((d) => d.id === destId).activities || []), { id: uuidv4(), title: "", time: "" }],
//     });
//   }

//   function updateActivity(destId, actId, patch) {
//     setDestinations((prev) =>
//       prev.map((d) =>
//         d.id !== destId
//           ? d
//           : { ...d, activities: d.activities.map((a) => (a.id === actId ? { ...a, ...patch } : a)) }
//       )
//     );
//   }

//   function removeActivity(destId, actId) {
//     updateDestination(destId, {
//       activities: destinations.find((d) => d.id === destId).activities.filter((a) => a.id !== actId),
//     });
//   }

//   // ---------- Export CSV & PDF ----------
//   function downloadCSV() {
//     const rows = [
//       ["Trip Name", tripName || ""],
//       ["Start Date", startDate || ""],
//       ["End Date", endDate || ""],
//       ["Travellers", travellers],
//       ["Preferences", preferences || ""],
//       [],
//       ["Destination", "Days", "Notes", "Activity Title", "Activity Time"],
//     ];
//     destinations.forEach((d) => {
//       if (!d.activities || d.activities.length === 0) {
//         rows.push([d.name, d.days, d.notes || "", "", ""]);
//       } else {
//         d.activities.forEach((a, i) => {
//           rows.push([i === 0 ? d.name : "", i === 0 ? d.days : "", i === 0 ? d.notes || "" : "", a.title || "", a.time || ""]);
//         });
//       }
//     });

//     const csvContent = rows.map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `${(tripName || "itinerary").replace(/\s+/g, "_")}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//   }

//   async function downloadPDF() {
//     if (!visualRef.current) return alert("Visual area not ready.");
//     try {
//       const canvas = await html2canvas(visualRef.current, { scale: 2, useCORS: true });
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF("p", "pt", "a4");
//       pdf.setFontSize(18);
//       pdf.text(tripName || "Itinerary Report", 40, 40);
//       pdf.setFontSize(11);
//       pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);
//       const pageWidth = pdf.internal.pageSize.getWidth();
//       const maxImgWidth = pageWidth - 80;
//       const imgProps = pdf.getImageProperties(imgData);
//       const imgHeight = (imgProps.height * maxImgWidth) / imgProps.width;
//       pdf.addImage(imgData, "PNG", 40, 80, maxImgWidth, imgHeight);
//       pdf.save(`${(tripName || "itinerary").replace(/\s+/g, "_")}.pdf`);
//     } catch (err) {
//       console.error("PDF error", err);
//       alert("Could not generate PDF (see console).");
//     }
//   }

//   // ---------- Chart data ----------
//   const chartData = destinations.map((d) => ({ name: d.name || "Untitled", days: Number(d.days || 0) }));
//   const colors = ["#4f46e5", "#06b6d4", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

//   return (
//     <div className="itinerary-module">
//       <div className="left-panel">
//         <header className="im-header">
//           <h2>Itinerary Planner (Manual)</h2>
//           <div className="meta-row">
//             <input placeholder="Trip name" value={tripName} onChange={(e) => setTripName(e.target.value)} />
//             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
//             <input type="number" min="1" value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} title="Travellers" />
//           </div>
//           <textarea placeholder="Preferences (e.g. museums, beaches, food)" value={preferences} onChange={(e) => setPreferences(e.target.value)} />
//         </header>

//         <div className="controls-row">
//           <button onClick={addDestination}>+ Add Destination</button>
//           <button onClick={() => { setDestinations(defaultExample); }}>Load Example</button>
//           <button onClick={clearForm}>Reset</button>
//         </div>

//         <div className="dest-list">
//           {destinations.map((d, idx) => (
//             <div className="dest-card" key={d.id}>
//               <div className="dest-card-top">
//                 <input className="dest-name" value={d.name} onChange={(e) => updateDestination(d.id, { name: e.target.value })} placeholder={`Destination #${idx + 1}`} />
//                 <div className="dest-days-control">
//                   <label>Days</label>
//                   <input type="number" min="0" value={d.days} onChange={(e) => updateDestination(d.id, { days: Number(e.target.value) })} />
//                 </div>
//                 <button className="small del" onClick={() => removeDestination(d.id)}>Delete</button>
//               </div>

//               <textarea className="dest-notes" placeholder="Notes / hotels / tips" value={d.notes} onChange={(e) => updateDestination(d.id, { notes: e.target.value })} />

//               <div className="activities">
//                 <h4>Activities</h4>
//                 {(d.activities || []).map((a) => (
//                   <div className="activity-row" key={a.id}>
//                     <input placeholder="Title" value={a.title} onChange={(e) => updateActivity(d.id, a.id, { title: e.target.value })} />
//                     <input type="time" value={a.time} onChange={(e) => updateActivity(d.id, a.id, { time: e.target.value })} />
//                     <button className="small del" onClick={() => removeActivity(d.id, a.id)}>✖</button>
//                   </div>
//                 ))}
//                 <button className="add-act" onClick={() => addActivity(d.id)}>+ Add Activity</button>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="actions">
//           <button onClick={saveItinerary} disabled={loading}>{activeId ? "Update & Save" : "Save Itinerary"}</button>
//           <button onClick={downloadCSV}>Download CSV</button>
//           <button onClick={downloadPDF}>Download PDF</button>
//         </div>

//         <div className="saved-section">
//           <h3>Saved itineraries</h3>
//           {loading ? <p>Loading...</p> : savedList.length === 0 ? <p>No saved itineraries.</p> : (
//             <div className="saved-list">
//               {savedList.map((s) => (
//                 <div key={s._id} className={`saved-row ${activeId === s._id ? "active" : ""}`}>
//                   <div className="saved-meta" onClick={() => loadItinerary(s)}>
//                     <strong>{s.tripName}</strong>
//                     <small className="muted">{new Date(s.createdAt).toLocaleString()}</small>
//                   </div>
//                   <div className="saved-actions">
//                     <button onClick={() => loadItinerary(s)}>Load</button>
//                     <button className="small del" onClick={() => deleteItinerary(s._id)}>Delete</button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="right-panel" ref={visualRef}>
//         <div className="summary">
//           <h3>{tripName || "Untitled Trip"}</h3>
//           <p>{startDate || "—"} → {endDate || "—"}</p>
//           <p>Destinations: <strong>{destinations.length}</strong> • Total days: <strong>{computedTotalDays}</strong></p>
//           <p>Travellers: <strong>{travellers}</strong></p>
//           {preferences && <p>Preferences: {preferences}</p>}
//         </div>

//         <div className="chart">
//           <h4>Days per Destination</h4>
//           <div style={{ width: "100%", height: 260 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 40 }}>
//                 <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={60} />
//                 <YAxis allowDecimals={false} />
//                 <Tooltip />
//                 <Bar dataKey="days">
//                   {chartData.map((_, i) => (
//                     <Cell key={`c-${i}`} fill={colors[i % colors.length]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="timeline">
//           <h4>Simple Timeline</h4>
//           <div className="timeline-bar">
//             {(() => {
//               const total = Math.max(computedTotalDays, 1);
//               return destinations.map((d, i) => {
//                 const percent = Math.round((d.days / total) * 100) || 1;
//                 return (
//                   <div key={d.id} className="timeline-segment" style={{ width: `${percent}%`, backgroundColor: colors[i % colors.length] }}>
//                     <span className="timeline-text">{d.name} ({d.days})</span>
//                   </div>
//                 );
//               });
//             })()}
//           </div>
//         </div>

//         <div className="preview-list">
//           <h4>Day-by-day Preview</h4>
//           {destinations.map((d, idx) => (
//             <div key={d.id} className="preview-item">
//               <div className="preview-header">
//                 <strong>{idx + 1}. {d.name}</strong>
//                 <span className="muted">{d.days} day{d.days > 1 ? "s" : ""}</span>
//               </div>
//               {d.notes && <div className="muted small">{d.notes}</div>}
//               {d.activities && d.activities.length > 0 && (
//                 <ul className="acts">
//                   {d.activities.map((a) => <li key={a.id}>{a.time ? `${a.time} — ` : ""}{a.title}</li>)}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import "./ItineraryModule.css";

/* 
  ✅ FRONTEND-ONLY VERSION
  No backend or MongoDB calls.
  Everything runs in local state.
*/

const defaultExample = [
  {
    id: uuidv4(),
    name: "Paris",
    days: 2,
    notes: "Eiffel Tower, Louvre, Seine River Cruise",
    activities: [{ id: uuidv4(), title: "Louvre visit", time: "10:00" }],
  },
  {
    id: uuidv4(),
    name: "Nice",
    days: 2,
    notes: "Promenade des Anglais, Beach and Old Town",
    activities: [{ id: uuidv4(), title: "Beach", time: "14:00" }],
  },
];

export default function ItineraryModule() {
  const [tripName, setTripName] = useState("European Getaway");
  const [startDate, setStartDate] = useState("2025-11-01");
  const [endDate, setEndDate] = useState("2025-11-05");
  const [travellers, setTravellers] = useState(2);
  const [preferences, setPreferences] = useState("Museums, Beaches, Cafés");
  const [destinations, setDestinations] = useState(defaultExample);
  const visualRef = useRef(null);

  const computedTotalDays = destinations.reduce(
    (acc, d) => acc + Number(d.days || 0),
    0
  );

  // ---------- Destination & Activity Management ----------
  const addDestination = () => {
    setDestinations((prev) => [
      ...prev,
      { id: uuidv4(), name: "", days: 1, notes: "", activities: [] },
    ]);
  };

  const updateDestination = (id, patch) => {
    setDestinations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
    );
  };

  const removeDestination = (id) => {
    setDestinations((prev) => prev.filter((d) => d.id !== id));
  };

  const addActivity = (destId) => {
    setDestinations((prev) =>
      prev.map((d) =>
        d.id === destId
          ? {
              ...d,
              activities: [
                ...(d.activities || []),
                { id: uuidv4(), title: "", time: "" },
              ],
            }
          : d
      )
    );
  };

  const updateActivity = (destId, actId, patch) => {
    setDestinations((prev) =>
      prev.map((d) =>
        d.id === destId
          ? {
              ...d,
              activities: d.activities.map((a) =>
                a.id === actId ? { ...a, ...patch } : a
              ),
            }
          : d
      )
    );
  };

  const removeActivity = (destId, actId) => {
    setDestinations((prev) =>
      prev.map((d) =>
        d.id === destId
          ? {
              ...d,
              activities: d.activities.filter((a) => a.id !== actId),
            }
          : d
      )
    );
  };

  // ---------- Export: CSV & PDF ----------
  const downloadCSV = () => {
    const rows = [
      ["Trip Name", tripName],
      ["Start Date", startDate],
      ["End Date", endDate],
      ["Travellers", travellers],
      ["Preferences", preferences],
      [],
      ["Destination", "Days", "Notes", "Activity", "Time"],
    ];

    destinations.forEach((d) => {
      if (!d.activities.length) {
        rows.push([d.name, d.days, d.notes, "", ""]);
      } else {
        d.activities.forEach((a, i) => {
          rows.push([
            i === 0 ? d.name : "",
            i === 0 ? d.days : "",
            i === 0 ? d.notes : "",
            a.title,
            a.time,
          ]);
        });
      }
    });

    const csv = rows
      .map((r) => r.map((c) => `"${c || ""}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${tripName.replace(/\s+/g, "_")}.csv`;
    link.click();
  };

  const downloadPDF = async () => {
    const canvas = await html2canvas(visualRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    pdf.text(tripName, 40, 40);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);
    const width = pdf.internal.pageSize.getWidth() - 80;
    const imgProps = pdf.getImageProperties(imgData);
    const height = (imgProps.height * width) / imgProps.width;
    pdf.addImage(imgData, "PNG", 40, 80, width, height);
    pdf.save(`${tripName.replace(/\s+/g, "_")}.pdf`);
  };

  const clearAll = () => {
    setTripName("");
    setStartDate("");
    setEndDate("");
    setTravellers(1);
    setPreferences("");
    setDestinations([]);
  };

  // ---------- Visualization Data ----------
  const chartData = destinations.map((d) => ({
    name: d.name || "Untitled",
    days: Number(d.days || 0),
  }));

  const colors = [
    "#4f46e5",
    "#06b6d4",
    "#ef4444",
    "#f59e0b",
    "#10b981",
    "#8b5cf6",
    "#ec4899",
  ];

  return (
    <div className="itinerary-module">
      <div className="left-panel">
        <header className="im-header">
          <h2>🗺️ Itinerary Planner</h2>
          <div className="meta-row">
            <input
              placeholder="Trip Name"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <input
              type="number"
              min="1"
              value={travellers}
              onChange={(e) => setTravellers(Number(e.target.value))}
              title="Travellers"
            />
          </div>
          <textarea
            placeholder="Preferences (e.g. museums, beaches, food)"
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
          />
        </header>

        <div className="controls-row">
          <button onClick={addDestination}>+ Add Destination</button>
          <button onClick={() => setDestinations(defaultExample)}>
            Load Example
          </button>
          <button onClick={clearAll}>Clear All</button>
        </div>

        <div className="dest-list">
          {destinations.map((d, i) => (
            <div key={d.id} className="dest-card">
              <div className="dest-card-top">
                <input
                  className="dest-name"
                  value={d.name}
                  placeholder={`Destination #${i + 1}`}
                  onChange={(e) =>
                    updateDestination(d.id, { name: e.target.value })
                  }
                />
                <div className="dest-days-control">
                  <label>Days</label>
                  <input
                    type="number"
                    min="1"
                    value={d.days}
                    onChange={(e) =>
                      updateDestination(d.id, { days: Number(e.target.value) })
                    }
                  />
                </div>
                <button className="small del" onClick={() => removeDestination(d.id)}>
                  ✖
                </button>
              </div>

              <textarea
                className="dest-notes"
                placeholder="Notes / hotels / tips"
                value={d.notes}
                onChange={(e) =>
                  updateDestination(d.id, { notes: e.target.value })
                }
              />

              <div className="activities">
                <h4>Activities</h4>
                {d.activities.map((a) => (
                  <div key={a.id} className="activity-row">
                    <input
                      placeholder="Activity Title"
                      value={a.title}
                      onChange={(e) =>
                        updateActivity(d.id, a.id, { title: e.target.value })
                      }
                    />
                    <input
                      type="time"
                      value={a.time}
                      onChange={(e) =>
                        updateActivity(d.id, a.id, { time: e.target.value })
                      }
                    />
                    <button
                      className="small del"
                      onClick={() => removeActivity(d.id, a.id)}
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button className="add-act" onClick={() => addActivity(d.id)}>
                  + Add Activity
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="actions">
          <button onClick={downloadCSV}>Download CSV</button>
          <button onClick={downloadPDF}>Download PDF</button>
        </div>
      </div>

      <div className="right-panel" ref={visualRef}>
        <div className="summary">
          <h3>{tripName || "Untitled Trip"}</h3>
          <p>
            {startDate || "—"} → {endDate || "—"}
          </p>
          <p>
            Destinations: <strong>{destinations.length}</strong> • Total days:{" "}
            <strong>{computedTotalDays}</strong>
          </p>
          <p>Travellers: <strong>{travellers}</strong></p>
          {preferences && <p>Preferences: {preferences}</p>}
        </div>

        <div className="chart">
          <h4>📊 Days per Destination</h4>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="days">
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="timeline">
          <h4>🕓 Trip Timeline</h4>
          <div className="timeline-bar">
            {destinations.map((d, i) => {
              const total = Math.max(computedTotalDays, 1);
              const width = (d.days / total) * 100;
              return (
                <div
                  key={d.id}
                  className="timeline-segment"
                  style={{ width: `${width}%`, background: colors[i % colors.length] }}
                >
                  <span className="timeline-text">
                    {d.name} ({d.days})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="preview-list">
          <h4>🗒️ Day-by-Day Preview</h4>
          {destinations.map((d, i) => (
            <div key={d.id} className="preview-item">
              <div className="preview-header">
                <strong>{i + 1}. {d.name}</strong>
                <span className="muted">{d.days} days</span>
              </div>
              {d.notes && <p className="muted small">{d.notes}</p>}
              <ul className="acts">
                {d.activities.map((a) => (
                  <li key={a.id}>
                    {a.time && `${a.time} — `}{a.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
