// // import React, { useEffect, useState, useRef } from "react";
// // import axios from "axios";
// // import { v4 as uuidv4 } from "uuid";
// // import html2canvas from "html2canvas";
// // import jsPDF from "jspdf";
// // import {
// //   ResponsiveContainer,
// //   BarChart,
// //   Bar,
// //   XAxis,
// //   YAxis,
// //   Tooltip,
// //   Cell,
// // } from "recharts";
// // import "./ItineraryModule.css";

// // /*
// //   Usage:
// //     <ItineraryModule user={user} />
// //   where `user` is the logged-in user object containing an `email` field (or id).
// //   API base URL: set REACT_APP_API_BASE in your .env or it will default to http://localhost:5050
// // */

// // const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5050/api";

// // const defaultExample = [
// //   {
// //     id: uuidv4(),
// //     name: "Paris",
// //     days: 2,
// //     notes: "Eiffel, Louvre",
// //     activities: [{ id: uuidv4(), title: "Louvre visit", time: "10:00" }],
// //   },
// //   {
// //     id: uuidv4(),
// //     name: "Nice",
// //     days: 2,
// //     notes: "Promenade des Anglais",
// //     activities: [{ id: uuidv4(), title: "Beach", time: "14:00" }],
// //   },
// // ];

// // export default function ItineraryModule({ user }) {
// //   const [tripName, setTripName] = useState("");
// //   const [startDate, setStartDate] = useState("");
// //   const [endDate, setEndDate] = useState("");
// //   const [travellers, setTravellers] = useState(1);
// //   const [preferences, setPreferences] = useState("");
// //   const [destinations, setDestinations] = useState(defaultExample);
// //   const [savedList, setSavedList] = useState([]);
// //   const [activeId, setActiveId] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const visualRef = useRef(null);

// //   // compute total days from destinations or dates if provided
// //   const computedTotalDays = destinations.reduce((acc, d) => acc + Number(d.days || 0), 0);

// //   useEffect(() => {
// //     if (user?.email) fetchSaved();
// //     // eslint-disable-next-line
// //   }, [user]);

// //   // --------- CRUD with backend (Mongo) ----------
// //   async function fetchSaved() {
// //     try {
// //       setLoading(true);
// //       const res = await axios.get(`${API_BASE}/itineraries`, {
// //         params: { user: user.email },
// //       });
// //       setSavedList(res.data || []);
// //     } catch (err) {
// //       console.error("Error fetching itineraries", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   async function saveItinerary() {
// //     if (!user?.email) return alert("Please sign in to save itineraries.");
// //     if (!tripName) return alert("Please provide a trip name.");

// //     const payload = {
// //       user: user.email,
// //       tripName,
// //       startDate,
// //       endDate,
// //       travellers,
// //       preferences,
// //       destinations,
// //       totalDays: computedTotalDays,
// //     };

// //     try {
// //       setLoading(true);
// //       if (activeId) {
// //         await axios.put(`${API_BASE}/itineraries/${activeId}`, payload);
// //         alert("Itinerary updated.");
// //       } else {
// //         await axios.post(`${API_BASE}/itineraries`, payload);
// //         alert("Itinerary saved.");
// //       }
// //       await fetchSaved();
// //     } catch (err) {
// //       console.error("Save error", err);
// //       alert("Error saving itinerary.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   async function deleteItinerary(id) {
// //     if (!confirm("Delete this itinerary?")) return;
// //     try {
// //       await axios.delete(`${API_BASE}/itineraries/${id}`);
// //       if (activeId === id) {
// //         clearForm();
// //       }
// //       await fetchSaved();
// //     } catch (err) {
// //       console.error("Delete error", err);
// //       alert("Error deleting itinerary.");
// //     }
// //   }

// //   function loadItinerary(it) {
// //     setActiveId(it._id);
// //     setTripName(it.tripName || "");
// //     setStartDate(it.startDate || "");
// //     setEndDate(it.endDate || "");
// //     setTravellers(it.travellers || 1);
// //     setPreferences(it.preferences || "");
// //     setDestinations(it.destinations || []);
// //     window.scrollTo({ top: 0, behavior: "smooth" });
// //   }

