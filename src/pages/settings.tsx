import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [name, setName] = useState("My Board");
  const [lcmsMode, setLcmsMode] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/org").then(r => r.json()).then(d => {
      setName(d?.name ?? "My Board");
      setLcmsMode(Boolean(d?.lcmsMode));
    });
  }, []);

  async function save() {
    setBusy(true);
    try {
      await fetch("/api/org", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, lcmsMode }),
      });
      alert("Saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Settings</h2>

      <label style={{ display: "block", marginBottom: 10 }}>
        <div style={{ fontSize: 12, opacity: 0.75 }}>Organization name</div>
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", borderRadius: 10, border: "1px solid #ccc", padding: 10 }} />
      </label>

      <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <input type="checkbox" checked={lcmsMode} onChange={(e) => setLcmsMode(e.target.checked)} />
        <div>
          <div style={{ fontWeight: 600 }}>LCMS Congregation mode</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            Adds LCMS polity-aware guardrails (Synod advisory, dispute resolution, district supervision).
          </div>
        </div>
      </label>

      <button onClick={save} disabled={busy} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #ccc", background: "white" }}>
        {busy ? "…" : "Save settings"}
      </button>
    </div>
  );
}
