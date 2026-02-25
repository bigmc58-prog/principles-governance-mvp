import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 700 }}>Principles-Based Governance</div>
          <div style={{ fontSize: 12, opacity: 0.75 }}>MVP</div>
        </div>
        <nav style={{ display: "flex", gap: 12, fontSize: 14 }}>
          <a href="/">Coach</a>
          <a href="/qa">Q&A</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>
      <Component {...pageProps} />
      <footer style={{ marginTop: 32, fontSize: 12, opacity: 0.7 }}>
        MVP starter • No operational advice • Governance-level guidance only
      </footer>
    </div>
  );
}