// //   function clearForm() {
// //     setActiveId(null);
// //     setTripName("");
// //     setStartDate("");
// //     setEndDate("");
// //     setTravellers(1);
// //     setPreferences("");
// //     setDestinations(defaultExample);
// //   }

// //   // ---------- Destinations & Activities helpers ----------
// //   function addDestination() {
// //     setDestinations((s) => [...s, { id: uuidv4(), name: "", days: 1, notes: "", activities: [] }]);
// //   }

// //   function updateDestination(id, patch) {
// //     setDestinations((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
// //   }

// //   function removeDestination(id) {
// //     setDestinations((prev) => prev.filter((d) => d.id !== id));
// //   }

// //   function addActivity(destId) {
// //     updateDestination(destId, {
// //       activities: [...(destinations.find((d) => d.id === destId).activities || []), { id: uuidv4(), title: "", time: "" }],
// //     });
// //   }

// //   function updateActivity(destId, actId, patch) {
// //     setDestinations((prev) =>
// //       prev.map((d) =>
// //         d.id !== destId
// //           ? d
// //           : { ...d, activities: d.activities.map((a) => (a.id === actId ? { ...a, ...patch } : a)) }
// //       )
// //     );
// //   }

// //   function removeActivity(destId, actId) {
// //     updateDestination(destId, {
// //       activities: destinations.find((d) => d.id === destId).activities.filter((a) => a.id !== actId),
// //     });
// //   }

// //   // ---------- Export CSV & PDF ----------
// //   function downloadCSV() {
// //     const rows = [
// //       ["Trip Name", tripName || ""],
// //       ["Start Date", startDate || ""],
// //       ["End Date", endDate || ""],
// //       ["Travellers", travellers],
// //       ["Preferences", preferences || ""],
// //       [],
// //       ["Destination", "Days", "Notes", "Activity Title", "Activity Time"],
// //     ];
// //     destinations.forEach((d) => {
// //       if (!d.activities || d.activities.length === 0) {
// //         rows.push([d.name, d.days, d.notes || "", "", ""]);
// //       } else {
// //         d.activities.forEach((a, i) => {
// //           rows.push([i === 0 ? d.name : "", i === 0 ? d.days : "", i === 0 ? d.notes || "" : "", a.title || "", a.time || ""]);
// //         });
// //       }
// //     });

// //     const csvContent = rows.map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
// //     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
// //     const link = document.createElement("a");
// //     link.href = URL.createObjectURL(blob);
// //     link.download = `${(tripName || "itinerary").replace(/\s+/g, "_")}.csv`;
// //     document.body.appendChild(link);
// //     link.click();
// //     link.remove();
// //   }

// //   async function downloadPDF() {
// //     if (!visualRef.current) return alert("Visual area not ready.");
// //     try {
// //       const canvas = await html2canvas(visualRef.current, { scale: 2, useCORS: true });
// //       const imgData = canvas.toDataURL("image/png");
// //       const pdf = new jsPDF("p", "pt", "a4");
// //       pdf.setFontSize(18);
// //       pdf.text(tripName || "Itinerary Report", 40, 40);
// //       pdf.setFontSize(11);
// //       pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);
// //       const pageWidth = pdf.internal.pageSize.getWidth();
// //       const maxImgWidth = pageWidth - 80;
// //       const imgProps = pdf.getImageProperties(imgData);
// //       const imgHeight = (imgProps.height * maxImgWidth) / imgProps.width;
// //       pdf.addImage(imgData, "PNG", 40, 80, maxImgWidth, imgHeight);
// //       pdf.save(`${(tripName || "itinerary").replace(/\s+/g, "_")}.pdf`);
// //     } catch (err) {
// //       console.error("PDF error", err);
// //       alert("Could not generate PDF (see console).");
// //     }
// //   }

// //   // ---------- Chart data ----------
// //   const chartData = destinations.map((d) => ({ name: d.name || "Untitled", days: Number(d.days || 0) }));
// //   const colors = ["#4f46e5", "#06b6d4", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899"];

