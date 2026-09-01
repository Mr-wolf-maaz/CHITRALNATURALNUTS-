"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a1f17",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>This page couldn&apos;t load</h1>
          <p style={{ marginTop: 8, fontSize: 14, color: "#98bda9" }}>
            Something went wrong on our end — it&apos;s usually temporary.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 20,
              borderRadius: 9999,
              background: "#d97706",
              color: "#0a1f17",
              padding: "10px 24px",
              fontWeight: 800,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: 1,
              border: "none",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
