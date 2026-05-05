"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
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
        <div style={{
          fontFamily: "DM Serif Display, serif",
          fontSize: 80,
          color: "#7eba5a",
          lineHeight: 1,
        }}>404</div>
        <div style={{
          fontFamily: "DM Serif Display, serif",
          fontSize: 24,
          color: "#e8ede4",
          marginTop: 12,
        }}>Page not found</div>
        <div style={{
          fontSize: 13,
          color: "#6b7a63",
          marginTop: 8,
          marginBottom: 28,
        }}>
          The page you're looking for doesn't exist.
        </div>
        <button onClick={() => router.push("/dashboard")} style={{
          background: "#7eba5a",
          color: "#0c0f0a",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
        }}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}