// //   return (
// //     <div className="itinerary-module">
// //       <div className="left-panel">
// //         <header className="im-header">
// //           <h2>Itinerary Planner (Manual)</h2>
// //           <div className="meta-row">
// //             <input placeholder="Trip name" value={tripName} onChange={(e) => setTripName(e.target.value)} />
// //             <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
// //             <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
// //             <input type="number" min="1" value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} title="Travellers" />
// //           </div>
// //           <textarea placeholder="Preferences (e.g. museums, beaches, food)" value={preferences} onChange={(e) => setPreferences(e.target.value)} />
// //         </header>

// //         <div className="controls-row">
// //           <button onClick={addDestination}>+ Add Destination</button>
// //           <button onClick={() => { setDestinations(defaultExample); }}>Load Example</button>
// //           <button onClick={clearForm}>Reset</button>
// //         </div>

// //         <div className="dest-list">
// //           {destinations.map((d, idx) => (
// //             <div className="dest-card" key={d.id}>
// //               <div className="dest-card-top">
// //                 <input className="dest-name" value={d.name} onChange={(e) => updateDestination(d.id, { name: e.target.value })} placeholder={`Destination #${idx + 1}`} />
// //                 <div className="dest-days-control">
// //                   <label>Days</label>
// //                   <input type="number" min="0" value={d.days} onChange={(e) => updateDestination(d.id, { days: Number(e.target.value) })} />
// //                 </div>
// //                 <button className="small del" onClick={() => removeDestination(d.id)}>Delete</button>
// //               </div>

// //               <textarea className="dest-notes" placeholder="Notes / hotels / tips" value={d.notes} onChange={(e) => updateDestination(d.id, { notes: e.target.value })} />

// //               <div className="activities">
// //                 <h4>Activities</h4>
// //                 {(d.activities || []).map((a) => (
// //                   <div className="activity-row" key={a.id}>
// //                     <input placeholder="Title" value={a.title} onChange={(e) => updateActivity(d.id, a.id, { title: e.target.value })} />
// //                     <input type="time" value={a.time} onChange={(e) => updateActivity(d.id, a.id, { time: e.target.value })} />
// //                     <button className="small del" onClick={() => removeActivity(d.id, a.id)}>✖</button>
// //                   </div>
// //                 ))}
// //                 <button className="add-act" onClick={() => addActivity(d.id)}>+ Add Activity</button>
// //               </div>
// //             </div>
// //           ))}
// //         </div>

// //         <div className="actions">
// //           <button onClick={saveItinerary} disabled={loading}>{activeId ? "Update & Save" : "Save Itinerary"}</button>
// //           <button onClick={downloadCSV}>Download CSV</button>
// //           <button onClick={downloadPDF}>Download PDF</button>
// //         </div>

// //         <div className="saved-section">
// //           <h3>Saved itineraries</h3>
// //           {loading ? <p>Loading...</p> : savedList.length === 0 ? <p>No saved itineraries.</p> : (
// //             <div className="saved-list">
// //               {savedList.map((s) => (
// //                 <div key={s._id} className={`saved-row ${activeId === s._id ? "active" : ""}`}>
// //                   <div className="saved-meta" onClick={() => loadItinerary(s)}>
// //                     <strong>{s.tripName}</strong>
// //                     <small className="muted">{new Date(s.createdAt).toLocaleString()}</small>
// //                   </div>
// //                   <div className="saved-actions">
// //                     <button onClick={() => loadItinerary(s)}>Load</button>
// //                     <button className="small del" onClick={() => deleteItinerary(s._id)}>Delete</button>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       <div className="right-panel" ref={visualRef}>
// //         <div className="summary">
// //           <h3>{tripName || "Untitled Trip"}</h3>
// //           <p>{startDate || "—"} → {endDate || "—"}</p>
// //           <p>Destinations: <strong>{destinations.length}</strong> • Total days: <strong>{computedTotalDays}</strong></p>
// //           <p>Travellers: <strong>{travellers}</strong></p>
// //           {preferences && <p>Preferences: {preferences}</p>}
// //         </div>

// //         <div className="chart">
// //           <h4>Days per Destination</h4>
// //           <div style={{ width: "100%", height: 260 }}>
// //             <ResponsiveContainer width="100%" height="100%">
// //               <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 40 }}>
// //                 <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={60} />
// //                 <YAxis allowDecimals={false} />
// //                 <Tooltip />
// //                 <Bar dataKey="days">
// //                   {chartData.map((_, i) => (
// //                     <Cell key={`c-${i}`} fill={colors[i % colors.length]} />
// //                   ))}
// //                 </Bar>
// //               </BarChart>
// //             </ResponsiveContainer>
// //           </div>
// //         </div>

