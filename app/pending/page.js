"use client";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PendingPage() {
  const { user, userData, logout, refreshUserData } = useAuth();
  const router = useRouter();

  // Check every 30 seconds if approved
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshUserData();
      if (userData?.status === "active" || userData?.status === "trial") {
        router.push("/dashboard");
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [userData]);

  return (
    <div style={{
      minHeight: "100vh", background: "#0b0e09",
      display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Inter, sans-serif", padding: 20
    }}>
      <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>⏳</div>

        <div style={{
          fontFamily: "DM Serif Display, serif",
          fontSize: 26, color: "#e8ede2", marginBottom: 12
        }}>
          Awaiting Approval
        </div>

        <div style={{
          fontSize: 13, color: "#606b56",
          lineHeight: 1.7, marginBottom: 28
        }}>
          Your account <strong style={{ color: "#e8ede2" }}>{user?.email}</strong> has
          been registered and is pending admin approval.
          This page checks automatically every 30 seconds.
        </div>

        <div style={{
          background: "#111408",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12, padding: "18px 20px",
          marginBottom: 20, textAlign: "left"
        }}>
          <div style={{ fontSize: 12, color: "#606b56", marginBottom: 10 }}>
            Contact for faster approval:
          </div>
          <div style={{ fontSize: 13, color: "#e8ede2", marginBottom: 6 }}>
            📧 kishoreyadla100@gmail.com
          </div>
          <div style={{ fontSize: 13, color: "#e8ede2", marginBottom: 6 }}>
            📱 WhatsApp: +91 93918 58013
          </div>
          <div style={{ fontSize: 11, color: "#606b56", marginTop: 8 }}>
            Mention your registered email for faster processing.
          </div>
        </div>

        {/* Checking indicator */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8,
          fontSize: 12, color: "#606b56", marginBottom: 20
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#7eba5a",
            animation: "pulse 2s ease-in-out infinite"
          }} />
          Checking approval status automatically…
        </div>

        <button onClick={logout} style={{
          background: "transparent", color: "#606b56",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "10px 24px",
          fontSize: 13, cursor: "pointer",
          fontFamily: "Inter, sans-serif"
        }}>
          Sign Out
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}