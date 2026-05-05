"use client";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) router.push("/dashboard");
      else router.push("/login");
    }
  }, [user, loading]);

  return (
    <div style={{
      minHeight: "100vh", background: "#0c0f0a",
      display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", gap: 12
    }}>
      <div style={{
        width: 36, height: 36,
        border: "2px solid rgba(126,186,90,0.2)",
        borderTopColor: "#7eba5a",
        borderRadius: "50%",
        animation: "spin .6s linear infinite"
      }} />
      <div style={{ fontSize: 12, color: "#6b7a63", fontFamily: "monospace" }}>
        SOVARY Compliance
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}