// //         <div className="timeline">
// //           <h4>Simple Timeline</h4>
// //           <div className="timeline-bar">
// //             {(() => {
// //               const total = Math.max(computedTotalDays, 1);
// //               return destinations.map((d, i) => {
// //                 const percent = Math.round((d.days / total) * 100) || 1;
// //                 return (
// //                   <div key={d.id} className="timeline-segment" style={{ width: `${percent}%`, backgroundColor: colors[i % colors.length] }}>
// //                     <span className="timeline-text">{d.name} ({d.days})</span>
// //                   </div>
// //                 );
// //               });
// //             })()}
// //           </div>
// //         </div>

// //         <div className="preview-list">
// //           <h4>Day-by-day Preview</h4>
// //           {destinations.map((d, idx) => (
// //             <div key={d.id} className="preview-item">
// //               <div className="preview-header">
// //                 <strong>{idx + 1}. {d.name}</strong>
// //                 <span className="muted">{d.days} day{d.days > 1 ? "s" : ""}</span>
// //               </div>
// //               {d.notes && <div className="muted small">{d.notes}</div>}
// //               {d.activities && d.activities.length > 0 && (
// //                 <ul className="acts">
// //                   {d.activities.map((a) => <li key={a.id}>{a.time ? `${a.time} — ` : ""}{a.title}</li>)}
// //                 </ul>
// //               )}
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useState, useRef } from "react";
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
//   ✅ FRONTEND-ONLY VERSION
//   No backend or MongoDB calls.
//   Everything runs in local state.
// */

// const defaultExample = [
//   {
//     id: uuidv4(),
//     name: "Paris",
//     days: 2,
//     notes: "Eiffel Tower, Louvre, Seine River Cruise",
//     activities: [{ id: uuidv4(), title: "Louvre visit", time: "10:00" }],
//   },
//   {
//     id: uuidv4(),
//     name: "Nice",
//     days: 2,
//     notes: "Promenade des Anglais, Beach and Old Town",
//     activities: [{ id: uuidv4(), title: "Beach", time: "14:00" }],
//   },
// ];

// export default function ItineraryModule() {
//   const [tripName, setTripName] = useState("European Getaway");
//   const [startDate, setStartDate] = useState("2025-11-01");
//   const [endDate, setEndDate] = useState("2025-11-05");
//   const [travellers, setTravellers] = useState(2);
//   const [preferences, setPreferences] = useState("Museums, Beaches, Cafés");
//   const [destinations, setDestinations] = useState(defaultExample);
//   const visualRef = useRef(null);

//   const computedTotalDays = destinations.reduce(
//     (acc, d) => acc + Number(d.days || 0),
//     0
//   );

//   // ---------- Destination & Activity Management ----------
//   const addDestination = () => {
//     setDestinations((prev) => [
//       ...prev,
//       { id: uuidv4(), name: "", days: 1, notes: "", activities: [] },
//     ]);
//   };

//   const updateDestination = (id, patch) => {
//     setDestinations((prev) =>
//       prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
//     );
//   };

//   const removeDestination = (id) => {
//     setDestinations((prev) => prev.filter((d) => d.id !== id));
//   };

//   const addActivity = (destId) => {
//     setDestinations((prev) =>
//       prev.map((d) =>
//         d.id === destId
//           ? {
//               ...d,
//               activities: [
//                 ...(d.activities || []),
//                 { id: uuidv4(), title: "", time: "" },
//               ],
//             }
//           : d
//       )
//     );
//   };

//   const updateActivity = (destId, actId, patch) => {
//     setDestinations((prev) =>
//       prev.map((d) =>
//         d.id === destId
//           ? {
//               ...d,
//               activities: d.activities.map((a) =>
//                 a.id === actId ? { ...a, ...patch } : a
//               ),
//             }
//           : d
//       )
//     );
//   };

//   const removeActivity = (destId, actId) => {
//     setDestinations((prev) =>
//       prev.map((d) =>
//         d.id === destId
//           ? {
//               ...d,
//               activities: d.activities.filter((a) => a.id !== actId),
//             }
//           : d
//       )
//     );
//   };

