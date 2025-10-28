import React, { useState, useRef, useEffect } from "react";
import "./Chatbot.css";

/**
 * Props:
 *  - backendUrl: string (default: "/chat")  -> URL of your backend POST endpoint
 *  - title: string (default: "Roampedia Assistant")
 */
export default function Chatbot({ backendUrl = "/chat", title = "Roampedia Assistant" }) {
  const [messages, setMessages] = useState([]); // {sender: 'user'|'bot', text: string}
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelHistory, setModelHistory] = useState(null); // opaque value returned by backend
  const [open, setOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    // add user message locally
    const userMsg = { sender: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, model_history: modelHistory }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      // Expect: { response: "...", model_history: ... }
      const botText = (data && (data.response ?? data.reply ?? data.message)) || "Sorry, no response.";
      const newHistory = data.model_history ?? data.chat_history ?? modelHistory;

      setModelHistory(newHistory);
      setMessages((m) => [...m, { sender: "bot", text: botText }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [...m, { sender: "bot", text: "⚠️ Error: Could not reach the chatbot backend." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleClear = () => {
    setMessages([]);
    setModelHistory(null);
  };

  return (
    <div className={`chatbot-wrapper ${open ? "open" : "closed"}`}>
      <div className="chatbot-header" onClick={() => setOpen((v) => !v)} role="button" tabIndex={0}>
        <div className="chatbot-title">
          <div className="chatbot-logo">🌍</div>
          <div className="chatbot-title-text">
            <div className="chatbot-main">{title}</div>
            <div className="chatbot-sub">Ask about countries, landmarks, or Roampedia features</div>
          </div>
        </div>

        <div className="chatbot-actions">
          <button className="btn-minimize" aria-label="Minimize">—</button>
        </div>
      </div>

      {open && (
        <div className="chatbot-body">
          <div className="chatbot-messages" role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="chatbot-empty">
                <strong>Welcome!</strong>
                <div>Try: "What is the capital of Peru?" or "How can I use the map?"</div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.sender}`}>
                <div className="chat-avatar">{m.sender === "bot" ? "🤖" : "🙂"}</div>
                <div className="chat-bubble">
                  <div className="chat-text" dangerouslySetInnerHTML={{ __html: sanitizeToHtml(m.text) }} />
                </div>
              </div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-row" onSubmit={handleSubmit}>
            <input
              className="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask e.g. 'What is the capital of Peru?'"
              disabled={loading}
              aria-label="Type your message"
            />
            <button type="submit" className="chatbot-send" disabled={loading || !input.trim()}>
              {loading ? "..." : "Send"}
            </button>
            <button type="button" className="chatbot-clear" onClick={handleClear} title="Clear chat">
              Clear
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/**
 * Quick sanitizer: convert newlines to <br>, escape angle brackets.
 * (Keep simple — don't render arbitrary HTML from server).
 */
function sanitizeToHtml(text) {
  if (text == null) return "";
  const escaped = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // allow simple markdown-ish bold **text** -> <strong>
  const bolded = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const withBreaks = bolded.replace(/\n/g, "<br/>");
  return withBreaks;
}
