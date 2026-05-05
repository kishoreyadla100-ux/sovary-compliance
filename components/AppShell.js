"use client";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Spinner } from "./ui";

export default function AppShell({ children }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [firm, setFirm] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }
      if (userData?.status === "pending") {
        router.push("/pending");
        return;
      }
    }
  }, [user, userData, loading]);

  useEffect(() => {
    if (user) {
      import("@/lib/firestore").then(({ getFirm }) => {
        getFirm(user.uid)
          .then(f => {
            if (f) setFirm(f);
            else setFirm({ firmName: "SOVARY" });
          })
          .catch(() => setFirm({ firmName: "SOVARY" }));
      });
    }
  }, [user]);

  if (loading || !user || !userData) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (userData?.status === "pending") return null;

  // Trial expiry check
  const isExpired = userData?.status === "expired" ||
    (userData?.status === "trial" && userData?.trialEnd &&
      new Date() > new Date(
        userData.trialEnd?.seconds
          ? userData.trialEnd.seconds * 1000
          : userData.trialEnd
      ));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar firm={firm} />
      <main style={{
        flex: 1, marginLeft: 220, minHeight: "100vh",
        padding: "32px 32px 80px",
        maxWidth: "calc(100vw - 220px)"
      }} className="main-content">

        {/* Trial expired banner */}
        {isExpired && userData?.role !== "admin" && (
          <div style={{
            background: "rgba(224,92,92,0.08)",
            border: "1px solid rgba(224,92,92,0.3)",
            borderRadius: 10, padding: "14px 18px", marginBottom: 20,
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: 10,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>
                ⚠ Trial Expired
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                Your 3-week free trial has ended. Upgrade to continue.
              </div>
            </div>
            <a href="mailto:kishoreyadla100@gmail.com?subject=SOVARY Upgrade Request"
              style={{
                background: "var(--accent)", color: "#0c0f0a",
                borderRadius: 7, padding: "8px 16px",
                fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}>
              Upgrade ₹1,999/mo
            </a>
          </div>
        )}

        {children}
      </main>

      <style jsx global>{`
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            max-width: 100vw !important;
            padding: 20px 16px 80px !important;
          }
        }
      `}</style>
    </div>
  );
}