//   // ---------- Export: CSV & PDF ----------
//   const downloadCSV = () => {
//     const rows = [
//       ["Trip Name", tripName],
//       ["Start Date", startDate],
//       ["End Date", endDate],
//       ["Travellers", travellers],
//       ["Preferences", preferences],
//       [],
//       ["Destination", "Days", "Notes", "Activity", "Time"],
//     ];

//     destinations.forEach((d) => {
//       if (!d.activities.length) {
//         rows.push([d.name, d.days, d.notes, "", ""]);
//       } else {
//         d.activities.forEach((a, i) => {
//           rows.push([
//             i === 0 ? d.name : "",
//             i === 0 ? d.days : "",
//             i === 0 ? d.notes : "",
//             a.title,
//             a.time,
//           ]);
//         });
//       }
//     });

//     const csv = rows
//       .map((r) => r.map((c) => `"${c || ""}"`).join(","))
//       .join("\n");
//     const blob = new Blob([csv], { type: "text/csv" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = `${tripName.replace(/\s+/g, "_")}.csv`;
//     link.click();
//   };

//   const downloadPDF = async () => {
//     const canvas = await html2canvas(visualRef.current, { scale: 2 });
//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "pt", "a4");
//     pdf.text(tripName, 40, 40);
//     pdf.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);
//     const width = pdf.internal.pageSize.getWidth() - 80;
//     const imgProps = pdf.getImageProperties(imgData);
//     const height = (imgProps.height * width) / imgProps.width;
//     pdf.addImage(imgData, "PNG", 40, 80, width, height);
//     pdf.save(`${tripName.replace(/\s+/g, "_")}.pdf`);
//   };

//   const clearAll = () => {
//     setTripName("");
//     setStartDate("");
//     setEndDate("");
//     setTravellers(1);
//     setPreferences("");
//     setDestinations([]);
//   };

//   // ---------- Visualization Data ----------
//   const chartData = destinations.map((d) => ({
//     name: d.name || "Untitled",
//     days: Number(d.days || 0),
//   }));

//   const colors = [
//     "#4f46e5",
//     "#06b6d4",
//     "#ef4444",
//     "#f59e0b",
//     "#10b981",
//     "#8b5cf6",
//     "#ec4899",
//   ];

//   return (
//     <div className="itinerary-module">
//       <div className="left-panel">
//         <header className="im-header">
//           <h2>🗺️ Itinerary Planner</h2>
//           <div className="meta-row">
//             <input
//               placeholder="Trip Name"
//               value={tripName}
//               onChange={(e) => setTripName(e.target.value)}
//             />
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//             />
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//             />
//             <input
//               type="number"
//               min="1"
//               value={travellers}
//               onChange={(e) => setTravellers(Number(e.target.value))}
//               title="Travellers"
//             />
//           </div>
//           <textarea
//             placeholder="Preferences (e.g. museums, beaches, food)"
//             value={preferences}
//             onChange={(e) => setPreferences(e.target.value)}
//           />
//         </header>

//         <div className="controls-row">
//           <button onClick={addDestination}>+ Add Destination</button>
//           <button onClick={() => setDestinations(defaultExample)}>
//             Load Example
//           </button>
//           <button onClick={clearAll}>Clear All</button>
//         </div>

//         <div className="dest-list">
//           {destinations.map((d, i) => (
//             <div key={d.id} className="dest-card">
//               <div className="dest-card-top">
//                 <input
//                   className="dest-name"
//                   value={d.name}
//                   placeholder={`Destination #${i + 1}`}
//                   onChange={(e) =>
//                     updateDestination(d.id, { name: e.target.value })
//                   }
//                 />
//                 <div className="dest-days-control">
//                   <label>Days</label>
//                   <input
//                     type="number"
//                     min="1"
//                     value={d.days}
//                     onChange={(e) =>
//                       updateDestination(d.id, { days: Number(e.target.value) })
//                     }
//                   />
//                 </div>
//                 <button className="small del" onClick={() => removeDestination(d.id)}>
//                   ✖
//                 </button>
//               </div>

