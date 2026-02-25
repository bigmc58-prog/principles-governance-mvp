import { useEffect, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function CoachPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [lcmsMode, setLcmsMode] = useState(false);

  useEffect(() => {
    // Fetch org settings (single-org demo)
    fetch("/api/org")
      .then(r => r.json())
      .then(d => setLcmsMode(Boolean(d?.lcmsMode)))
      .catch(() => {});
  }, []);

  async function send() {
    if (!input.trim()) return;
    const next = [...messages, { role: "user", content: input.trim() } as Msg];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "No reply." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontWeight: 600 }}>AI Governance Coach</span>
        <span style={{ fontSize: 12, opacity: 0.75 }}>
          LCMS Congregation mode: <b>{lcmsMode ? "ON" : "OFF"}</b>
        </span>
      </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12, minHeight: 320 }}>
        {messages.length === 0 ? (
          <div style={{ opacity: 0.7 }}>
            Ask a governance question (board vs executive, policy drift, monitoring, agenda framing, etc.).
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, opacity: 0.65 }}>{m.role.toUpperCase()}</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.content}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          style={{ flex: 1, borderRadius: 10, border: "1px solid #ccc", padding: 10 }}
          placeholder="Type your question..."
        />
        <button
          onClick={send}
          disabled={busy}
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: "white" }}
        >
          {busy ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
