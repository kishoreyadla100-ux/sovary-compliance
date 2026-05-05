"use client";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0f0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
      padding: 20,
    }}>
      <div style={{ textAlign: "center" }}>

        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>

        <div style={{
          fontFamily: "DM Serif Display, serif",
          fontSize: 24,
          color: "#e8ede4",
          marginBottom: 8,
        }}>
          Something went wrong
        </div>

        <div style={{
          fontSize: 13,
          color: "#6b7a63",
          marginBottom: 24,
          maxWidth: 360,
          lineHeight: 1.6,
        }}>
          {error?.message || "An unexpected error occurred. Please try again."}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={() => window.location.href = "/"} style={{
            background: "transparent",
            color: "#6b7a63",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}>
            Go Home
          </button>
          <button onClick={reset} style={{
            background: "#7eba5a",
            color: "#0c0f0a",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "Inter, sans-serif",
          }}>
            Try Again
          </button>
        </div>

      </div>
    </div>
  );
}