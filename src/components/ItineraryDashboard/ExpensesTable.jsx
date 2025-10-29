// frontend/src/components/ExpensesTable.jsx
import React, { useState, useEffect } from "react";

const ExpensesTable = () => {
  const [expenses, setExpenses] = useState([]);
  const [initialized, setInitialized] = useState(false);

  const API_BASE = "http://localhost:5050/api/expenses";

  // fetch all expenses
  const fetchExpenses = async () => {
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data);
      if (data.length > 0) setInitialized(true);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // initialize defaults
  const handleStart = async () => {
    try {
      const res = await fetch(`${API_BASE}/init`, { method: "POST" });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        setExpenses(data);
        setInitialized(true);
      } catch {
        console.error("Not JSON response:", text);
      }
    } catch (err) {
      console.error("Error initializing:", err);
    }
  };

  // add/remove/update
  const addExpenseRow = () =>
    setExpenses([...expenses, { category: "", budget: 0, actual: 0 }]);

  const removeExpenseRow = (i) =>
    setExpenses(expenses.filter((_, idx) => idx !== i));

  const updateExpense = (i, field, value) => {
    const updated = [...expenses];
    updated[i][field] = value;
    setExpenses(updated);
  };

  // save all
  const handleSave = async () => {
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expenses),
      });
      if (res.ok) alert("Expenses saved!");
      else alert("Save failed");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  if (!initialized)
    return (
      <section className="card expense-table">
        <h3>EXPENSES TABLE</h3>
        <button className="save-btn" onClick={handleStart}>
          Start Expenses
        </button>
      </section>
    );

  return (
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
            {expenses.map((e, i) => (
              <tr key={i}>
                <td>
                  <input
                    value={e.category}
                    onChange={(ev) =>
                      updateExpense(i, "category", ev.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={e.budget}
                    onChange={(ev) =>
                      updateExpense(i, "budget", Number(ev.target.value))
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={e.actual}
                    onChange={(ev) =>
                      updateExpense(i, "actual", Number(ev.target.value))
                    }
                  />
                </td>
                <td className={e.budget - e.actual >= 0 ? "pos" : "neg"}>
                  {(e.budget || 0) - (e.actual || 0)}
                </td>
                <td>
                  <button
                    className="small del"
                    onClick={() => removeExpenseRow(i)}
                  >
                    ✖
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-actions">
        <button onClick={addExpenseRow}>+ Add Category</button>
        <button className="save-btn" onClick={handleSave}>
          💾 Save
        </button>
      </div>
    </section>
  );
};

export default ExpensesTable;



// import React, { useState, useEffect } from "react";

// const ExpensesTable = () => {
//   const [expenses, setExpenses] = useState([
//     { category: "", budget: 0, actual: 0 },
//   ]);

//   // === Fetch existing data from backend ===
//   useEffect(() => {
//     const fetchExpenses = async () => {
//       try {
//         const res = await fetch("http://localhost:5050/api/expenses");
//         if (res.ok) {
//           const data = await res.json();
//           setExpenses(data);
//         } else {
//           console.error("Failed to load expenses:", res.status);
//         }
//       } catch (err) {
//         console.error("Error fetching expenses:", err);
//       }
//     };
//     fetchExpenses();
//   }, []);

//   // === Handlers ===
//   const addExpenseRow = () => {
//     setExpenses([...expenses, { category: "", budget: 0, actual: 0 }]);
//   };

//   const removeExpenseRow = (index) => {
//     const newExpenses = expenses.filter((_, i) => i !== index);
//     setExpenses(newExpenses);
//   };

//   const updateExpense = (index, field, value) => {
//     const newExpenses = [...expenses];
//     newExpenses[index][field] = value;
//     setExpenses(newExpenses);
//   };

//   // === Save to backend ===
//   const handleSave = async () => {
//     try {
//       const res = await fetch("http://localhost:5050/api/expenses", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(expenses),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       alert("Expenses saved successfully!");
//     } catch (err) {
//       console.error("Save failed:", err);
//     }
//   };

//   return (
//     <section className="card expense-table">
//       <h3>EXPENSES TABLE</h3>

//       <div className="table-scroll">
//         <table>
//           <thead>
//             <tr>
//               <th>Category</th>
//               <th>Budget</th>
//               <th>Actual</th>
//               <th>Difference</th>
//               <th />
//             </tr>
//           </thead>
//           <tbody>
//             {expenses.map((e, i) => (
//               <tr key={i}>
//                 <td>
//                   <input
//                     value={e.category}
//                     onChange={(ev) =>
//                       updateExpense(i, "category", ev.target.value)
//                     }
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="number"
//                     value={e.budget}
//                     onChange={(ev) =>
//                       updateExpense(i, "budget", Number(ev.target.value))
//                     }
//                   />
//                 </td>
//                 <td>
//                   <input
//                     type="number"
//                     value={e.actual}
//                     onChange={(ev) =>
//                       updateExpense(i, "actual", Number(ev.target.value))
//                     }
//                   />
//                 </td>
//                 <td className={e.budget - e.actual >= 0 ? "pos" : "neg"}>
//                   {(e.budget || 0) - (e.actual || 0)}
//                 </td>
//                 <td>
//                   <button className="small del" onClick={() => removeExpenseRow(i)}>
//                     ✖
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="table-actions">
//         <button onClick={addExpenseRow}>+ Add Category</button>
//         <button className="save-btn" onClick={handleSave}>💾 Save</button>
//       </div>
//     </section>
//   );
// };

// export default ExpensesTable;

