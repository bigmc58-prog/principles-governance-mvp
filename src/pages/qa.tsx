import { useEffect, useState } from "react";

export default function QAPage() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<any>(null);
  const [meetingReady, setMeetingReady] = useState<any>(null);
  const [busyMeeting, setBusyMeeting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [busyHistory, setBusyHistory] = useState(false);

async function refreshHistory() {
  setBusyHistory(true);
  try {
    const res = await fetch("/api/history?limit=25");
    const data = await res.json();
    setHistory(data.scenarios ?? []);
  } finally {
    setBusyHistory(false);
  }
}

useEffect(() => {
  refreshHistory().catch(() => {});
}, []);

  async function run() {
    if (!q.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: q.trim() }),
      });
      setMeetingReady(null);
      const data = await res.json();
      setResult(data);
      refreshHistory().catch(() => {});
    } finally {
      setBusy(false);
    }
  }


async function generateMeetingReady() {
  if (!q.trim()) return;
  setBusyMeeting(true);
  try {
    const res = await fetch("/api/meeting-ready", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scenario: q.trim() }),
    });
    const data = await res.json();
    setMeetingReady(data.meetingReady);
  } finally {
    setBusyMeeting(false);
  }
}
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "start" }}>
      <div>
      <h2 style={{ marginTop: 0 }}>Governance Q&amp;A (Authority Classification)</h2>
      <p style={{ opacity: 0.8 }}>
        Paste an issue and get a fast classification (Board vs Executive vs Policy-level) + clarifying questions. If LCMS Congregation mode is ON, the questions include polity-aware routing prompts.
      </p>

      <textarea
        value={q}
        onChange={(e) => setQ(e.target.value)}
        rows={4}
        style={{ width: "100%", borderRadius: 10, border: "1px solid #ccc", padding: 10 }}
        placeholder="Example: Should the board approve the pastor's staff hiring plan?"
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={run} disabled={busy} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: "white" }}>
          {busy ? "…" : "Classify"}
        </button>
        <button onClick={generateMeetingReady} disabled={busyMeeting || !q.trim()} style={{ marginLeft: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: "white" }}>
          {busyMeeting ? "…" : "Generate meeting-ready output"}
        </button>
        <button onClick={copyAgendaPacket} disabled={!meetingReady} style={{ marginLeft: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: "white" }}>
          Copy for agenda packet
        </button>
      </div>

{meetingReady && (
  <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
    <div style={{ fontWeight: 700, marginBottom: 8 }}>Meeting-ready outputs</div>
    <div><b>Agenda item title:</b> {meetingReady.agendaItemTitle}</div>
    <div style={{ marginTop: 10 }}>
      <b>Decision questions:</b>
      <ul>
        {(meetingReady.decisionQuestions ?? []).map((x: string, i: number) => <li key={i}>{x}</li>)}
      </ul>
    </div>
    <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}><b>Motion template:</b> {meetingReady.motionTemplate}</div>
    <div style={{ marginTop: 10, whiteSpace: "pre-wrap" }}><b>Monitoring proposal:</b> {meetingReady.monitoringProposal}</div>
    {meetingReady.notes && <div style={{ marginTop: 10, opacity: 0.9 }}><b>Notes:</b> {meetingReady.notes}</div>}
  </div>
)}

      {result && (
        <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
          <div><b>Result:</b> {result.result}</div>
          {result.routing && (
            <div style={{ marginTop: 6 }}><b>Routing recommendation:</b> {result.routing}<div style={{ opacity: 0.85, marginTop: 4 }}>{result.routingRationale}</div></div>
          )}
          <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}><b>Rationale:</b> {result.rationale}</div>
          <div style={{ marginTop: 8 }}>
            <b>Clarifying questions:</b>
            <ul>
              {(result.clarifyingQuestions ?? []).map((x: string, i: number) => <li key={i}>{x}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>

      <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700 }}>Recent scenarios</div>
          <button onClick={refreshHistory} disabled={busyHistory} style={{ padding: "6px 10px", borderRadius: 10, border: "1px solid #ccc", background: "white" }}>
            {busyHistory ? "…" : "Refresh"}
          </button>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>Click one to load it back into Q&amp;A.</div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          {history.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No saved scenarios yet.</div>
          ) : (
            history.slice(0, 25).map((h, i) => (
              <button
                key={h.id ?? i}
                onClick={() => {
                  setQ(h.scenario ?? "");
                  setResult({
                    result: h.authority,
                    rationale: h.authorityWhy,
                    routing: h.routing,
                    routingRationale: h.routingRationale,
                    clarifyingQuestions: [],
                  });
                  setMeetingReady(h.meetingReady ?? null);
                }}
                style={{ textAlign: "left", padding: 10, borderRadius: 10, border: "1px solid #eee", background: "white" }}
              >
                <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(h.createdAt).toLocaleString()}</div>
                <div style={{ fontWeight: 600, marginTop: 4 }}>{(h.scenario ?? "").slice(0, 70)}{(h.scenario ?? "").length > 70 ? "…" : ""}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                  {h.authority}{h.routing ? ` • ${h.routing}` : ""}{h.meetingReady ? " • meeting-ready" : ""}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
function formatAgendaPacket(opts: { scenario: string; classification?: any; meetingReady?: any }) {
  const { scenario, classification, meetingReady } = opts;
  const lines: string[] = [];
  lines.push("AGENDA PACKET ITEM");
  lines.push("");
  if (meetingReady?.agendaItemTitle) lines.push(`Title: ${meetingReady.agendaItemTitle}`);
  lines.push("");
  lines.push("Scenario:");
  lines.push(scenario);
  lines.push("");
  if (classification?.result) {
    lines.push(`Authority classification: ${classification.result}`);
    if (classification.routing) lines.push(`Routing recommendation: ${classification.routing}`);
    if (classification.routingRationale) lines.push(`Routing rationale: ${classification.routingRationale}`);
    lines.push("");
  }
  if (meetingReady?.decisionQuestions?.length) {
    lines.push("Decision questions:");
    meetingReady.decisionQuestions.forEach((q: string, i: number) => lines.push(`${i + 1}. ${q}`));
    lines.push("");
  }
  if (meetingReady?.motionTemplate) {
    lines.push("Motion template:");
    lines.push(meetingReady.motionTemplate);
    lines.push("");
  }
  if (meetingReady?.monitoringProposal) {
    lines.push("Monitoring proposal:");
    lines.push(meetingReady.monitoringProposal);
    lines.push("");
  }
  if (meetingReady?.notes) {
    lines.push("Notes:");
    lines.push(meetingReady.notes);
    lines.push("");
  }
  return lines.join("\n");
}

async function copyAgendaPacket() {
  const text = formatAgendaPacket({ scenario: q.trim(), classification: result, meetingReady });
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied agenda packet text.");
  } catch {
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    alert("Copied agenda packet text.");
  }
}