//               <textarea
//                 className="dest-notes"
//                 placeholder="Notes / hotels / tips"
//                 value={d.notes}
//                 onChange={(e) =>
//                   updateDestination(d.id, { notes: e.target.value })
//                 }
//               />

//               <div className="activities">
//                 <h4>Activities</h4>
//                 {d.activities.map((a) => (
//                   <div key={a.id} className="activity-row">
//                     <input
//                       placeholder="Activity Title"
//                       value={a.title}
//                       onChange={(e) =>
//                         updateActivity(d.id, a.id, { title: e.target.value })
//                       }
//                     />
//                     <input
//                       type="time"
//                       value={a.time}
//                       onChange={(e) =>
//                         updateActivity(d.id, a.id, { time: e.target.value })
//                       }
//                     />
//                     <button
//                       className="small del"
//                       onClick={() => removeActivity(d.id, a.id)}
//                     >
//                       ✖
//                     </button>
//                   </div>
//                 ))}
//                 <button className="add-act" onClick={() => addActivity(d.id)}>
//                   + Add Activity
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="actions">
//           <button onClick={downloadCSV}>Download CSV</button>
//           <button onClick={downloadPDF}>Download PDF</button>
//         </div>
//       </div>

//       <div className="right-panel" ref={visualRef}>
//         <div className="summary">
//           <h3>{tripName || "Untitled Trip"}</h3>
//           <p>
//             {startDate || "—"} → {endDate || "—"}
//           </p>
//           <p>
//             Destinations: <strong>{destinations.length}</strong> • Total days:{" "}
//             <strong>{computedTotalDays}</strong>
//           </p>
//           <p>Travellers: <strong>{travellers}</strong></p>
//           {preferences && <p>Preferences: {preferences}</p>}
//         </div>

//         <div className="chart">
//           <h4>📊 Days per Destination</h4>
//           <div style={{ width: "100%", height: 250 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="days">
//                   {chartData.map((_, i) => (
//                     <Cell key={i} fill={colors[i % colors.length]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="timeline">
//           <h4>🕓 Trip Timeline</h4>
//           <div className="timeline-bar">
//             {destinations.map((d, i) => {
//               const total = Math.max(computedTotalDays, 1);
//               const width = (d.days / total) * 100;
//               return (
//                 <div
//                   key={d.id}
//                   className="timeline-segment"
//                   style={{ width: `${width}%`, background: colors[i % colors.length] }}
//                 >
//                   <span className="timeline-text">
//                     {d.name} ({d.days})
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         <div className="preview-list">
//           <h4>🗒️ Day-by-Day Preview</h4>
//           {destinations.map((d, i) => (
//             <div key={d.id} className="preview-item">
//               <div className="preview-header">
//                 <strong>{i + 1}. {d.name}</strong>
//                 <span className="muted">{d.days} days</span>
//               </div>
//               {d.notes && <p className="muted small">{d.notes}</p>}
//               <ul className="acts">
//                 {d.activities.map((a) => (
//                   <li key={a.id}>
//                     {a.time && `${a.time} — `}{a.title}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

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
import "./ItineraryModule.css";

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
          <section className="card expense-table">
            <h3>EXPENSES TABLE</h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Budget</th>
                    <th>Actual</th>
                    <th>Difference</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {state.expenses.map((e, i) => (
                    <tr key={i}>
                      <td><input value={e.category} onChange={(ev) => updateExpense(i, "category", ev.target.value)} /></td>
                      <td><input type="number" value={e.budget} onChange={(ev) => updateExpense(i, "budget", Number(ev.target.value))} /></td>
                      <td><input type="number" value={e.actual} onChange={(ev) => updateExpense(i, "actual", Number(ev.target.value))} /></td>
                      <td className={e.budget - e.actual >= 0 ? "pos" : "neg"}>{(e.budget || 0) - (e.actual || 0)}</td>
                      <td><button className="small del" onClick={() => removeExpenseRow(i)}>✖</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-actions">
              <button onClick={addExpenseRow}>+ Add Category</button>
            </div>
          </section>

          <section className="card notes">
            <h3>NOTES</h3>
            <textarea value={state.notes || ""} onChange={(e) => updateField("notes", e.target.value)} placeholder="Trip notes..." />
          </section>
        </div>
      </div>
    </div>
  );
}
