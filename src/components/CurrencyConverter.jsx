// import React, { useState, useEffect } from "react";
// import "./CurrencyConverter.css";

// const CurrencyConverter = () => {
//   const [currencies, setCurrencies] = useState([]);
//   const [fromCurrency, setFromCurrency] = useState("USD");
//   const [toCurrency, setToCurrency] = useState("INR");
//   const [amount, setAmount] = useState(1);
//   const [result, setResult] = useState(null);

//   // Fetch list of currencies once
//   useEffect(() => {
//     fetch("https://open.er-api.com/v6/latest/USD")
//       .then(res => res.json())
//       .then(data => {
//         setCurrencies(Object.keys(data.rates));
//       });
//   }, []);

//   // Handle conversion
//   const convert = () => {
//     fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`)
//       .then(res => res.json())
//       .then(data => {
//         const rate = data.rates[toCurrency];
//         setResult((amount * rate).toFixed(2));
//       });
//   };

//   return (
//     <div className="converter-card">
//       <h2>Currency Converter</h2>

//       <div className="input-group">
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//         />

//         <select
//           value={fromCurrency}
//           onChange={(e) => setFromCurrency(e.target.value)}
//         >
//           {currencies.map((cur) => (
//             <option key={cur} value={cur}>
//               {cur}
//             </option>
//           ))}
//         </select>

//         <span className="to-text">to</span>

//         <select
//           value={toCurrency}
//           onChange={(e) => setToCurrency(e.target.value)}
//         >
//           {currencies.map((cur) => (
//             <option key={cur} value={cur}>
//               {cur}
//             </option>
//           ))}
//         </select>
//       </div>

//       <button onClick={convert}>Convert</button>

//       {result && (
//         <p className="result">
//           {amount} {fromCurrency} = <strong>{result} {toCurrency}</strong>
//         </p>
//       )}
//     </div>
//   );
// };

// export default CurrencyConverter;
import React, { useState, useEffect } from "react";
import "./CurrencyConverter.css";

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  const [amount, setAmount] = useState(1);
  const [result, setResult] = useState(null);
  const [rate, setRate] = useState(null);
  const [history, setHistory] = useState([]);

  // Transaction form (Currency Log)
  const [logNote, setLogNote] = useState("");
  const [logList, setLogList] = useState([]);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(res => res.json())
      .then(data => setCurrencies(Object.keys(data.rates)));
  }, []);

  const convert = async () => {
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
      const data = await res.json();
      const rateValue = data.rates[toCurrency];
      setRate(rateValue);
      const converted = (amount * rateValue).toFixed(2);
      setResult(converted);
      setHistory([{ fromCurrency, toCurrency, amount, converted }, ...history.slice(0, 4)]);
    } catch (err) {
      console.error("Conversion error:", err);
    }
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (logNote.trim() !== "") {
      setLogList([...logList, logNote]);
      setLogNote("");
    }
  };

  return (
    <div className="converter-card">
      <h2>💱 Currency Converter</h2>

      <div className="input-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
        >
          {currencies.map((cur) => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>

        <button onClick={handleSwap}>🔁</button>

        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
        >
          {currencies.map((cur) => (
            <option key={cur} value={cur}>{cur}</option>
          ))}
        </select>
      </div>

      <button onClick={convert}>Convert</button>

      {result && (
        <div className="result-section">
          <p className="result">
            {amount} {fromCurrency} = <strong>{result} {toCurrency}</strong>
          </p>
          {rate && <p>1 {fromCurrency} = {rate} {toCurrency}</p>}
        </div>
      )}

      {/* Conversion History */}
      {history.length > 0 && (
        <div className="history">
          <h4>Recent Conversions</h4>
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                {h.amount} {h.fromCurrency} → {h.converted} {h.toCurrency}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transaction Form: Currency Log */}
      <div className="currency-log-form">
        <h3>🗒️ Conversion Notes</h3>
        <form onSubmit={handleLogSubmit}>
          <input
            type="text"
            placeholder="Add a note for this conversion"
            value={logNote}
            onChange={(e) => setLogNote(e.target.value)}
          />
          <button type="submit">Add Log</button>
        </form>
        <ul>
          {logList.map((log, i) => (
            <li key={i}>• {log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CurrencyConverter;
