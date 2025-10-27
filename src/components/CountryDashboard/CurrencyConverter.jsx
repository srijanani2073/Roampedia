import React, { useEffect, useMemo, useState } from "react";

/**
 * Props:
 * - exchangeRates: response from exchangerate.host (or null)
 * - defaultTo: currency code (country)
 * - defaultToSymbol: optional
 */
export default function CurrencyConverter({ exchangeRates, defaultTo = "USD", defaultToSymbol = "$" }) {
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState(defaultTo || "USD");
  const [amount, setAmount] = useState(100);
  const [result, setResult] = useState(null);

  useEffect(() => setTo(defaultTo || "USD"), [defaultTo]);

  const rates = exchangeRates?.rates || null;
  const base = exchangeRates?.base || "EUR";

  useEffect(() => {
    if (!rates) { 
      setResult(null); 
      return; 
    }
    
    try {
      // Convert: amount (from) => to
      // Using base: convert amount -> base -> to
      const rateFrom = from === base ? 1 : (rates[from] || null);
      const rateTo = to === base ? 1 : (rates[to] || null);
      
      if (rateFrom === null || rateTo === null) {
        setResult(null);
        return;
      }
      
      const converted = ((amount / rateFrom) * rateTo);
      setResult(isFinite(converted) ? converted : null);
    } catch (err) {
      console.warn("Currency conversion error:", err);
      setResult(null);
    }
  }, [amount, from, to, rates, base]);

  const options = useMemo(() => {
    if (!rates) return ["INR", "USD", "EUR", "GBP", "JPY", "CNY", defaultTo].filter((v, i, a) => a.indexOf(v) === i);
    
    // Get all currency codes and sort them
    const allCodes = Object.keys(rates).sort();
    
    // Ensure INR and defaultTo are in the list
    const priorityCodes = ["INR", "USD", "EUR", "GBP", "JPY", "CNY", defaultTo];
    const uniquePriority = priorityCodes.filter((v, i, a) => a.indexOf(v) === i && (allCodes.includes(v) || v === base));
    
    return [...uniquePriority, ...allCodes.filter(c => !uniquePriority.includes(c))].slice(0, 100);
  }, [rates, base, defaultTo]);

  return (
    <div className="card">
      <div className="card-header">Currency Converter</div>
      <div className="card-body conv">
        {!rates && (
          <div className="muted" style={{ marginBottom: '12px', padding: '10px', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '8px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            ⚠️ Exchange rates unavailable. API may be rate-limited.
          </div>
        )}
        
        <div className="conv-row">
          <div>
            <label>From</label>
            <select value={from} onChange={(e)=>setFrom(e.target.value)} disabled={!rates}>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label>To</label>
            <select value={to} onChange={(e)=>setTo(e.target.value)} disabled={!rates}>
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="conv-row">
          <div>
            <label>Amount</label>
            <input 
              type="number" 
              value={amount} 
              min="0" 
              step="any"
              onChange={(e)=>setAmount(Number(e.target.value))} 
              disabled={!rates}
            />
          </div>
          <div>
            <label>Result</label>
            <div className="conv-result-value">
              {result !== null && rates ? `${result.toFixed(2)} ${to}` : "—"}
            </div>
          </div>
        </div>

        <div className="muted small">
          {rates ? `Base: ${base} • ${Object.keys(rates).length} currencies` : "Rates from exchangerate.host"}
        </div>
      </div>
    </div>
  );
}